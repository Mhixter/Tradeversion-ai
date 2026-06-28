export type DirectionMode = "BUY_ONLY" | "SELL_ONLY";
export type TradeDirection = "BUY" | "SELL";

export interface AiSignalInput {
  trend: number;
  momentum: number;
  volatility: number;
  spread: number;
  supportResistance: number;
  recentCandles: number;
  atr: number;
  movingAverages: number;
  rsi: number;
  macd: number;
  marketStructure: number;
}

export interface AiWeights {
  trend: number;
  momentum: number;
  volatility: number;
  supportResistance: number;
  spread: number;
  marketStructure: number;
}

export interface ReferProjectSettingsDto {
  enabled: boolean;
  maxOpenPositionsPerAccount: number;
  maxOpenPositionsPerSymbol: number;
  tradingHours: string;
  allowedSymbols: string[];
  minimumAiConfidence: number;
  maximumSpread: number;
  maximumDailyVolumeTarget: number;
  closeAfterMinutes: number;
  lotSize: number;
  directionMode: DirectionMode;
  aiWeights: AiWeights;
}

export interface RuleEvaluationInput {
  symbol: string;
  direction: TradeDirection;
  spread: number;
  openPositions: Array<{ symbol: string; direction: TradeDirection }>;
  settings: Pick<
    ReferProjectSettingsDto,
    | "directionMode"
    | "allowedSymbols"
    | "maximumSpread"
    | "maxOpenPositionsPerAccount"
    | "maxOpenPositionsPerSymbol"
  >;
}

export interface RuleEvaluationResult {
  allowed: boolean;
  reason?: string;
  logEvent?: "REJECTED_TRADE" | "SPREAD_TOO_HIGH";
}
