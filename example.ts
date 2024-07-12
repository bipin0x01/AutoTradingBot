import { placeStopLimitOrder } from "server";

// Example usage
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
