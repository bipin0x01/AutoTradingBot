# Stop Limit Order Script with TP and SL

## Overview

This script allows users to place a stop limit order with take profit (TP) and stop loss (SL) on various cryptocurrency exchanges using the `ccxt` library. It utilizes the `dotenv` library for environment variable management and `winston` for logging.

## Prerequisites

- Node.js installed on your machine
- API keys and secrets for the desired exchanges
- Environment variables set in a `.env` file
- Dependencies installed via npm

## Installation

1. **Install Dependencies:**

   Run the following command to install the required libraries:

   ```sh
   npm install ccxt dotenv winston
   ```

2. **Set Up Environment Variables:**

   Create a `.env` file in the root directory of your project and add your API credentials:

   ```env
   COINBASEPRO_API_KEY=your_coinbasepro_api_key
   COINBASEPRO_API_SECRET=your_coinbasepro_api_secret
   COINBASEPRO_API_PASSPHRASE=your_coinbasepro_api_passphrase

   BINANCEUS_API_KEY=your_binanceus_api_key
   BINANCEUS_API_SECRET=your_binanceus_api_secret

   BYBIT_API_KEY=your_bybit_api_key
   BYBIT_API_SECRET=your_bybit_api_secret
   ```

## Terminologies

- **Stop Limit Order:** An order to buy or sell a stock once the price reaches a specified stop price. Once the stop price is reached, the stop limit order becomes a limit order to buy or sell at a specified price.
- **Take Profit (TP):** An order to close a position at a specified profit level.
- **Stop Loss (SL):** An order to close a position at a specified loss level to prevent further losses.
- **API Key, Secret, Passphrase:** Credentials required to authenticate with the exchange's API.

## How the Script Works

1. **Import Required Libraries:** The script imports the necessary libraries including `ccxt` for interacting with cryptocurrency exchanges, `dotenv` for loading environment variables, and `winston` for logging.

2. **Load Environment Variables:** Environment variables are loaded from a `.env` file to securely manage API credentials.

3. **Configure Logger:** The script sets up the `winston` logger to log information to both the console and a file named `trade.log`.

4. **Exchange Name to ID Mapping:** A mapping of exchange names to their corresponding IDs in `ccxt` is created to simplify the process of selecting the correct exchange.

5. **Function to Place Stop Limit Order with TP and SL:** The core function `placeStopLimitOrder` takes the exchange name, ticker pair, buy price, stop price, take profit price, and stop loss price as parameters. It performs the following steps:
   - Identifies the correct exchange based on the provided name.
   - Retrieves the API credentials from environment variables.
   - Creates an instance of the selected exchange using `ccxt`.
   - Places a stop limit order.
   - Monitors the order status and cancels it if not executed within a specified time limit.
   - Fetches and logs the fees associated with the executed order.
   - Places take profit and stop loss orders if the initial order is executed.

## Example Usage

An example usage is provided in the script, demonstrating how to call the `placeStopLimitOrder` function with specific parameters for exchange name, ticker pair, buy price, stop price, take profit price, and stop loss price.

```typescript
const exchangeName = "coinbasepro"; // Change this to the desired exchange name
const tickerPair = "BTC/USD";
const buyPrice = 30500; // Example buy price
const stopPrice = 30000; // Example stop price
const tpPrice = 31000; // Example take profit price
const slPrice = 29500; // Example stop loss price

placeStopLimitOrder(
  exchangeName,
  tickerPair,
  buyPrice,
  stopPrice,
  tpPrice,
  slPrice
);
```

This script provides a comprehensive and automated way to manage cryptocurrency trading orders with built-in logging for better tracking and debugging.
