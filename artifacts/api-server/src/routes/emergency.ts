/**
 * Emergency Controls — Kill Switch, Stop All Bots, Close All Positions, Disable Trading.
 *
 * POST /api/emergency/kill-switch/activate    — halt ALL trading immediately
 * POST /api/emergency/kill-switch/deactivate  — restore trading
 * GET  /api/emergency/status                  — current emergency state
 * POST /api/emergency/stop-all-bots           — set all bots to STOPPED
 * POST /api/emergency/start-all-bots          — restart all STOPPED bots
 * POST /api/emergency/close-all-positions     — mark all open positions closed
 * POST /api/emergency/disable-trading         — disable without kill switch
 * POST /api/emergency/enable-trading          — re-enable trading
 */

import { Router } from "express";
import { db, botsTable, positionsTable, activityLogsTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import {
  activateKillSwitch, deactivateKillSwitch,
  getLimits, setLimits, getKillSwitchReason,
} from "../lib/riskEngine";

const router = Router();

async function logActivity(action: string, description: string, severity = "critical") {
  try {
    await db.insert(activityLogsTable).values({ category: "emergency", action, description, severity, metadata: "{}" });
  } catch {}
}

router.get("/emergency/status", async (_req, res) => {
  try {
    const limits        = getLimits();
    const bots          = await db.select().from(botsTable);
    const openPositions = await db.select().from(positionsTable).where(eq(positionsTable.status, "OPEN"));
    res.json({
      killSwitchActive: limits.killSwitchActive,
      killSwitchReason: getKillSwitchReason(),
      tradingEnabled:   limits.tradingEnabled,
      runningBots:      bots.filter(b => b.status === "RUNNING").length,
      pausedBots:       bots.filter(b => b.status === "PAUSED").length,
      stoppedBots:      bots.filter(b => b.status === "STOPPED").length,
      openPositions:    openPositions.length,
      limits: {
        maxDailyLossPercent: limits.maxDailyLossPercent,
        maxDrawdownPercent:  limits.maxDrawdownPercent,
        maxOpenTrades:       limits.maxOpenTrades,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/kill-switch/activate", async (req, res) => {
  try {
    const reason = req.body?.reason ?? "Manual kill switch activation";
    activateKillSwitch(reason);

    /* Stop all running bots */
    await db.update(botsTable).set({ status: "STOPPED" }).where(eq(botsTable.status, "RUNNING"));
    await db.update(botsTable).set({ status: "STOPPED" }).where(eq(botsTable.status, "PAUSED"));

    /* Mark all open positions as force-closed */
    await db.update(positionsTable)
      .set({ status: "CLOSED", closedAt: new Date(), comment: "Emergency kill switch" })
      .where(eq(positionsTable.status, "OPEN"));

    await logActivity("KILL_SWITCH_ACTIVATED", `Kill switch activated: ${reason}`, "critical");

    res.json({ success: true, message: "Kill switch activated — all trading halted", reason });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/kill-switch/deactivate", async (req, res) => {
  try {
    deactivateKillSwitch();
    await logActivity("KILL_SWITCH_DEACTIVATED", "Kill switch deactivated — trading re-enabled", "info");
    res.json({ success: true, message: "Kill switch deactivated — trading enabled" });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/stop-all-bots", async (req, res) => {
  try {
    await db.update(botsTable).set({ status: "STOPPED" }).where(eq(botsTable.status, "RUNNING"));
    await db.update(botsTable).set({ status: "STOPPED" }).where(eq(botsTable.status, "PAUSED"));
    const bots = await db.select().from(botsTable).where(eq(botsTable.status, "STOPPED"));
    await logActivity("STOP_ALL_BOTS", `All bots stopped (${bots.length} total)`, "warning");
    res.json({ success: true, stopped: bots.length });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/start-all-bots", async (req, res) => {
  try {
    const limits = getLimits();
    if (limits.killSwitchActive) {
      res.status(400).json({ error: "Kill switch is active — deactivate it first" }); return;
    }
    await db.update(botsTable).set({ status: "RUNNING" }).where(eq(botsTable.status, "STOPPED"));
    const bots = await db.select().from(botsTable).where(eq(botsTable.status, "RUNNING"));
    await logActivity("START_ALL_BOTS", `All bots started (${bots.length} running)`, "info");
    res.json({ success: true, running: bots.length });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/close-all-positions", async (req, res) => {
  try {
    const reason = req.body?.reason ?? "Emergency close all";
    const open = await db.select().from(positionsTable).where(eq(positionsTable.status, "OPEN"));
    await db.update(positionsTable)
      .set({ status: "CLOSED", closedAt: new Date(), comment: reason })
      .where(eq(positionsTable.status, "OPEN"));
    await logActivity("CLOSE_ALL_POSITIONS", `${open.length} positions force-closed: ${reason}`, "warning");
    res.json({ success: true, closed: open.length });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/disable-trading", async (req, res) => {
  try {
    setLimits({ tradingEnabled: false });
    await logActivity("DISABLE_TRADING", "Trading disabled via emergency controls", "warning");
    res.json({ success: true, message: "Trading disabled" });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emergency/enable-trading", async (req, res) => {
  try {
    const limits = getLimits();
    if (limits.killSwitchActive) {
      res.status(400).json({ error: "Deactivate kill switch first" }); return;
    }
    setLimits({ tradingEnabled: true });
    await logActivity("ENABLE_TRADING", "Trading re-enabled", "info");
    res.json({ success: true, message: "Trading enabled" });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/emergency/limits", async (req, res) => {
  try {
    const { maxDailyLossPercent, maxDrawdownPercent, maxPositionSizeLots, maxOpenTrades, maxExposurePercent } = req.body ?? {};
    setLimits({
      ...(maxDailyLossPercent  !== undefined && { maxDailyLossPercent }),
      ...(maxDrawdownPercent   !== undefined && { maxDrawdownPercent }),
      ...(maxPositionSizeLots  !== undefined && { maxPositionSizeLots }),
      ...(maxOpenTrades        !== undefined && { maxOpenTrades }),
      ...(maxExposurePercent   !== undefined && { maxExposurePercent }),
    });
    res.json({ success: true, limits: getLimits() });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
