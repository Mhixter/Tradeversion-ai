import { Router } from "express";
import { db, marketplaceTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
  res.json({
    mostProfitable: { name: "AI Scalper Pro", value: "+$4,250.75", label: "Total Profit (All Time)" },
    highestWinRate: { name: "EURUSD Genius", value: "81.1%", label: "Win Rate" },
    lowestRisk: { name: "Arbitrage AI", value: "2.95%", label: "Max Drawdown" },
    fastestGrowing: { name: "Crypto Momentum AI", value: "+312", label: "New Users This Week" },
    editorsChoice: { name: "Gold Hunter AI", value: "4.9 Rating", label: "Editor's Choice" },
  });
});

router.get("/marketplace/top-authors", async (req, res) => {
  res.json([
    { id: 1, name: "QuantEdge AI", rating: 4.9, strategiesCount: 42 },
    { id: 2, name: "GoldAlgo Labs", rating: 4.8, strategiesCount: 28 },
    { id: 3, name: "CryptoMind", rating: 4.9, strategiesCount: 31 },
    { id: 4, name: "ForexGenius AI", rating: 4.8, strategiesCount: 19 },
    { id: 5, name: "NewsQuant AI", rating: 4.7, strategiesCount: 16 },
  ]);
});

router.post("/marketplace/:id/subscribe", async (req, res) => {
  try {
    const [updated] = await db.update(marketplaceTable)
      .set({ isSubscribed: true })
      .where(eq(marketplaceTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(mapListing(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
