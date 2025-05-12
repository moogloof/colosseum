# Twitter Engagement Betting Chrome Extension

A Chrome extension that allows users to bet on Twitter post engagement (likes and reposts) using the Solana blockchain.

## Features

- Place bets on Twitter post engagement metrics
- Store bets on Solana blockchain
- Track bet outcomes automatically
- Modern and user-friendly interface
- Real-time engagement tracking

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from this project

## Usage

1. Navigate to any Twitter post
2. Click the "🎲 Bet" button that appears below the tweet
3. Enter your predictions for likes and reposts
4. Enter your stake amount in SOL
5. Click "Place Bet" to submit your bet

## Requirements

- Chrome browser
- Solana wallet (Phantom recommended)
- Twitter account
- SOL tokens for betting

## Development

To run the extension in development mode:

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

## Security

- All bets are stored on the Solana blockchain
- Private keys are never stored in the extension
- All transactions are signed locally

## License

MIT 