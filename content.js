// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTweetData') {
    const tweetData = extractTweetData();
    sendResponse(tweetData);
  }
  return true;
});

function extractTweetData() {
  // Get the current tweet URL
  const tweetUrl = window.location.href;
  
  // Extract tweet ID from URL
  const tweetIdMatch = tweetUrl.match(/\/status\/(\d+)/);
  if (!tweetIdMatch) {
    return null;
  }

  const tweetId = tweetIdMatch[1];

  // Find the tweet article element
  const tweetArticle = document.querySelector('article[data-testid="tweet"]');
  if (!tweetArticle) {
    return null;
  }

  // Extract current engagement metrics
  const metrics = {
    likes: extractMetric(tweetArticle, '[data-testid="like"]'),
    reposts: extractMetric(tweetArticle, '[data-testid="retweet"]')
  };

  return {
    id: tweetId,
    url: tweetUrl,
    currentMetrics: metrics
  };
}

function extractMetric(tweetArticle, selector) {
  const element = tweetArticle.querySelector(selector);
  if (!element) return 0;

  const text = element.textContent.trim();
  if (text.includes('K')) {
    return parseFloat(text.replace('K', '')) * 1000;
  } else if (text.includes('M')) {
    return parseFloat(text.replace('M', '')) * 1000000;
  }
  return parseInt(text) || 0;
}

// Add a button to the tweet actions
function addBetButton() {
  const tweetActions = document.querySelector('[role="group"]');
  if (!tweetActions || tweetActions.querySelector('.bet-button')) return;

  const betButton = document.createElement('button');
  betButton.className = 'bet-button';
  betButton.innerHTML = '🎲 Bet';
  betButton.style.cssText = `
    background: #1DA1F2;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    margin-left: 8px;
    cursor: pointer;
  `;

  betButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openBettingPopup' });
  });

  tweetActions.appendChild(betButton);
}

// Watch for new tweets being loaded
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      addBetButton();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 