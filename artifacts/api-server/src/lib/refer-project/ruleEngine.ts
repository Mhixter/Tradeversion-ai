import type { RuleEvaluationInput, RuleEvaluationResult } from "./types";

export function evaluateReferProjectRules(input: RuleEvaluationInput): RuleEvaluationResult {
  const allowedSymbols = input.settings.allowedSymbols.map((symbol) => symbol.toUpperCase());
  const symbol = input.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return { allowed: false, reason: "Symbol not allowed", logEvent: "REJECTED_TRADE" };
  }

  if (input.direction === "BUY" && input.settings.directionMode === "SELL_ONLY") {
    return { allowed: false, reason: "Direction mode allows SELL only", logEvent: "REJECTED_TRADE" };
  }

  if (input.direction === "SELL" && input.settings.directionMode === "BUY_ONLY") {
    return { allowed: false, reason: "Direction mode allows BUY only", logEvent: "REJECTED_TRADE" };
  }

  if (input.spread > input.settings.maximumSpread) {
    return { allowed: false, reason: "Spread too high", logEvent: "SPREAD_TOO_HIGH" };
  }

  const accountOpenPositions = input.openPositions.length;
  if (accountOpenPositions >= input.settings.maxOpenPositionsPerAccount) {
    return { allowed: false, reason: "Maximum open positions per account reached", logEvent: "REJECTED_TRADE" };
  }

  const symbolPositions = input.openPositions.filter((position) => position.symbol.toUpperCase() === symbol);
  if (symbolPositions.length >= input.settings.maxOpenPositionsPerSymbol) {
    return { allowed: false, reason: "Maximum open positions per symbol reached", logEvent: "REJECTED_TRADE" };
  }

  const oppositeDirection = input.direction === "BUY" ? "SELL" : "BUY";
  const hasOpposite = symbolPositions.some((position) => position.direction === oppositeDirection);
  if (hasOpposite) {
    return { allowed: false, reason: "Hedging is not allowed on the same symbol", logEvent: "REJECTED_TRADE" };
  }

  return { allowed: true };
}
