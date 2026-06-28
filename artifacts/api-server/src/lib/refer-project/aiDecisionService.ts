import type { AiSignalInput, ReferProjectSettingsDto } from "./types";

export interface AiDecisionResult {
  confidence: number;
  rating: "STRONG_TRADE" | "MEDIUM_TRADE" | "SKIP";
  shouldTrade: boolean;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function avg(...values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeAiDecision(
  signals: AiSignalInput,
  settings: Pick<ReferProjectSettingsDto, "aiWeights" | "minimumAiConfidence">,
): AiDecisionResult {
  const trendComposite = avg(signals.trend, signals.movingAverages, signals.rsi, signals.macd);
  const momentumComposite = avg(signals.momentum, signals.recentCandles);
  const volatilityComposite = avg(signals.volatility, signals.atr);
  const spreadComposite = 100 - clamp(signals.spread);

  const weighted =
    trendComposite * (settings.aiWeights.trend / 100) +
    momentumComposite * (settings.aiWeights.momentum / 100) +
    volatilityComposite * (settings.aiWeights.volatility / 100) +
    clamp(signals.supportResistance) * (settings.aiWeights.supportResistance / 100) +
    spreadComposite * (settings.aiWeights.spread / 100) +
    clamp(signals.marketStructure) * (settings.aiWeights.marketStructure / 100);

  const confidence = Math.round(clamp(weighted));
  const rating = confidence >= 80 ? "STRONG_TRADE" : confidence >= 65 ? "MEDIUM_TRADE" : "SKIP";

  return {
    confidence,
    rating,
    shouldTrade: confidence >= settings.minimumAiConfidence,
  };
}
