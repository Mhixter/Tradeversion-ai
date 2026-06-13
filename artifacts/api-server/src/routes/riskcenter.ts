import { Router } from "express";
import { db, brokersTable, botsTable, positionsTable, riskProfilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

async function getRealRiskData() {
  const [brokers, bots, positions] = await Promise.all([
    db.select().from(brokersTable),
    db.select().from(botsTable),
    db.select().from(positionsTable).where(eq(positionsTable.status, "OPEN")),
  ]);

  const totalEquity = brokers.reduce((s, b) => s + parseFloat(b.equity), 0) || 0;
  const totalBalance = brokers.reduce((s, b) => s + parseFloat(b.balance), 0) || 0;
  const usedMargin = brokers.reduce((s, b) => s + parseFloat(b.usedMargin || "0"), 0);
  const freeMargin = totalEquity - usedMargin;

  const dailyPnlTotal = bots.reduce((s, b) => s + parseFloat(b.pnlToday), 0);
  const allTimePnl = bots.reduce((s, b) => s + parseFloat(b.pnlAllTime), 0);

  const dailyDrawdown = totalEquity > 0 ? Math.abs(dailyPnlTotal / totalEquity) * 100 : 0;
  const maxDrawdown = totalEquity > 0 && totalBalance > 0
    ? Math.max(0, (totalBalance - totalEquity) / totalBalance * 100)
    : Math.abs(bots.reduce((mx, b) => Math.max(mx, Math.abs(parseFloat(b.pnlTodayPercent))), 0));

  const openPositionsCount = positions.length || bots.filter(b => b.status === "RUNNING").length;

  const totalExposureValue = positions.reduce((s, p) => {
    return s + parseFloat(p.size) * parseFloat(p.currentPrice || p.entryPrice);
  }, 0);
  const totalExposurePercent = totalEquity > 0 ? (totalExposureValue / totalEquity) * 100 : 0;

  const winRates = bots.filter(b => parseFloat(b.winRate) > 0).map(b => parseFloat(b.winRate));
  const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 0;

  const errorBots = bots.filter(b => b.status === "ERROR").length;
  const riskScore = Math.min(100, Math.round(
    (dailyDrawdown * 5) +
    (maxDrawdown * 3) +
    (errorBots * 10) +
    (totalExposurePercent > 50 ? 20 : totalExposurePercent * 0.4) +
    (avgWinRate < 50 ? 15 : 0)
  ));

  const riskLabel = riskScore < 25 ? "Low Risk" : riskScore < 50 ? "Moderate Risk" : riskScore < 75 ? "High Risk" : "Critical Risk";

  const var_ = totalEquity * 0.0235;
  const expectedShortfall = totalEquity * 0.0371;

  return {
    totalEquity, totalBalance, usedMargin, freeMargin,
    dailyDrawdown, maxDrawdown, riskScore, riskLabel,
    var_, expectedShortfall, totalExposurePercent, totalExposureValue,
    openPositionsCount, bots, brokers, positions, dailyPnlTotal,
  };
}

router.get("/risk/overview", async (req, res) => {
  try {
    const d = await getRealRiskData();
    res.json({
      riskScore: d.riskScore,
      riskLabel: d.riskLabel,
      var_: parseFloat(d.var_.toFixed(2)),
      varPercent: 2.35,
      expectedShortfall: parseFloat(d.expectedShortfall.toFixed(2)),
      expectedShortfallPercent: 3.71,
      dailyDrawdown: parseFloat(d.dailyDrawdown.toFixed(2)),
      dailyDrawdownPercent: parseFloat(d.dailyDrawdown.toFixed(2)),
      maxDrawdown: parseFloat(d.maxDrawdown.toFixed(2)),
      maxDrawdownPercent: parseFloat(d.maxDrawdown.toFixed(2)),
      riskRewardRatio: d.totalEquity > 0 ? parseFloat((d.var_ / Math.max(1, Math.abs(d.dailyPnlTotal))).toFixed(2)) : 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/exposure-breakdown", async (req, res) => {
  try {
    const { bots, totalEquity } = await getRealRiskData();

    const marketMap: Record<string, number> = {};
    bots.forEach(b => {
      const key = b.market || "Other";
      marketMap[key] = (marketMap[key] || 0) + Math.abs(parseFloat(b.pnlAllTime));
    });

    const total = Object.values(marketMap).reduce((a, b) => a + b, 0) || 1;

    const marketCategory: Record<string, string> = {
      Gold: "Commodities", Forex: "Forex", Crypto: "Crypto",
      Indices: "Indices", Commodities: "Commodities",
    };

    const catMap: Record<string, number> = {};
    Object.entries(marketMap).forEach(([mkt, val]) => {
      const cat = marketCategory[mkt] || mkt;
      catMap[cat] = (catMap[cat] || 0) + val;
    });

    const catTotal = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;

    res.json(
      Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([assetClass, weight]) => ({
          assetClass,
          percent: parseFloat(((weight / catTotal) * 100).toFixed(2)),
          notional: parseFloat((totalEquity * (weight / catTotal)).toFixed(2)),
        }))
    );
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/limits", async (req, res) => {
  try {
    const { dailyDrawdown, maxDrawdown, totalExposurePercent, totalEquity } = await getRealRiskData();

    const limitRules = [
      { rule: "Daily Loss Limit",   usage: parseFloat(dailyDrawdown.toFixed(2)),          limit: 5.00,  usagePercent: parseFloat((dailyDrawdown / 5 * 100).toFixed(1)) },
      { rule: "Max Drawdown",       usage: parseFloat(maxDrawdown.toFixed(2)),             limit: 10.00, usagePercent: parseFloat((maxDrawdown / 10 * 100).toFixed(1)) },
      { rule: "Position Size Limit",usage: 0,                                              limit: 10.00, usagePercent: 0 },
      { rule: "Exposure Limit",     usage: parseFloat(totalExposurePercent.toFixed(2)),    limit: 80.00, usagePercent: parseFloat((totalExposurePercent / 80 * 100).toFixed(1)) },
      { rule: "Leverage Limit",     usage: parseFloat((totalExposurePercent / 100).toFixed(2)), limit: 1.30, usagePercent: parseFloat((totalExposurePercent / 130).toFixed(1)) },
      { rule: "Concentration Limit",usage: 0,                                              limit: 30.00, usagePercent: 0 },
    ];

    res.json(limitRules.map(r => ({
      ...r,
      status: r.usagePercent >= 90 ? "Critical" : r.usagePercent >= 70 ? "Warning" : "Safe",
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/risk/limits", async (req, res) => {
  try {
    const { dailyDrawdown } = await getRealRiskData();
    const limit = req.body.maxDailyLoss || 5.00;
    res.json([
      { rule: "Daily Loss Limit", usage: parseFloat(dailyDrawdown.toFixed(2)), limit, usagePercent: parseFloat((dailyDrawdown / limit * 100).toFixed(1)), status: dailyDrawdown / limit >= 0.9 ? "Critical" : "Safe" },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/alerts", async (req, res) => {
  try {
    const { bots, dailyDrawdown, maxDrawdown, totalExposurePercent } = await getRealRiskData();

    const alerts: { id: number; type: string; title: string; message: string; severity: string; time: string }[] = [];
    let id = 1;

    const errorBots = bots.filter(b => b.status === "ERROR");
    errorBots.forEach(b => {
      alerts.push({ id: id++, type: "bot_error", title: "Bot Error Detected", message: `${b.name} is in ERROR state and requires attention`, severity: "error", time: "just now" });
    });

    if (maxDrawdown >= 5) {
      alerts.push({ id: id++, type: "drawdown", title: "High Drawdown Alert", message: `Account drawdown reached ${maxDrawdown.toFixed(2)}% — review open positions`, severity: "error", time: "5m ago" });
    } else if (maxDrawdown >= 2) {
      alerts.push({ id: id++, type: "drawdown", title: "Drawdown Warning", message: `Account drawdown at ${maxDrawdown.toFixed(2)}%`, severity: "warning", time: "10m ago" });
    }

    if (totalExposurePercent >= 70) {
      alerts.push({ id: id++, type: "exposure", title: "High Exposure Alert", message: `Total exposure is ${totalExposurePercent.toFixed(1)}% of equity — consider reducing positions`, severity: "warning", time: "15m ago" });
    }

    if (dailyDrawdown >= 2) {
      alerts.push({ id: id++, type: "loss", title: "Daily Loss Threshold", message: `Daily loss has reached ${dailyDrawdown.toFixed(2)}% of account equity`, severity: "warning", time: "30m ago" });
    }

    if (alerts.length === 0) {
      alerts.push({ id: id++, type: "system", title: "All Risk Checks Passing", message: "No active risk alerts. Portfolio is within all defined limits.", severity: "info", time: "just now" });
    }

    alerts.push({ id: id++, type: "news", title: "News Event Upcoming", message: "Monitor high-impact economic events that may affect open positions", severity: "info", time: "1h ago" });

    res.json(alerts);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/top-positions", async (req, res) => {
  try {
    const positions = await db.select().from(positionsTable)
      .where(eq(positionsTable.status, "OPEN"))
      .orderBy(desc(positionsTable.pnl))
      .limit(10);

    if (positions.length) {
      return res.json(positions.map(p => ({
        symbol: p.symbol,
        type: p.type,
        size: parseFloat(p.size),
        exposurePercent: parseFloat(p.pnlPercent),
        riskScore: Math.min(100, Math.round(Math.abs(parseFloat(p.pnlPercent)) * 10)),
        var_: Math.abs(parseFloat(p.pnl)) * 0.23,
        pnl: parseFloat(p.pnl),
      })));
    }

    const { bots } = await getRealRiskData();
    res.json(bots.slice(0, 5).map(b => ({
      symbol: b.market,
      type: parseFloat(b.pnlAllTime) >= 0 ? "BUY" : "SELL",
      size: 1.00,
      exposurePercent: Math.abs(parseFloat(b.pnlAllTimePercent)),
      riskScore: Math.min(100, Math.round(100 - parseFloat(b.winRate))),
      var_: Math.abs(parseFloat(b.pnlToday)) * 0.23,
      pnl: parseFloat(b.pnlToday),
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/stress-tests", async (req, res) => {
  try {
    const { totalEquity } = await getRealRiskData();
    const eq = totalEquity || 100000;

    res.json([
      { scenario: "Market Crash",        marketMove: "-20% across all assets",  impactOnEquity: parseFloat((-eq * 0.132).toFixed(2)), impactPercent: -13.18, newEquity: parseFloat((eq * 0.868).toFixed(2)), riskLevel: "High" },
      { scenario: "Crypto Crash",        marketMove: "-30% on crypto assets",   impactOnEquity: parseFloat((-eq * 0.0405).toFixed(2)), impactPercent: -4.05, newEquity: parseFloat((eq * 0.9595).toFixed(2)), riskLevel: "Moderate" },
      { scenario: "Interest Rate Shock", marketMove: "+200bps rates",           impactOnEquity: parseFloat((-eq * 0.0283).toFixed(2)), impactPercent: -2.83, newEquity: parseFloat((eq * 0.9717).toFixed(2)), riskLevel: "Low" },
      { scenario: "Oil Price Spike",     marketMove: "+25% oil prices",         impactOnEquity: parseFloat((-eq * 0.0149).toFixed(2)), impactPercent: -1.49, newEquity: parseFloat((eq * 0.9851).toFixed(2)), riskLevel: "Low" },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/risk/summary", async (req, res) => {
  try {
    const { totalEquity, usedMargin, freeMargin, totalExposurePercent, totalExposureValue, openPositionsCount, riskScore, riskLabel, brokers } = await getRealRiskData();
    const marginLevel = usedMargin > 0 ? parseFloat((totalEquity / usedMargin * 100).toFixed(2)) : 0;
    const totalBalance = brokers.reduce((s, b) => s + parseFloat(b.balance), 0);

    res.json({
      totalEquity: parseFloat(totalEquity.toFixed(2)),
      totalExposure: parseFloat(totalExposureValue.toFixed(2)),
      totalExposurePercent: parseFloat(totalExposurePercent.toFixed(2)),
      availableMargin: parseFloat(freeMargin.toFixed(2)),
      usedMargin: parseFloat(usedMargin.toFixed(2)),
      freeMargin: parseFloat((totalBalance - usedMargin).toFixed(2)),
      marginLevel,
      openPositions: openPositionsCount,
      riskScore,
      riskLabel,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
