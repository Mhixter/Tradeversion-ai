import test from "node:test";
import assert from "node:assert/strict";
import { evaluateReferProjectRules } from "../../artifacts/api-server/src/lib/refer-project/ruleEngine";
import { computeAiDecision } from "../../artifacts/api-server/src/lib/refer-project/aiDecisionService";
import { ReferProjectWorkerManager } from "../../artifacts/api-server/src/lib/refer-project/accountWorkerManager";

test("rule engine rejects hedge on same symbol", () => {
  const result = evaluateReferProjectRules({
    symbol: "EURUSD",
    direction: "SELL",
    spread: 10,
    openPositions: [{ symbol: "EURUSD", direction: "BUY" }],
    settings: {
      directionMode: "SELL_ONLY",
      allowedSymbols: ["EURUSD"],
      maximumSpread: 30,
      maxOpenPositionsPerAccount: 10,
      maxOpenPositionsPerSymbol: 5,
    },
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason ?? "", /Hedging/i);
});

test("AI decision skips trade below threshold", () => {
  const decision = computeAiDecision(
    {
      trend: 40,
      momentum: 30,
      volatility: 20,
      spread: 80,
      supportResistance: 30,
      recentCandles: 25,
      atr: 35,
      movingAverages: 45,
      rsi: 30,
      macd: 35,
      marketStructure: 30,
    },
    {
      aiWeights: {
        trend: 30,
        momentum: 20,
        volatility: 15,
        supportResistance: 15,
        spread: 10,
        marketStructure: 10,
      },
      minimumAiConfidence: 65,
    },
  );

  assert.equal(decision.shouldTrade, false);
  assert.ok(decision.confidence < 65);
});

test("worker manager closes by timer", async () => {
  const manager = new ReferProjectWorkerManager();
  let closedTradeId = "";

  manager.scheduleTimerClose(
    "acc-a",
    "trade-1",
    new Date(Date.now() + 20),
    async (tradeId) => {
      closedTradeId = tradeId;
    },
  );

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(closedTradeId, "trade-1");
});

test("worker manager keeps account timers isolated", async () => {
  const manager = new ReferProjectWorkerManager();
  const closed: string[] = [];

  manager.scheduleTimerClose("acc-a", "trade-a", new Date(Date.now() + 20), async (tradeId, accountId) => {
    closed.push(`${accountId}:${tradeId}`);
  });
  manager.scheduleTimerClose("acc-b", "trade-b", new Date(Date.now() + 40), async (tradeId, accountId) => {
    closed.push(`${accountId}:${tradeId}`);
  });

  await new Promise((resolve) => setTimeout(resolve, 90));
  assert.deepEqual(closed.sort(), ["acc-a:trade-a", "acc-b:trade-b"]);
});
