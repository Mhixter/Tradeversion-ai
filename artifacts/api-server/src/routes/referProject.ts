import { type NextFunction, type Request, type Response, Router } from "express";
import { referProjectService } from "../lib/refer-project/service";
import type { AiSignalInput, TradeDirection } from "../lib/refer-project/types";

declare global {
  namespace Express {
    interface Request {
      referProjectCompanyId?: string;
    }
  }
}

const router = Router();

function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const current = requests.get(key);

    if (!current || now > current.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    current.count += 1;
    next();
  };
}

const referProjectRateLimiter = createRateLimiter(120, 60_000);

async function requireReferProjectAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const context = await referProjectService.getCompanyContext(req.user.id);
  if (!context) {
    res.status(404).json({ error: "Company not found" });
    return;
  }

  if (!context.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  req.referProjectCompanyId = context.companyId;
  next();
}

router.use("/refer-project", referProjectRateLimiter, requireReferProjectAdmin);

router.get("/refer-project/settings", async (req, res) => {
  res.json(await referProjectService.getSettings(req.referProjectCompanyId!));
});

router.patch("/refer-project/settings", async (req, res) => {
  const settings = await referProjectService.updateSettings(req.referProjectCompanyId!, req.body ?? {});
  res.json(settings);
});

router.get("/refer-project/dashboard", async (req, res) => {
  const [dashboard, volume] = await Promise.all([
    referProjectService.getDashboard(req.referProjectCompanyId!),
    referProjectService.getVolumeTracking(req.referProjectCompanyId!),
  ]);

  res.json({ ...dashboard, volume });
});

router.get("/refer-project/accounts", async (req, res) => {
  res.json(await referProjectService.listAccounts(req.referProjectCompanyId!));
});

router.post("/refer-project/accounts", async (req, res) => {
  const created = await referProjectService.createAccount(req.referProjectCompanyId!, {
    accountName: req.body.accountName,
    mt5Login: req.body.mt5Login,
    password: req.body.password,
    server: req.body.server,
    brokerName: req.body.brokerName,
    accountType: req.body.accountType,
    leverage: req.body.leverage,
  });

  res.status(201).json(created);
});

router.patch("/refer-project/accounts/:id", async (req, res) => {
  const account = await referProjectService.updateAccount(req.referProjectCompanyId!, req.params.id, req.body ?? {});
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  res.json(account);
});

router.delete("/refer-project/accounts/:id", async (req, res) => {
  await referProjectService.removeAccount(req.referProjectCompanyId!, req.params.id);
  res.json({ ok: true });
});

router.post("/refer-project/accounts/:id/start", async (req, res) => {
  const result = await referProjectService.startAccount(req.referProjectCompanyId!, req.params.id);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

router.post("/refer-project/accounts/:id/stop", async (req, res) => {
  res.json(await referProjectService.stopAccount(req.referProjectCompanyId!, req.params.id));
});

router.post("/refer-project/accounts/:id/reconnect", async (req, res) => {
  await referProjectService.reconnectAccount(req.referProjectCompanyId!, req.params.id);
  res.json({ ok: true });
});

router.get("/refer-project/trading-rules", async (req, res) => {
  const settings = await referProjectService.getSettings(req.referProjectCompanyId!);
  res.json({
    broker: "XM",
    platform: "MT5",
    accountType: "Ultra Low Standard",
    leverage: "1:1000",
    lotSize: settings.lotSize,
    directionMode: settings.directionMode,
    noHedgeOnSameSymbol: true,
    allowSameDirectionMultiPositions: true,
  });
});

router.get("/refer-project/ai-engine", async (req, res) => {
  res.json(await referProjectService.getAiOverview(req.referProjectCompanyId!));
});

router.post("/refer-project/trades/simulate-open", async (req, res) => {
  const direction = (req.body.direction ?? "BUY") as TradeDirection;
  const aiSignals: AiSignalInput = {
    trend: Number(req.body.aiSignals?.trend ?? 80),
    momentum: Number(req.body.aiSignals?.momentum ?? 70),
    volatility: Number(req.body.aiSignals?.volatility ?? 68),
    spread: Number(req.body.aiSignals?.spread ?? 20),
    supportResistance: Number(req.body.aiSignals?.supportResistance ?? 72),
    recentCandles: Number(req.body.aiSignals?.recentCandles ?? 75),
    atr: Number(req.body.aiSignals?.atr ?? 70),
    movingAverages: Number(req.body.aiSignals?.movingAverages ?? 78),
    rsi: Number(req.body.aiSignals?.rsi ?? 74),
    macd: Number(req.body.aiSignals?.macd ?? 73),
    marketStructure: Number(req.body.aiSignals?.marketStructure ?? 76),
  };

  const result = await referProjectService.openTrade(req.referProjectCompanyId!, {
    accountId: req.body.accountId,
    symbol: req.body.symbol ?? "EURUSD",
    direction,
    spread: Number(req.body.spread ?? 15),
    aiSignals,
  });

  res.json(result);
});

router.post("/refer-project/trades/:id/close", async (req, res) => {
  const accountId = String(req.body.accountId ?? "");
  if (!accountId) {
    res.status(400).json({ error: "accountId is required" });
    return;
  }

  const trade = await referProjectService.closeTrade(req.referProjectCompanyId!, req.params.id, accountId, "MANUAL_CLOSE");
  res.json(trade);
});

router.get("/refer-project/trades/monitor", async (req, res) => {
  res.json(await referProjectService.getTradeMonitor(req.referProjectCompanyId!));
});

router.get("/refer-project/statistics", async (req, res) => {
  const [statistics, volume] = await Promise.all([
    referProjectService.getStatistics(req.referProjectCompanyId!),
    referProjectService.getVolumeTracking(req.referProjectCompanyId!),
  ]);

  res.json({ ...statistics, volume });
});

router.get("/refer-project/logs", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 200), 1), 500);
  res.json(await referProjectService.getLogs(req.referProjectCompanyId!, limit));
});

export default router;
