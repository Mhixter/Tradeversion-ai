import { Router } from "express";
import { db, marketplaceTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const mapListing = (m: typeof marketplaceTable.$inferSelect) => ({
  id: m.id, name: m.name, type: m.type, description: m.description,
  winRate: parseFloat(m.winRate), profitFactor: parseFloat(m.profitFactor),
  maxDrawdown: parseFloat(m.maxDrawdown), price: parseFloat(m.price),
  author: m.author, authorRating: parseFloat(m.authorRating), rating: parseFloat(m.rating),
  subscribers: m.subscribers, isSubscribed: m.isSubscribed, isPremium: m.isPremium,
  isNew: m.isNew, market: m.market, timeframe: m.timeframe,
});

router.get("/marketplace", async (req, res) => {
  try {
    const rows = await db.select().from(marketplaceTable);
    res.json(rows.map(mapListing));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/marketplace/highlights", async (req, res) => {
  try {
    const rows = await db.select().from(marketplaceTable);

    if (!rows.length) {
      res.json({
        mostProfitable:  null,
        highestWinRate:  null,
        lowestRisk:      null,
        fastestGrowing:  null,
        editorsChoice:   null,
      });
      return;
    }

    const byPnl      = [...rows].sort((a, b) => parseFloat(b.profitFactor) - parseFloat(a.profitFactor));
    const byWinRate  = [...rows].sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    const byDrawdown = [...rows].sort((a, b) => parseFloat(a.maxDrawdown) - parseFloat(b.maxDrawdown));
    const byRating   = [...rows].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    const bySubs     = [...rows].sort((a, b) => (b.subscribers ?? 0) - (a.subscribers ?? 0));

    res.json({
      mostProfitable: { name: byPnl[0].name, value: `PF ${parseFloat(byPnl[0].profitFactor).toFixed(2)}`, label: "Profit Factor" },
      highestWinRate: { name: byWinRate[0].name, value: `${parseFloat(byWinRate[0].winRate).toFixed(1)}%`, label: "Win Rate" },
      lowestRisk:     { name: byDrawdown[0].name, value: `${parseFloat(byDrawdown[0].maxDrawdown).toFixed(2)}%`, label: "Max Drawdown" },
      fastestGrowing: { name: bySubs[0].name, value: `+${bySubs[0].subscribers ?? 0}`, label: "Subscribers" },
      editorsChoice:  { name: byRating[0].name, value: `${parseFloat(byRating[0].rating).toFixed(1)} Rating`, label: "Editor's Choice" },
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/marketplace/top-authors", async (req, res) => {
  try {
    const rows = await db.select().from(marketplaceTable);

    if (!rows.length) {
      res.json([]);
      return;
    }

    const authorMap: Record<string, { rating: number; count: number }> = {};
    rows.forEach(r => {
      if (!r.author) return;
      if (!authorMap[r.author]) authorMap[r.author] = { rating: 0, count: 0 };
      authorMap[r.author].rating += parseFloat(r.authorRating);
      authorMap[r.author].count += 1;
    });

    const authors = Object.entries(authorMap)
      .map(([name, { rating, count }], i) => ({
        id: i + 1,
        name,
        rating: parseFloat((rating / count).toFixed(1)),
        strategiesCount: count,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    res.json(authors);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/marketplace/:id/subscribe", async (req, res) => {
  try {
    const [updated] = await db.update(marketplaceTable)
      .set({ isSubscribed: true })
      .where(eq(marketplaceTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapListing(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
