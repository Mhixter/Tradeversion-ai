import type { ReferProjectSettingsDto } from "./types";

export const DEFAULT_REFER_PROJECT_SETTINGS: ReferProjectSettingsDto = {
  enabled: false,
  maxOpenPositionsPerAccount: 20,
  maxOpenPositionsPerSymbol: 5,
  tradingHours: "00:00-23:59",
  allowedSymbols: ["EURUSD", "GBPUSD", "XAUUSD"],
  minimumAiConfidence: 65,
  maximumSpread: 30,
  maximumDailyVolumeTarget: 25,
  closeAfterMinutes: 7,
  lotSize: 0.01,
  directionMode: "BUY_ONLY",
  aiWeights: {
    trend: 30,
    momentum: 20,
    volatility: 15,
    supportResistance: 15,
    spread: 10,
    marketStructure: 10,
  },
};
