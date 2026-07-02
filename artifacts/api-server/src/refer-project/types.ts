/* Shared types for the Refer Project module — do NOT import from outside this module namespace. */

export interface Candle {
  time:   number; // epoch ms
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface AIScoreDetail {
  trend:            number;
  momentum:         number;
  volatility:       number;
  supportResistance:number;
  spread:           number;
  marketStructure:  number;
  confidence:       number;  // 0-100 composite
  signal:           "STRONG" | "MEDIUM" | "SKIP";
  rsi:              number;
  macdHistogram:    number;
  atr:              number;
  ema12:            number;
  ema26:            number;
  ema50:            number;
  currentPrice:     number;
  currentSpread:    number;
}

export interface AIWeights {
  trend:            number; // 0-100 (will be normalised)
  momentum:         number;
  volatility:       number;
  supportResistance:number;
  spread:           number;
  marketStructure:  number;
}

export interface AIThresholds {
  strong: number; // default 80
  medium: number; // default 65
}

export interface RPSettings {
  enabled:                boolean;
  maxPositionsPerAccount: number;
  maxPositionsPerSymbol:  number;
  tradingHoursStart:      string; // "HH:MM"
  tradingHoursEnd:        string;
  allowedSymbols:         string[];
  minAiConfidence:        number;
  maxSpread:              number;
  maxDailyVolume:         number;
  closeAfterMinutes:      number;
  lotSize:                number;
  directionMode:          "BUY" | "SELL";
}

export interface PositionRecord {
  id:               number;
  accountId:        number;
  ticket:           string;
  symbol:           string;
  direction:        "BUY" | "SELL";
  lotSize:          number;
  openPrice:        number;
  closePrice:       number | null;
  currentPrice:     number | null;
  profit:           number;
  openTime:         Date;
  closeTime:        Date | null;
  closeAfterMinutes:number;
  status:           "open" | "closed";
  closeReason:      string | null;
  aiConfidence:     number | null;
}

export const DEFAULT_SYMBOLS = ["EURUSD","GBPUSD","USDJPY","XAUUSD","GBPJPY","EURJPY","AUDUSD","USDCAD"];

export const BASE_PRICES: Record<string, number> = {
  EURUSD: 1.0850,
  GBPUSD: 1.2700,
  USDJPY: 149.50,
  XAUUSD: 2050.00,
  GBPJPY: 189.50,
  EURJPY:  162.00,
  AUDUSD:  0.6500,
  USDCAD:  1.3600,
  USDCHF:  0.9050,
  NZDUSD:  0.5980,
};

/** Pip value in price units for common symbols */
export const PIP_SIZE: Record<string, number> = {
  EURUSD: 0.0001,
  GBPUSD: 0.0001,
  AUDUSD: 0.0001,
  NZDUSD: 0.0001,
  USDCAD: 0.0001,
  USDCHF: 0.0001,
  USDJPY: 0.01,
  GBPJPY: 0.01,
  EURJPY: 0.01,
  XAUUSD: 0.01,
};
