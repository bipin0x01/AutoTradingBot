import ccxt, { Trade } from "ccxt";
import dotenv from "dotenv";
import winston from "winston";

// Load environment variables from .env file
dotenv.config();

// Configure winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "trade.log" }),
  ],
});

// Mapping of exchange names to their corresponding IDs in ccxt
const exchangeNameToIdMap: { [key: string]: string } = {
  coinbase: "coinbasepro",
  binance: "binanceus",
  bybit: "bybit",
  // Add other exchanges as needed
};

// Function to place a stop limit order with TP and SL
export async function placeStopLimitOrder(
  exchangeName: string,
  tickerPair: string,
  buyPrice: number,
  stopPrice: number,
  tpPrice: number,
  slPrice: number
) {
  const exchangeId = exchangeNameToIdMap[exchangeName.toLowerCase()];
  if (!exchangeId) {
    throw new Error(`Unsupported exchange: ${exchangeName}`);
  }

  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const apiSecret = process.env[`${exchangeId.toUpperCase()}_API_SECRET`];
  const apiPassphrase =
    process.env[`${exchangeId.toUpperCase()}_API_PASSPHRASE`];

  if (!apiKey || !apiSecret || !apiPassphrase) {
    throw new Error("API credentials are missing in environment variables.");
  }

  //   @ts-ignore
  const exchange = new ccxt[exchangeId]({
    apiKey,
    secret: apiSecret,
    password: apiPassphrase,
  });

  const side = "buy";
  const amount = 0.01; // Adjust the amount as needed
  const timeLimit = 300 * 1000; // 5 minutes in milliseconds

  try {
    logger.info(
      `Placing stop limit order on ${exchangeName} for ${tickerPair}`
    );

    // Place the stop limit order
    const order = await exchange.createOrder(
      tickerPair,
      "stop_limit",
      side,
      amount,
      buyPrice,
      { stopPrice }
    );

    logger.info(`Order placed: ${JSON.stringify(order)}`);

    const startTime = Date.now();
    let orderFilled = false;

    // Monitor the order status
    while (Date.now() - startTime < timeLimit) {
      await new Promise((res) => setTimeout(res, 10000)); // Wait for 10 seconds
      const orderStatus = await exchange.fetchOrder(order.id, tickerPair);

      if (orderStatus.status === "closed") {
        logger.info(`Order executed: ${JSON.stringify(orderStatus)}`);
        orderFilled = true;
        break;
      } else {
        logger.info(`Order status: ${orderStatus.status}`);
      }
    }

    if (!orderFilled) {
      logger.info(
        "Order not executed within the time limit, canceling order..."
      );
      await exchange.cancelOrder(order.id, tickerPair);
    }

    // Fetch fees
    if (orderFilled) {
      const trades = await exchange.fetchMyTrades(tickerPair);
      const relevantTrades = trades.filter(
        (trade: Trade) => trade.order === order.id
      );
      const totalFee = relevantTrades.reduce(
        (acc: any, trade: Trade) => acc + (trade.fee?.cost ?? 0),
        0
      );
      const feeCurrency = relevantTrades[0]?.fee?.currency || "unknown";
      logger.info(`Total fees for the order: ${totalFee} ${feeCurrency}`);

      // Place TP and SL orders
      const tpOrder = await exchange.createOrder(
        tickerPair,
        "limit",
        side === "buy" ? "sell" : "buy",
        amount,
        tpPrice
      );
      const slOrder = await exchange.createOrder(
        tickerPair,
        "stop_limit",
        side === "buy" ? "sell" : "buy",
        amount,
        slPrice,
        { stopPrice: slPrice }
      );
      logger.info(`Take profit order placed: ${JSON.stringify(tpOrder)}`);
      logger.info(`Stop loss order placed: ${JSON.stringify(slOrder)}`);
    }
  } catch (error) {
    logger.error(`Error placing order: ${error}`);
  }
}
