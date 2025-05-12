// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openBettingPopup') {
    chrome.action.openPopup();
  }
});

// Initialize storage for bets
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ bets: [] });
});

// Periodically check bet outcomes
setInterval(async () => {
  const { bets } = await chrome.storage.local.get('bets');
  if (!bets || bets.length === 0) return;

  const updatedBets = await Promise.all(
    bets.map(async (bet) => {
      if (bet.resolved) return bet;

      try {
        // Fetch current tweet metrics
        const response = await fetch(`https://api.twitter.com/2/tweets/${bet.tweetId}?tweet.fields=public_metrics`, {
          headers: {
            'Authorization': `Bearer ${process.env.TWITTER_API_KEY}`
          }
        });
        const data = await response.json();

        if (data.data) {
          const metrics = data.data.public_metrics;
          const isResolved = Date.now() - bet.timestamp > 24 * 60 * 60 * 1000; // 24 hours

          if (isResolved) {
            const won = 
              Math.abs(metrics.like_count - bet.predictedLikes) <= bet.predictedLikes * 0.1 && // Within 10%
              Math.abs(metrics.retweet_count - bet.predictedReposts) <= bet.predictedReposts * 0.1;

            return {
              ...bet,
              resolved: true,
              won,
              finalMetrics: {
                likes: metrics.like_count,
                reposts: metrics.retweet_count
              }
            };
          }
        }
      } catch (error) {
        console.error('Error checking bet:', error);
      }

      return bet;
    })
  );

  // Update storage with resolved bets
  await chrome.storage.local.set({ bets: updatedBets });
}, 5 * 60 * 1000); // Check every 5 minutes 