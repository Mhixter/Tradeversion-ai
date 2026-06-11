import { Router } from "express";

const router = Router();

router.get("/portfolio/overview", async (req, res) => {
  res.json({
    totalEquity: 215743.25, netProfit: 33743.25, dailyPnl: 1245.30,
    totalReturn: 18.45, sharpeRatio: 2.14, maxDrawdown: 4.12,
    equityChange: 18.45, netProfitChange: 24.32, dailyPnlChange: 0.58, maxDrawdownChange: 0.85,
  });
});

router.get("/portfolio/equity-curve", async (req, res) => {
  const points = [];
  const start = new Date("2024-05-01");
  let equity = 182000;
  let buyHold = 152640;
  for (let i = 0; i < 31; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    equity += (Math.random() - 0.3) * 1200;
    buyHold += (Math.random() - 0.4) * 900;
    if (i === 30) equity = 215743.25;
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      equity: Math.round(equity), buyHold: Math.round(buyHold),
    });
  }
  res.json(points);
});

router.get("/portfolio/allocation", async (req, res) => {
  res.json([
    { assetClass: "Forex", percent: 42.3, amount: 91227.48 },
    { assetClass: "Crypto", percent: 26.7, amount: 57603.55 },
    { assetClass: "Stocks", percent: 15.8, amount: 34087.43 },
    { assetClass: "Commodities", percent: 8.2, amount: 17690.95 },
    { assetClass: "Indices", percent: 7.0, amount: 15001.03 },
  ]);
});

router.get("/portfolio/holdings", async (req, res) => {
  res.json([
    { symbol: "XAUUSD", asset: "Gold", type: "BUY", quantity: 5.00, avgPrice: 2320.50, currentPrice: 2450.30, marketValue: 12251.50, pnl: 649.00, pnlPercent: 5.59, allocation: 5.68 },
    { symbol: "EURUSD", asset: "Forex", type: "BUY", quantity: 100000, avgPrice: 1.07250, currentPrice: 1.08410, marketValue: 10841.00, pnl: 1160.00, pnlPercent: 1.08, allocation: 5.02 },
    { symbol: "BTCUSD", asset: "Crypto", type: "BUY", quantity: 0.45, avgPrice: 61250.00, currentPrice: 66800.00, marketValue: 30060.00, pnl: 2497.50, pnlPercent: 9.09, allocation: 13.95 },
    { symbol: "AAPL", asset: "Stocks", type: "BUY", quantity: 50, avgPrice: 168.20, currentPrice: 192.35, marketValue: 9617.50, pnl: 1207.50, pnlPercent: 14.35, allocation: 4.46 },
    { symbol: "USOIL", asset: "Commodities", type: "SELL", quantity: 10, avgPrice: 78.50, currentPrice: 76.30, marketValue: 7630.00, pnl: -220.00, pnlPercent: 2.96, allocation: 3.54 },
  ]);
});

router.get("/portfolio/top-positions", async (req, res) => {
  res.json({
    profitable: [
      { rank: 1, symbol: "XAUUSD", direction: "BUY", pnl: 4250.75, pnlPercent: 18.25 },
      { rank: 2, symbol: "EURUSD", direction: "BUY", pnl: 2980.40, pnlPercent: 12.45 },
      { rank: 3, symbol: "BTCUSD", direction: "BUY", pnl: 2540.30, pnlPercent: 15.32 },
      { rank: 4, symbol: "AAPL", direction: "BUY", pnl: 1840.75, pnlPercent: 9.28 },
      { rank: 5, symbol: "NAS100", direction: "BUY", pnl: 1230.80, pnlPercent: 7.15 },
    ],
    losing: [
      { rank: 1, symbol: "GBPUSD", direction: "SELL", pnl: -540.30, pnlPercent: -4.23 },
      { rank: 2, symbol: "USDJPY", direction: "SELL", pnl: -320.15, pnlPercent: -2.15 },
      { rank: 3, symbol: "ETHUSD", direction: "SELL", pnl: -210.40, pnlPercent: -1.93 },
      { rank: 4, symbol: "USOIL", direction: "SELL", pnl: -180.20, pnlPercent: -1.52 },
      { rank: 5, symbol: "GER40", direction: "SELL", pnl: -120.10, pnlPercent: -0.95 },
    ],
  });
});

router.get("/portfolio/monthly-performance", async (req, res) => {
  res.json([
    { year: 2021, months: [3.2, 2.7, 4.8, 6.1, 4.9, 7.2, 5.8, 3.1, -2.1, 1.5, 3.8, 5.6] },
    { year: 2022, months: [-2.1, 1.5, 5.6, -4.2, 7.8, -8.2, -3.2, 2.3, -2.3, 4.9, 6.5, 5.6] },
    { year: 2023, months: [8.5, 3.2, 6.7, -1.8, 9.3, 4.6, -3.2, 6.3, 8.9, 4.0, 6.5, 3.8] },
    { year: 2024, months: [6.2, 4.1, -2.3, 7.8, 18.4, null, null, null, null, null, null, null] },
  ]);
});

router.get("/portfolio/account-summary", async (req, res) => {
  res.json([
    { broker: "MT5 IC Markets", platform: "MT5", equity: 85450.75, profitPercent: 12.45 },
    { broker: "MT5 Exness", platform: "MT5", equity: 62340.00, profitPercent: 8.32 },
    { broker: "MT4 Deriv", platform: "MT4", equity: 34680.50, profitPercent: 15.23 },
    { broker: "Binance (Spot)", platform: "Crypto", equity: 24970.35, profitPercent: 22.14 },
    { broker: "Interactive Brokers", platform: "Stocks", equity: 8301.65, profitPercent: 6.72 },
  ]);
});

export default router;
