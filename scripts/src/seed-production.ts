/**
 * Production seed: professional bots and strategies
 * Run: pnpm --filter @workspace/scripts run seed:prod
 */
import { db, botsTable, strategiesTable, brokersTable } from "@workspace/db";

const BOTS = [
  { name: "Gold Hunter AI", strategy: "AI Sentiment Trader", strategyType: "AI/ML", account: "Live MT5 #1", accountNumber: "12847392", market: "Gold", timeframe: "H1", status: "RUNNING", pnlToday: "342.80", pnlTodayPercent: "2.14", pnlAllTime: "6840.20", pnlAllTimePercent: "22.13", winRate: "76.8", isAI: true, sortOrder: 1 },
  { name: "AI Scalper Pro", strategy: "VWAP Intraday Scalper", strategyType: "Scalping", account: "Live MT5 #1", accountNumber: "12847392", market: "Forex", timeframe: "M5", status: "RUNNING", pnlToday: "128.45", pnlTodayPercent: "1.24", pnlAllTime: "4250.75", pnlAllTimePercent: "18.45", winRate: "82.4", isAI: true, sortOrder: 2 },
  { name: "Crypto Wave AI", strategy: "Bollinger Band Squeeze", strategyType: "Breakout", account: "Binance Pro", accountNumber: "CB-00421", market: "Crypto", timeframe: "H4", status: "RUNNING", pnlToday: "892.10", pnlTodayPercent: "3.82", pnlAllTime: "3120.00", pnlAllTimePercent: "15.22", winRate: "79.3", isAI: true, sortOrder: 3 },
  { name: "AI Momentum", strategy: "MACD Momentum Surge", strategyType: "Momentum", account: "Live MT5 #2", accountNumber: "29381047", market: "Indices", timeframe: "H1", status: "RUNNING", pnlToday: "215.60", pnlTodayPercent: "1.87", pnlAllTime: "2150.80", pnlAllTimePercent: "17.40", winRate: "81.1", isAI: true, sortOrder: 4 },
  { name: "EUR/USD Confluence", strategy: "Multi-Timeframe Confluence", strategyType: "Hybrid", account: "Live MT5 #1", accountNumber: "12847392", market: "Forex", timeframe: "H1", status: "RUNNING", pnlToday: "87.30", pnlTodayPercent: "0.92", pnlAllTime: "1840.50", pnlAllTimePercent: "14.80", winRate: "78.2", isAI: true, sortOrder: 5 },
  { name: "Mean Reversion Bot", strategy: "RSI Mean Reversion", strategyType: "Mean Reversion", account: "Live MT5 #2", accountNumber: "29381047", market: "Forex", timeframe: "M30", status: "RUNNING", pnlToday: "41.20", pnlTodayPercent: "0.51", pnlAllTime: "980.40", pnlAllTimePercent: "8.91", winRate: "71.2", isAI: false, sortOrder: 6 },
  { name: "GBP/JPY Trend", strategy: "Dual SMA Crossover", strategyType: "Trend Following", account: "Live MT5 #2", accountNumber: "29381047", market: "Forex", timeframe: "H4", status: "PAUSED", pnlToday: "0", pnlTodayPercent: "0", pnlAllTime: "720.30", pnlAllTimePercent: "6.12", winRate: "64.8", isAI: false, sortOrder: 7 },
  { name: "S&P 500 Scalper", strategy: "VWAP Intraday Scalper", strategyType: "Scalping", account: "Interactive Brokers", accountNumber: "IB-94821", market: "Indices", timeframe: "M1", status: "RUNNING", pnlToday: "310.75", pnlTodayPercent: "2.43", pnlAllTime: "4920.60", pnlAllTimePercent: "21.30", winRate: "69.4", isAI: false, sortOrder: 8 },
  { name: "Bitcoin Fibonacci", strategy: "Fibonacci Retracement Bot", strategyType: "Support/Resistance", account: "Binance Pro", accountNumber: "CB-00421", market: "Crypto", timeframe: "D1", status: "STOPPED", pnlToday: "0", pnlTodayPercent: "0", pnlAllTime: "2840.10", pnlAllTimePercent: "28.40", winRate: "68.0", isAI: false, sortOrder: 9 },
  { name: "XAU News Trader", strategy: "AI Sentiment Trader", strategyType: "AI/ML", account: "Live MT5 #1", accountNumber: "12847392", market: "Gold", timeframe: "H1", status: "RUNNING", pnlToday: "0", pnlTodayPercent: "0", pnlAllTime: "1340.80", pnlAllTimePercent: "11.20", winRate: "72.6", isAI: true, sortOrder: 10 },
  { name: "Oil Range Bot", strategy: "Bollinger Band Squeeze", strategyType: "Breakout", account: "Live MT5 #2", accountNumber: "29381047", market: "Commodities", timeframe: "H4", status: "ERROR", pnlToday: "-85.40", pnlTodayPercent: "-1.12", pnlAllTime: "-340.20", pnlAllTimePercent: "-3.12", winRate: "58.3", isAI: false, sortOrder: 11 },
  { name: "ETH DCA Bot", strategy: "RSI Mean Reversion", strategyType: "Mean Reversion", account: "Binance Pro", accountNumber: "CB-00421", market: "Crypto", timeframe: "H4", status: "STOPPED", pnlToday: "0", pnlTodayPercent: "0", pnlAllTime: "680.50", pnlAllTimePercent: "9.40", winRate: "61.5", isAI: false, sortOrder: 12 },
];

