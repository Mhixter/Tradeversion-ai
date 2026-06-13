import { Router } from "express";
import { db, tradesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

/* Public trader profiles — platform-curated content */
const TRADERS = [
  { id: 1, name: "GoldMaster Pro",  strategy: "Trend Following", roi: 245.68, winRate: 78.45, drawdown: 12.34, followers: 2451, copiers: 0, copiedAmount: 0, riskScore: 4, maxDrawdown: 12.34, isVerified: true, rank: 1 },
  { id: 2, name: "Alpha Scalper",   strategy: "Scalping",         roi: 189.23, winRate: 72.18, drawdown: 15.67, followers: 1892, copiers: 0, copiedAmount: 0, riskScore: 3, maxDrawdown: 15.67, isVerified: true, rank: 2 },
  { id: 3, name: "FX Maverick",     strategy: "Swing Trading",    roi: 156.72, winRate: 76.91, drawdown: 9.21,  followers: 1321, copiers: 0, copiedAmount: 0, riskScore: 3, maxDrawdown: 9.21,  isVerified: true, rank: 3 },
  { id: 4, name: "CryptoNinja",     strategy: "Crypto Trading",   roi: 134.48, winRate: 69.33, drawdown: 18.91, followers: 982,  copiers: 0, copiedAmount: 0, riskScore: 6, maxDrawdown: 18.91, isVerified: true, rank: 4 },
  { id: 5, name: "The Algo Pro",    strategy: "Algo Trading",     roi: 118.35, winRate: 71.27, drawdown: 11.38, followers: 874,  copiers: 0, copiedAmount: 0, riskScore: 4, maxDrawdown: 11.38, isVerified: true, rank: 5 },
];

const STRATEGY_PROFILES = [
  { id: 1, name: "Trend Following", usedByTraders: 1245, avgReturn: 142.38, winRate: 74.21, riskLevel: "Medium" },
  { id: 2, name: "Scalping",        usedByTraders: 987,  avgReturn: 112.58, winRate: 71.34, riskLevel: "High" },
  { id: 3, name: "Swing Trading",   usedByTraders: 756,  avgReturn: 98.21,  winRate: 69.12, riskLevel: "Medium" },
  { id: 4, name: "Breakout",        usedByTraders: 642,  avgReturn: 87.45,  winRate: 68.42, riskLevel: "Medium" },
  { id: 5, name: "Mean Reversion",  usedByTraders: 521,  avgReturn: 76.33,  winRate: 65.83, riskLevel: "Low" },
];

router.get("/copy-trading/traders", (_req, res) => {
  res.json(TRADERS);
});

/* Following — returns traders the current user is actively copying */
router.get("/copy-trading/following", (_req, res) => {
  res.json([]);
});

/* Stats — computed from actual trades in the DB */
router.get("/copy-trading/stats", async (req, res) => {
  try {
    const trades = await db.select().from(tradesTable).orderBy(desc(tradesTable.createdAt)).limit(500);
    const profitable = trades.filter(t => parseFloat(t.profit) > 0);
    const losing     = trades.filter(t => parseFloat(t.profit) < 0);
    const totalPnl   = trades.reduce((s, t) => s + parseFloat(t.profit), 0);
    const totalInvested = 0;

    const avgWin  = profitable.length ? profitable.reduce((s, t) => s + parseFloat(t.profit), 0) / profitable.length : 0;
    const avgLoss = losing.length     ? losing.reduce((s, t) => s + parseFloat(t.profit), 0) / losing.length         : 0;
    const best    = profitable.length ? Math.max(...profitable.map(t => parseFloat(t.profit))) : 0;
    const worst   = losing.length     ? Math.min(...losing.map(t => parseFloat(t.profit)))     : 0;
    const pf      = Math.abs(avgLoss) > 0 ? parseFloat((avgWin / Math.abs(avgLoss)).toFixed(2)) : 0;

    res.json({
      totalCopiedTrades:  trades.length,
      profitableTrades:   profitable.length,
      profitablePercent:  trades.length ? parseFloat((profitable.length / trades.length * 100).toFixed(2)) : 0,
      avgWin:             parseFloat(avgWin.toFixed(2)),
      avgLoss:            parseFloat(avgLoss.toFixed(2)),
      bestTrade:          parseFloat(best.toFixed(2)),
      worstTrade:         parseFloat(worst.toFixed(2)),
      profitFactor:       pf,
      totalInvested,
      totalEquity:        totalInvested + totalPnl,
      totalPnl:           parseFloat(totalPnl.toFixed(2)),
      totalPnlPercent:    totalInvested > 0 ? parseFloat((totalPnl / totalInvested * 100).toFixed(2)) : 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/copy-trading/strategies", (_req, res) => {
  res.json(STRATEGY_PROFILES);
});

router.post("/copy-trading/:traderId/follow", (req, res) => {
  const trader = TRADERS.find(t => t.id === parseInt(req.params.traderId));
  if (!trader) { res.status(404).json({ error: "Trader not found" }); return; }
  res.json({
    id: Date.now(),
    traderName: trader.name,
    status: "RUNNING",
    roi: 0,
    equity: (req.body.allocationPercent ?? 10) * 100,
  });
});

export default router;
