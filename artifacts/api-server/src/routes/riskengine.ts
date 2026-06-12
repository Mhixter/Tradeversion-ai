/**
 * Risk Engine routes — validate trades, get risk profile, score.
 * GET  /api/risk-engine/profile     — current risk profile + limits
 * POST /api/risk-engine/validate    — validate a trade request
 * GET  /api/risk-engine/score       — current risk score
 * PATCH /api/risk-engine/limits     — update risk limits
 */

import { Router } from "express";
import { db, riskProfilesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  validateTrade, getLimits, setLimits, calculateRiskScore,
  calculateDrawdown, calculateDailyLossPercent, getKillSwitchReason,
} from "../lib/riskEngine";

const router = Router();

router.get("/risk-engine/profile", async (_req, res) => {
  try {
    const limits = getLimits();
    const rows   = await db.select().from(riskProfilesTable).limit(1);
    const profile = rows[0] ?? null;

    res.json({
      limits,
      killSwitchReason: getKillSwitchReason(),
      profile: profile ? {
        id:                 profile.id,
        name:               profile.name,
        maxDailyLoss:       parseFloat(String(profile.maxDailyLoss)),
        maxDrawdown:        parseFloat(String(profile.maxDrawdown)),
        maxPositionSize:    parseFloat(String(profile.maxPositionSize)),
        maxOpenTrades:      profile.maxOpenTrades,
        maxExposurePercent: parseFloat(String(profile.maxExposurePercent)),
        maxLeverage:        parseFloat(String(profile.maxLeverage)),
        tradingEnabled:     profile.tradingEnabled,
        killSwitchActive:   profile.killSwitchActive,
        dailyLossToday:     parseFloat(String(profile.dailyLossToday)),
        currentDrawdown:    parseFloat(String(profile.currentDrawdown)),
        riskScore:          profile.riskScore,
      } : null,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/risk-engine/validate", (req, res) => {
  try {
    const { symbol, side, lots, price, stopLoss, takeProfit } = req.body ?? {};
    if (!symbol || !side || !lots || !price) {
      res.status(400).json({ error: "symbol, side, lots, price required" }); return;
    }

    /* Simulated account snapshot — in production, pull from DB */
    const account = {
      balance:    245_000,
      equity:     250_000,
      openTrades: 3,
      openLots:   0.3,
      dailyLoss:  -1_200,
      peakEquity: 260_000,
    };

    const result = validateTrade(
      { symbol, side, lots: parseFloat(lots), price: parseFloat(price), stopLoss, takeProfit },
      account,
    );

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk-engine/score", (_req, res) => {
  try {
    const limits = getLimits();
    const account = {
      balance:    245_000,
      equity:     250_000,
      openTrades: 3,
      openLots:   0.3,
      dailyLoss:  -1_200,
      peakEquity: 260_000,
    };
    const score       = calculateRiskScore(account, limits);
    const drawdown    = calculateDrawdown(account.equity, account.peakEquity);
    const dailyLossPct = calculateDailyLossPercent(account.dailyLoss, account.balance);

    res.json({
      riskScore:      score,
      riskLabel:      score < 30 ? "Low Risk" : score < 60 ? "Moderate Risk" : score < 80 ? "High Risk" : "Critical",
      drawdownPercent: parseFloat(drawdown.toFixed(2)),
      dailyLossPercent: parseFloat(dailyLossPct.toFixed(2)),
      killSwitchActive:  limits.killSwitchActive,
      tradingEnabled:    limits.tradingEnabled,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/risk-engine/limits", (req, res) => {
  try {
    const { maxDailyLossPercent, maxDrawdownPercent, maxPositionSizeLots, maxOpenTrades, maxExposurePercent, maxLeverage } = req.body ?? {};
    setLimits({
      ...(maxDailyLossPercent  !== undefined && { maxDailyLossPercent: parseFloat(maxDailyLossPercent) }),
      ...(maxDrawdownPercent   !== undefined && { maxDrawdownPercent: parseFloat(maxDrawdownPercent) }),
      ...(maxPositionSizeLots  !== undefined && { maxPositionSizeLots: parseFloat(maxPositionSizeLots) }),
      ...(maxOpenTrades        !== undefined && { maxOpenTrades: parseInt(maxOpenTrades) }),
      ...(maxExposurePercent   !== undefined && { maxExposurePercent: parseFloat(maxExposurePercent) }),
      ...(maxLeverage          !== undefined && { maxLeverage: parseFloat(maxLeverage) }),
    });
    res.json({ success: true, limits: getLimits() });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
