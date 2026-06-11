import { Router } from "express";

const router = Router();

router.get("/copy-trading/traders", async (req, res) => {
  res.json([
    { id: 1, name: "GoldMaster Pro", strategy: "Trend Following", roi: 245.68, winRate: 78.45, drawdown: 12.34, followers: 2451, copiers: 18400000, copiedAmount: 18400000, riskScore: 4, maxDrawdown: 12.34, isVerified: true, rank: 1 },
    { id: 2, name: "Alpha Scalper", strategy: "Scalping", roi: 189.23, winRate: 72.18, drawdown: 15.67, followers: 1892, copiers: 12700000, copiedAmount: 12700000, riskScore: 3, maxDrawdown: 15.67, isVerified: true, rank: 2 },
    { id: 3, name: "FX Maverick", strategy: "Swing Trading", roi: 156.72, winRate: 76.91, drawdown: 9.21, followers: 1321, copiers: 9300000, copiedAmount: 9300000, riskScore: 3, maxDrawdown: 9.21, isVerified: true, rank: 3 },
    { id: 4, name: "CryptoNinja", strategy: "Crypto Trading", roi: 134.48, winRate: 69.33, drawdown: 18.91, followers: 982, copiers: 6800000, copiedAmount: 6800000, riskScore: 6, maxDrawdown: 18.91, isVerified: true, rank: 4 },
    { id: 5, name: "The Algo Pro", strategy: "Algo Trading", roi: 118.35, winRate: 71.27, drawdown: 11.38, followers: 874, copiers: 5100000, copiedAmount: 5100000, riskScore: 4, maxDrawdown: 11.38, isVerified: true, rank: 5 },
  ]);
});

router.get("/copy-trading/following", async (req, res) => {
  res.json([
    { id: 1, traderName: "GoldMaster Pro", status: "RUNNING", roi: 245.68, equity: 2450.75 },
    { id: 2, traderName: "Alpha Scalper", status: "RUNNING", roi: 189.23, equity: 1892.50 },
    { id: 3, traderName: "FX Maverick", status: "RUNNING", roi: 156.72, equity: 1567.20 },
  ]);
});

router.get("/copy-trading/stats", async (req, res) => {
  res.json({
    totalCopiedTrades: 482, profitableTrades: 356, profitablePercent: 73.86,
    avgWin: 45.23, avgLoss: -32.11, bestTrade: 230.45, worstTrade: -120.33,
    profitFactor: 2.14, totalInvested: 10000, totalEquity: 15743.25,
    totalPnl: 5743.25, totalPnlPercent: 57.43,
  });
});

router.get("/copy-trading/strategies", async (req, res) => {
  res.json([
    { id: 1, name: "Trend Following", usedByTraders: 1245, avgReturn: 142.38, winRate: 74.21, riskLevel: "Medium" },
    { id: 2, name: "Scalping", usedByTraders: 987, avgReturn: 112.58, winRate: 71.34, riskLevel: "High" },
    { id: 3, name: "Swing Trading", usedByTraders: 756, avgReturn: 98.21, winRate: 69.12, riskLevel: "Medium" },
    { id: 4, name: "Breakout", usedByTraders: 642, avgReturn: 87.45, winRate: 68.42, riskLevel: "Medium" },
    { id: 5, name: "Mean Reversion", usedByTraders: 521, avgReturn: 76.33, winRate: 65.83, riskLevel: "Low" },
  ]);
});

router.post("/copy-trading/:traderId/follow", async (req, res) => {
  res.json({ id: 4, traderName: "Copied Trader", status: "RUNNING", roi: 0, equity: req.body.allocationPercent * 100 });
});

export default router;
