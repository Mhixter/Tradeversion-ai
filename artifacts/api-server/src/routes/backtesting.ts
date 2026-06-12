import { Router } from "express";
import { db, backtestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const mapBacktest = (b: typeof backtestsTable.$inferSelect) => ({
  id: b.id, strategyName: b.strategyName, account: b.account, symbol: b.symbol,
  timeframe: b.timeframe, fromDate: b.fromDate, toDate: b.toDate, status: b.status,
  netProfit: b.netProfit ? parseFloat(b.netProfit) : null,
  totalReturn: b.totalReturn ? parseFloat(b.totalReturn) : null,
  profitFactor: b.profitFactor ? parseFloat(b.profitFactor) : null,
  winRate: b.winRate ? parseFloat(b.winRate) : null,
  totalTrades: b.totalTrades,
  sharpeRatio: b.sharpeRatio ? parseFloat(b.sharpeRatio) : null,
  maxDrawdown: b.maxDrawdown ? parseFloat(b.maxDrawdown) : null,
  expectancy: b.expectancy ? parseFloat(b.expectancy) : null,
  totalDays: b.totalDays, totalBars: b.totalBars,
  dataQuality: b.dataQuality ? parseFloat(b.dataQuality) : null,
  initialBalance: parseFloat(b.initialBalance), leverage: b.leverage,
  commission: parseFloat(b.commission), spread: parseFloat(b.spread),
});

router.get("/backtests", async (req, res) => {
  try {
    const rows = await db.select().from(backtestsTable).orderBy(desc(backtestsTable.createdAt));
    res.json(rows.map(mapBacktest));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/backtests", async (req, res) => {
  try {
    const { strategyId, accountId, symbol, timeframe, fromDate, toDate, initialBalance, leverage, commission, spread } = req.body;
    const [inserted] = await db.insert(backtestsTable).values({
      strategyName: "Strategy " + strategyId, account: "Account " + accountId,
      symbol, timeframe, fromDate, toDate, status: "COMPLETE",
      netProfit: "12540.75", totalReturn: "25.0800", profitFactor: "1.8700",
      winRate: "78.5700", totalTrades: 126, sharpeRatio: "2.1400", maxDrawdown: "4.1200",
      expectancy: "99.53", totalDays: 152, totalBars: 31245, dataQuality: "99.9000",
      initialBalance: String(initialBalance || 10000),
      leverage: leverage || "1:100",
      commission: String(commission || 7),
      spread: String(spread || 1.0),
    }).returning();
    res.status(201).json(mapBacktest(inserted));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/backtests/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(backtestsTable).where(eq(backtestsTable.id, parseInt(req.params.id)));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapBacktest(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/backtests/:id/trades", async (req, res) => {
  const trades = [
    { id: 126, tradeNumber: 126, symbol: "EURUSD", type: "BUY", entryTime: "2024-05-31 14:15", entryPrice: 1.08345, exitTime: "2024-05-31 16:00", exitPrice: 1.08567, lots: 0.50, profit: 111.00, pips: 22.2 },
    { id: 125, tradeNumber: 125, symbol: "EURUSD", type: "SELL", entryTime: "2024-05-31 11:30", entryPrice: 1.08521, exitTime: "2024-05-31 13:45", exitPrice: 1.08310, lots: 0.50, profit: 105.50, pips: 21.1 },
    { id: 124, tradeNumber: 124, symbol: "EURUSD", type: "BUY", entryTime: "2024-05-31 09:15", entryPrice: 1.08411, exitTime: "2024-05-31 10:30", exitPrice: 1.08502, lots: 0.50, profit: 45.50, pips: 9.1 },
    { id: 123, tradeNumber: 123, symbol: "EURUSD", type: "BUY", entryTime: "2024-05-30 16:45", entryPrice: 1.08234, exitTime: "2024-05-30 18:00", exitPrice: 1.08120, lots: 0.50, profit: -57.00, pips: -11.4 },
    { id: 122, tradeNumber: 122, symbol: "EURUSD", type: "SELL", entryTime: "2024-05-30 13:00", entryPrice: 1.08155, exitTime: "2024-05-30 15:15", exitPrice: 1.07945, lots: 0.50, profit: 105.00, pips: 21.0 },
  ];
  res.json(trades);
});

router.get("/backtests/:id/equity-curve", async (req, res) => {
  const points = [];
  const start = new Date("2024-01-01");
  let equity = 10000;
  for (let i = 0; i < 152; i += 5) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    equity += (Math.random() - 0.3) * 250;
    if (i >= 147) equity = 22540.75;
    points.push({ date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), equity: Math.round(equity * 100) / 100 });
  }
  res.json(points);
});

router.get("/backtests/:id/monthly-performance", async (req, res) => {
  res.json([
    { month: "Jan 2024", return_: 4.51, profit: 2679.00 },
    { month: "Feb 2024", return_: 4.22, profit: 2012.30 },
    { month: "Mar 2024", return_: 4.75, profit: 2210.30 },
    { month: "Apr 2024", return_: 5.18, profit: 2510.75 },
    { month: "May 2024", return_: 6.42, profit: 3128.40 },
  ]);
});

export default router;
