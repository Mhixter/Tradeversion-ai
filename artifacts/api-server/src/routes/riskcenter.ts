import { Router } from "express";

const router = Router();

router.get("/risk/overview", async (req, res) => {
  res.json({
    riskScore: 42, riskLabel: "Moderate Risk",
    var_: 2450.75, varPercent: 2.35,
    expectedShortfall: 3870.20, expectedShortfallPercent: 3.71,
    dailyDrawdown: 1.23, dailyDrawdownPercent: 3.71,
    maxDrawdown: 4.12, maxDrawdownPercent: 4.12,
    riskRewardRatio: 2.14,
  });
});

router.get("/risk/exposure-breakdown", async (req, res) => {
  res.json([
    { assetClass: "Forex", percent: 45.30, notional: 147680.25 },
    { assetClass: "Crypto", percent: 18.60, notional: 60640.93 },
    { assetClass: "Stocks", percent: 15.20, notional: 49535.40 },
    { assetClass: "Commodities", percent: 12.10, notional: 39431.18 },
    { assetClass: "Indices", percent: 8.80, notional: 28671.49 },
  ]);
});

router.get("/risk/limits", async (req, res) => {
  res.json([
    { rule: "Daily Loss Limit", usage: 1.23, limit: 5.00, usagePercent: 24.6, status: "Safe" },
    { rule: "Max Drawdown", usage: 4.12, limit: 10.00, usagePercent: 41.2, status: "Safe" },
    { rule: "Position Size Limit", usage: 6.75, limit: 10.00, usagePercent: 67.5, status: "Safe" },
    { rule: "Exposure Limit", usage: 68.40, limit: 80.00, usagePercent: 85.5, status: "Safe" },
    { rule: "Leverage Limit", usage: 1.12, limit: 1.30, usagePercent: 86.2, status: "Safe" },
    { rule: "Concentration Limit", usage: 24.30, limit: 30.00, usagePercent: 81.0, status: "Safe" },
  ]);
});

router.patch("/risk/limits", async (req, res) => {
  res.json([
    { rule: "Daily Loss Limit", usage: 1.23, limit: req.body.maxDailyLoss || 5.00, usagePercent: 24.6, status: "Safe" },
  ]);
});

router.get("/risk/alerts", async (req, res) => {
  res.json([
    { id: 1, type: "drawdown", title: "High Drawdown Alert", message: "Account drawdown reached 4.12%", severity: "warning", time: "2m ago" },
    { id: 2, type: "exposure", title: "High Exposure Alert", message: "Total exposure is 68.40%", severity: "warning", time: "15m ago" },
    { id: 3, type: "news", title: "News Event Upcoming", message: "High impact news in 2h: NFP (USD)", severity: "info", time: "1h ago" },
    { id: 4, type: "rule", title: "Risk Rule Updated", message: "Max daily loss limit updated", severity: "info", time: "3h ago" },
  ]);
});

router.get("/risk/top-positions", async (req, res) => {
  res.json([
    { symbol: "XAUUSD", type: "BUY", size: 5.00, exposurePercent: 6.75, riskScore: 72, var_: 568.45, pnl: 1240.50 },
    { symbol: "EURUSD", type: "BUY", size: 100000, exposurePercent: 5.68, riskScore: 55, var_: 412.30, pnl: 980.25 },
    { symbol: "BTCUSD", type: "BUY", size: 0.45, exposurePercent: 4.32, riskScore: 81, var_: 798.75, pnl: 2150.30 },
    { symbol: "GBPUSD", type: "SELL", size: 8.00, exposurePercent: 3.89, riskScore: 58, var_: 287.40, pnl: -320.10 },
    { symbol: "NAS100", type: "BUY", size: 2.00, exposurePercent: 3.25, riskScore: 65, var_: 256.80, pnl: 540.40 },
  ]);
});

router.get("/risk/stress-tests", async (req, res) => {
  res.json([
    { scenario: "Market Crash", marketMove: "-20% across all assets", impactOnEquity: -28450.30, impactPercent: -13.18, newEquity: 187292.95, riskLevel: "High" },
    { scenario: "Crypto Crash", marketMove: "-30% on crypto assets", impactOnEquity: -8740.50, impactPercent: -4.05, newEquity: 207002.75, riskLevel: "Moderate" },
    { scenario: "Interest Rate Shock", marketMove: "+200bps rates", impactOnEquity: -6120.40, impactPercent: -2.83, newEquity: 209622.85, riskLevel: "Low" },
    { scenario: "Oil Price Spike", marketMove: "+25% oil prices", impactOnEquity: -3210.35, impactPercent: -1.49, newEquity: 212532.90, riskLevel: "Low" },
  ]);
});

router.get("/risk/summary", async (req, res) => {
  res.json({
    totalEquity: 215743.25, totalExposure: 147680.25, totalExposurePercent: 68.40,
    availableMargin: 68062.80, usedMargin: 79619.45, freeMargin: 136123.80,
    marginLevel: 271.15, openPositions: 12, riskScore: 42, riskLabel: "Moderate",
  });
});

export default router;
