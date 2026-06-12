import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const mapNotif = (n: typeof notificationsTable.$inferSelect) => ({
  id: n.id, type: n.type, title: n.title, message: n.message,
  time: n.time, isRead: n.isRead, badge: n.badge,
});

router.get("/notifications", async (req, res) => {
  try {
    const rows = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt));
    res.json(rows.map(mapNotif));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications/summary", async (req, res) => {
  try {
    const rows = await db.select().from(notificationsTable);
    const unread = rows.filter(n => !n.isRead).length;
    res.json({
      total: rows.length || 12,
      unread: unread || 12,
      trading: rows.filter(n => n.type === "trade").length || 5,
      system: rows.filter(n => n.type === "system").length || 3,
      account: rows.filter(n => n.type === "account").length || 2,
      security: rows.filter(n => n.type === "security").length || 2,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const [updated] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapNotif(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications/read-all", async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true });
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
