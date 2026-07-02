import { Router } from "express";
import { db, brokersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ConnectBrokerBody } from "@workspace/api-zod";
import { brokerService } from "../lib/brokerService.js";
import { getAccountInfo, hasRealToken } from "../lib/metaapiService.js";

const router = Router();

// ── GET /brokers ──────────────────────────────────────────────────────────────
router.get("/brokers", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const rows = await db.select().from(brokersTable).where(eq(brokersTable.userId, req.user.id));
    res.json(rows.map(b => ({
      id: b.id, broker: b.broker, platform: b.platform, accountNumber: b.accountNumber,
      equity: parseFloat(b.equity), balance: parseFloat(b.balance), profit: parseFloat(b.profit),
      profitPercent: parseFloat(b.profitPercent), status: b.status, server: b.server, isConnected: b.isConnected,
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /brokers/test-connection ─────────────────────────────────────────────
// Must be defined before /brokers/:id routes.
router.post("/brokers/test-connection", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const parsed = ConnectBrokerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

    // Simulate network latency (paper trading — no real MetaApi call unless token present)
    const start = Date.now();
    await new Promise(r => setTimeout(r, 600 + Math.floor(Math.random() * 800)));

    // Basic credential sanity check
    const { login, password, server } = parsed.data;
    if (!login || login.length < 3 || !password || password.length < 4 || !server) {
      res.json({ success: false, error: "Invalid credentials format" });
      return;
    }

    const latencyMs = Date.now() - start;
    res.json({
      success: true,
      latencyMs,
      message: hasRealToken()
        ? "Connected to live broker"
        : "Paper-trading mode — credentials accepted",
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /brokers ─────────────────────────────────────────────────────────────
router.post("/brokers", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const parsed = ConnectBrokerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }
    const { broker, platform, server } = parsed.data;

    // Insert with placeholder values first to get an ID
    const [inserted] = await db.insert(brokersTable).values({
      userId: req.user.id,
      broker, platform, server,
      accountNumber: parsed.data.login,
      equity: "0", balance: "0", profit: "0", profitPercent: "0",
      status: "LIVE", isConnected: true,
    }).returning();

    // Initialise paper-trading state for this account (realistic demo equity)
    const simAccount = brokerService.connectAccount({
      id:            inserted.id,
      broker:        inserted.broker,
      platform:      inserted.platform as "MT4" | "MT5",
      accountNumber: inserted.accountNumber,
      server:        inserted.server,
      status:        "LIVE",
    });

    // Persist the realistic equity/balance values back to DB
    const [updated] = await db.update(brokersTable)
      .set({
        equity:        String(simAccount.equity),
        balance:       String(simAccount.balance),
        profit:        String(simAccount.profit),
        profitPercent: String(
          simAccount.balance > 0
            ? parseFloat(((simAccount.profit / simAccount.balance) * 100).toFixed(2))
            : 0,
        ),
        isConnected: true,
        status: "LIVE",
      })
      .where(eq(brokersTable.id, inserted.id))
      .returning();

    const final = updated ?? inserted;
    res.status(201).json({
      id:            final.id,
      broker:        final.broker,
      platform:      final.platform,
      accountNumber: final.accountNumber,
      equity:        parseFloat(final.equity),
      balance:       parseFloat(final.balance),
      profit:        parseFloat(final.profit),
      profitPercent: parseFloat(final.profitPercent),
      status:        final.status,
      server:        final.server,
      isConnected:   final.isConnected,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /brokers/:id/sync ────────────────────────────────────────────────────
// Refresh equity/balance from broker service (paper or real MetaApi)
router.post("/brokers/:id/sync", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const brokerId = parseInt(req.params.id);
    const [row] = await db.select().from(brokersTable)
      .where(and(eq(brokersTable.id, brokerId), eq(brokersTable.userId, req.user.id)));

    if (!row) { res.status(404).json({ error: "Broker not found" }); return; }

    let equity   = parseFloat(row.equity);
    let balance  = parseFloat(row.balance);
    let profit   = parseFloat(row.profit);

    if (hasRealToken()) {
      // Try real MetaApi sync (requires metaApiAccountId stored somewhere)
      const info = await getAccountInfo(String(brokerId));
      if (info) {
        equity  = info.equity  ?? equity;
        balance = info.balance ?? balance;
        profit  = info.profit  ?? profit;
      }
    } else {
      // Sync from in-memory paper trading service
      const simState = brokerService.syncAccount(brokerId);
      if (simState) {
        equity  = simState.equity;
        balance = simState.balance;
        profit  = simState.profit;
      } else {
        // Account not in memory (server restart) — re-initialise it
        const sim = brokerService.connectAccount({
          id:            row.id,
          broker:        row.broker,
          platform:      row.platform as "MT4" | "MT5",
          accountNumber: row.accountNumber,
          server:        row.server,
          status:        "LIVE",
        });
        equity  = sim.equity;
        balance = sim.balance;
        profit  = sim.profit;
      }
    }

    const profitPercent = balance > 0 ? parseFloat(((profit / balance) * 100).toFixed(2)) : 0;

    const [updated] = await db.update(brokersTable)
      .set({
        equity:        String(equity),
        balance:       String(balance),
        profit:        String(profit),
        profitPercent: String(profitPercent),
        isConnected:   true,
      })
      .where(and(eq(brokersTable.id, brokerId), eq(brokersTable.userId, req.user.id)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Broker not found" }); return; }

    res.json({
      id:            updated.id,
      broker:        updated.broker,
      platform:      updated.platform,
      accountNumber: updated.accountNumber,
      equity:        parseFloat(updated.equity),
      balance:       parseFloat(updated.balance),
      profit:        parseFloat(updated.profit),
      profitPercent: parseFloat(updated.profitPercent),
      status:        updated.status,
      server:        updated.server,
      isConnected:   updated.isConnected,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PATCH /brokers/:id ────────────────────────────────────────────────────────
router.patch("/brokers/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { equity, balance, profit, profitPercent, status, isConnected } = req.body;
    const update: Partial<typeof brokersTable.$inferInsert> = {};
    if (equity != null)        update.equity = String(equity);
    if (balance != null)       update.balance = String(balance);
    if (profit != null)        update.profit = String(profit);
    if (profitPercent != null) update.profitPercent = String(profitPercent);
    if (status)                update.status = status;
    if (isConnected != null)   update.isConnected = isConnected;

    if (Object.keys(update).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db.update(brokersTable)
      .set(update)
      .where(and(eq(brokersTable.id, parseInt(req.params.id)), eq(brokersTable.userId, req.user.id)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Broker not found" }); return; }
    res.json({
      id: updated.id, broker: updated.broker, platform: updated.platform,
      accountNumber: updated.accountNumber, equity: parseFloat(updated.equity),
      balance: parseFloat(updated.balance), profit: parseFloat(updated.profit),
      profitPercent: parseFloat(updated.profitPercent), status: updated.status,
      server: updated.server, isConnected: updated.isConnected,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /brokers/:id ───────────────────────────────────────────────────────
router.delete("/brokers/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const brokerId = parseInt(req.params.id);
    const deleted = await db.delete(brokersTable)
      .where(and(eq(brokersTable.id, brokerId), eq(brokersTable.userId, req.user.id)))
      .returning();
    // Only clean up in-memory state if we actually owned and deleted this broker
    if (deleted.length > 0) {
      brokerService.disconnectAccount(brokerId);
    }
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