const STRATEGIES = [
  { name: "XAUUSD H1 AI Strategy", status: "ACTIVE", market: "Gold", symbol: "XAUUSD", timeframe: "H1", description: "AI-driven sentiment analysis combined with multi-timeframe confluence for gold trading.", riskPerTrade: "1.5", takeProfit: "80", stopLoss: "40", trailingStop: "20", magicNumber: "10001" },
  { name: "EUR/USD Scalping Engine", status: "ACTIVE", market: "Forex", symbol: "EURUSD", timeframe: "M5", description: "VWAP-based scalping with ATR stops. Requires ECN broker with tight spreads.", riskPerTrade: "0.5", takeProfit: "15", stopLoss: "8", trailingStop: "5", magicNumber: "10002" },
  { name: "BTC Breakout System", status: "ACTIVE", market: "Crypto", symbol: "BTCUSDT", timeframe: "H4", description: "Bollinger Band squeeze detection with volume confirmation for crypto breakouts.", riskPerTrade: "2", takeProfit: "150", stopLoss: "60", trailingStop: "40", magicNumber: "10003" },
  { name: "SPX Momentum Rider", status: "ACTIVE", market: "Indices", symbol: "US500", timeframe: "H1", description: "MACD momentum with session-based filters. Best performance during US market open.", riskPerTrade: "1", takeProfit: "30", stopLoss: "15", trailingStop: "10", magicNumber: "10004" },
  { name: "GBP/JPY Trend Catcher", status: "DRAFT", market: "Forex", symbol: "GBPJPY", timeframe: "H4", description: "Dual SMA crossover with RSI filter on one of the most volatile Forex pairs.", riskPerTrade: "1.5", takeProfit: "120", stopLoss: "60", trailingStop: "30", magicNumber: "10005" },
  { name: "Multi-TF Confluence", status: "TESTING", market: "Forex", symbol: "EURUSD", timeframe: "H1", description: "Three-timeframe alignment strategy requiring D1+H4+H1 agreement before entry.", riskPerTrade: "1", takeProfit: "60", stopLoss: "25", trailingStop: "15", magicNumber: "10006" },
];

const BROKERS = [
  { broker: "IC Markets", platform: "MT5", server: "ICMarkets-Live01", accountNumber: "12847392", equity: "85450.75", balance: "82000.00", profit: "3450.75", profitPercent: "4.21", usedMargin: "18200.00", status: "LIVE", isConnected: true },
  { broker: "Exness", platform: "MT5", server: "Exness-Real3", accountNumber: "29381047", equity: "62340.00", balance: "59500.00", profit: "2840.00", profitPercent: "4.77", usedMargin: "12100.00", status: "LIVE", isConnected: true },
  { broker: "Deriv", platform: "MT4", server: "Deriv-Server", accountNumber: "57821034", equity: "34680.50", balance: "33200.00", profit: "1480.50", profitPercent: "4.46", usedMargin: "8400.00", status: "DEMO", isConnected: true },
  { broker: "Binance", platform: "Crypto", server: "Binance-Main", accountNumber: "CB-00421", equity: "24870.00", balance: "22000.00", profit: "2870.00", profitPercent: "13.05", usedMargin: "5000.00", status: "LIVE", isConnected: true },
  { broker: "Interactive Brokers", platform: "Stocks", server: "IBKR-Prod", accountNumber: "IB-94821", equity: "8402.00", balance: "8000.00", profit: "402.00", profitPercent: "5.03", usedMargin: "1800.00", status: "LIVE", isConnected: true },
];

async function seed() {
  console.log("🌱 Seeding production data...");

  // Bots
  const existingBots = await db.select({ id: botsTable.id }).from(botsTable).limit(1);
  if (existingBots.length === 0) {
    await db.insert(botsTable).values(BOTS);
    console.log(`✅ Inserted ${BOTS.length} bots`);
  } else {
    console.log("⏭  Bots table already has data — skipping");
  }

  // Strategies
  const existingStrategies = await db.select({ id: strategiesTable.id }).from(strategiesTable).limit(1);
  if (existingStrategies.length === 0) {
    await db.insert(strategiesTable).values(STRATEGIES);
    console.log(`✅ Inserted ${STRATEGIES.length} strategies`);
  } else {
    console.log("⏭  Strategies table already has data — skipping");
  }

  // Brokers
  const existingBrokers = await db.select({ id: brokersTable.id }).from(brokersTable).limit(1);
  if (existingBrokers.length === 0) {
    await db.insert(brokersTable).values(BROKERS);
    console.log(`✅ Inserted ${BROKERS.length} brokers`);
  } else {
    console.log("⏭  Brokers table already has data — skipping");
  }

  console.log("🎉 Done!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
