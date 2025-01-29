export const assets = [
  { symbol: "USDT", balance: "0.00000000", icon: "💵" },
  { symbol: "BNB", balance: "0.00000000", icon: "🟡" },
  { symbol: "SOL", balance: "0.00000000", icon: "💫" },
  { symbol: "BTC", balance: "0.00000000", icon: "₿" },
];

export const tradingPairs = [
  { 
    id: 1,
    baseAsset: "USDT",
    quoteAsset: "BNB",
    side: "SOLD",
    price: "0.50000",
    status: "Completed",
    date: new Date().toISOString(),
  },
  {
    id: 2,
    baseAsset: "BTC",
    quoteAsset: "USDT",
    side: "SOLD",
    price: "0.50000",
    status: "Cancelled",
    date: new Date().toISOString(),
  }
];

export const transactions = [
  {
    id: 1,
    type: "Send",
    amount: "-0.0001 BNB",
    date: "Jan 21, 2024",
    status: "Completed",
  },
  {
    id: 2,
    type: "Send", 
    amount: "-0.0001 BNB",
    date: "Jan 21, 2024",
    status: "Completed",
  }
];
