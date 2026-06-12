import { Router } from "express";
import { db, brokersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ConnectBrokerBody } from "@workspace/api-zod";

const router = Router();

router.get("/brokers", async (req, res) => {
  try {
    const rows = await db.select().from(brokersTable);
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
  try {
    const parsed = ConnectBrokerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }
    const { broker, platform, server } = parsed.data;
    const [inserted] = await db.insert(brokersTable).values({
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

router.delete("/brokers/:id", async (req, res) => {
  try {
    await db.delete(brokersTable).where(eq(brokersTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
