import { Router } from "express";
import { db, brokersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ConnectBrokerBody } from "@workspace/api-zod";

const router = Router();

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

router.post("/brokers", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const parsed = ConnectBrokerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }
    const { broker, platform, server } = parsed.data;
    const [inserted] = await db.insert(brokersTable).values({
      userId: req.user.id,
      broker, platform, server,
      accountNumber: parsed.data.login,
      equity: "0", balance: "0", profit: "0", profitPercent: "0",
      status: "LIVE", isConnected: true,
    }).returning();
    res.status(201).json({
      id: inserted.id, broker: inserted.broker, platform: inserted.platform,
      accountNumber: inserted.accountNumber, equity: 0, balance: 0, profit: 0,
      profitPercent: 0, status: inserted.status, server: inserted.server, isConnected: inserted.isConnected,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

router.delete("/brokers/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    await db.delete(brokersTable)
      .where(and(eq(brokersTable.id, parseInt(req.params.id)), eq(brokersTable.userId, req.user.id)));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
