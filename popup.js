import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';

document.addEventListener('DOMContentLoaded', async () => {
  const placeBetButton = document.getElementById('placeBet');
  const statusDiv = document.getElementById('status');

  // Initialize Solana connection
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  placeBetButton.addEventListener('click', async () => {
    try {
      const likes = document.getElementById('likes').value;
      const reposts = document.getElementById('reposts').value;
      const stake = document.getElementById('stake').value;

      if (!likes || !reposts || !stake) {
        showStatus('Please fill in all fields', 'error');
        return;
      }

      // Get the current tweet URL and data
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tweetData = await chrome.tabs.sendMessage(tab.id, { action: 'getTweetData' });

      if (!tweetData) {
        showStatus('No tweet found on this page', 'error');
        return;
      }

      // Create bet data
      const betData = {
        tweetId: tweetData.id,
        predictedLikes: parseInt(likes),
        predictedReposts: parseInt(reposts),
        stakeAmount: parseFloat(stake),
        timestamp: Date.now()
      };

      // Store bet in Solana blockchain
      await placeBetOnChain(betData);

      showStatus('Bet placed successfully!', 'success');
    } catch (error) {
      showStatus(`Error: ${error.message}`, 'error');
    }
  });

  async function placeBetOnChain(betData) {
    // This is a placeholder for the actual Solana transaction
    // You would need to implement the actual smart contract interaction here
    // For now, we'll just simulate the transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }
}); 