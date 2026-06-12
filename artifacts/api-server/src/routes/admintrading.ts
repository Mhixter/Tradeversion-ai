import { Router } from "express";
import {
  getAccount, getAllPrices, getLivePrice,
  openPosition, closePosition, closeAllPositions, resetAccount,
} from "../lib/adminTradingEngine";

const router = Router();

/* GET /api/admin-trading/account */
router.get("/admin-trading/account", (_req, res) => {
  res.json(getAccount());
});

/* GET /api/admin-trading/prices */
router.get("/admin-trading/prices", (_req, res) => {
  res.json(getAllPrices());
});

/* GET /api/admin-trading/prices/:symbol */
router.get("/admin-trading/prices/:symbol", (req, res) => {
  const price = getLivePrice(req.params.symbol.toUpperCase());
  if (!price) { res.status(404).json({ error: "Unknown symbol" }); return; }
  res.json({ symbol: req.params.symbol.toUpperCase(), price });
});

/* POST /api/admin-trading/open */
router.post("/admin-trading/open", (req, res) => {
  const { symbol, action, size, sl = 0, tp = 0, botId = null, botName = "Manual", comment = "" } = req.body ?? {};
  if (!symbol || !action || !size) {
    res.status(400).json({ error: "symbol, action, size required" });
    return;
  }
  const result = openPosition(symbol, action, parseFloat(size), parseFloat(sl), parseFloat(tp), botId, botName, comment);
  if ("error" in result) { res.status(400).json(result); return; }
  res.status(201).json(result);
});

/* POST /api/admin-trading/close/:posId */
router.post("/admin-trading/close/:posId", (req, res) => {
  const result = closePosition(req.params.posId, req.body?.comment ?? "Manual close");
  if ("error" in result) { res.status(404).json(result); return; }
  res.json(result);
});

/* POST /api/admin-trading/close-all */
router.post("/admin-trading/close-all", (_req, res) => {
  const count = closeAllPositions();
  res.json({ success: true, closed: count });
});

/* POST /api/admin-trading/reset */
router.post("/admin-trading/reset", (_req, res) => {
  resetAccount();
  res.json({ success: true, message: "Account reset to $100,000" });
});

export default router;
