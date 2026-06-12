/**
 * RiskEngineService — validates every trade before execution.
 * All functions are pure/synchronous so they can be called inline
 * inside the execution pipeline without async overhead.
 */

export interface RiskLimits {
  maxDailyLossPercent: number;
  maxDrawdownPercent:  number;
  maxPositionSizeLots: number;
  maxOpenTrades:       number;
  maxExposurePercent:  number;
  maxLeverage:         number;
  tradingEnabled:      boolean;
  killSwitchActive:    boolean;
}

export interface AccountSnapshot {
  balance:      number;
  equity:       number;
  openTrades:   number;
  openLots:     number;
  dailyLoss:    number;
  peakEquity:   number;
}

export interface TradeRequest {
  symbol:    string;
  side:      "BUY" | "SELL";
  lots:      number;
  price:     number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface RiskValidationResult {
  passed:          boolean;
  riskScore:       number;
  rejectionReason: string | null;
  checks: {
    label:   string;
    passed:  boolean;
    usage:   number;
    limit:   number;
    unit:    string;
  }[];
}

const DEFAULT_LIMITS: RiskLimits = {
  maxDailyLossPercent:  5,
  maxDrawdownPercent:   10,
  maxPositionSizeLots:  10,
  maxOpenTrades:        20,
  maxExposurePercent:   80,
  maxLeverage:          1.5,
  tradingEnabled:       true,
  killSwitchActive:     false,
};

let activeLimits: RiskLimits = { ...DEFAULT_LIMITS };
let killSwitchReason: string | null = null;

export function getLimits(): RiskLimits { return { ...activeLimits }; }
export function setLimits(l: Partial<RiskLimits>): void { activeLimits = { ...activeLimits, ...l }; }
export function getKillSwitchReason(): string | null { return killSwitchReason; }

export function activateKillSwitch(reason = "Manual kill switch"): void {
  activeLimits.killSwitchActive = true;
  activeLimits.tradingEnabled   = false;
  killSwitchReason = reason;
}

export function deactivateKillSwitch(): void {
  activeLimits.killSwitchActive = false;
  activeLimits.tradingEnabled   = true;
  killSwitchReason = null;
}

export function calculateDrawdown(equity: number, peakEquity: number): number {
  if (peakEquity <= 0) return 0;
  return Math.max(0, ((peakEquity - equity) / peakEquity) * 100);
}

export function calculateDailyLossPercent(dailyLoss: number, balance: number): number {
  if (balance <= 0) return 0;
  return Math.abs(Math.min(0, dailyLoss) / balance) * 100;
}

export function calculateExposure(openLots: number, requestLots: number, balance: number, price: number): number {
  const contractSize = 100_000;
  const totalNotional = (openLots + requestLots) * contractSize * price;
  return balance > 0 ? (totalNotional / balance) * 100 : 0;
}

export function calculateRiskScore(account: AccountSnapshot, limits: RiskLimits): number {
  const drawdown = calculateDrawdown(account.equity, account.peakEquity);
  const dailyLossPct = calculateDailyLossPercent(account.dailyLoss, account.balance);
  const openTradeScore = (account.openTrades / Math.max(limits.maxOpenTrades, 1)) * 30;
  const drawdownScore  = (drawdown / Math.max(limits.maxDrawdownPercent, 1)) * 40;
  const dailyLossScore = (dailyLossPct / Math.max(limits.maxDailyLossPercent, 1)) * 30;
  return Math.min(100, Math.round(openTradeScore + drawdownScore + dailyLossScore));
}

export function validateTrade(
  request: TradeRequest,
  account: AccountSnapshot,
  limits: RiskLimits = activeLimits,
): RiskValidationResult {
  const drawdownPct = calculateDrawdown(account.equity, account.peakEquity);
  const dailyLossPct = calculateDailyLossPercent(account.dailyLoss, account.balance);
  const exposurePct  = calculateExposure(account.openLots, request.lots, account.balance, request.price);
  const marginLevel  = account.balance > 0 ? (account.equity / account.balance) : 1;

  const checks = [
    {
      label:  "Kill Switch",
      passed: !limits.killSwitchActive,
      usage:  limits.killSwitchActive ? 100 : 0,
      limit:  0,
      unit:   "active",
    },
    {
      label:  "Trading Enabled",
      passed: limits.tradingEnabled,
      usage:  limits.tradingEnabled ? 0 : 100,
      limit:  0,
      unit:   "flag",
    },
    {
      label:  "Daily Loss Limit",
      passed: dailyLossPct < limits.maxDailyLossPercent,
      usage:  parseFloat(dailyLossPct.toFixed(2)),
      limit:  limits.maxDailyLossPercent,
      unit:   "%",
    },
    {
      label:  "Max Drawdown",
      passed: drawdownPct < limits.maxDrawdownPercent,
      usage:  parseFloat(drawdownPct.toFixed(2)),
      limit:  limits.maxDrawdownPercent,
      unit:   "%",
    },
    {
      label:  "Max Position Size",
      passed: request.lots <= limits.maxPositionSizeLots,
      usage:  request.lots,
      limit:  limits.maxPositionSizeLots,
      unit:   "lots",
    },
    {
      label:  "Max Open Trades",
      passed: account.openTrades < limits.maxOpenTrades,
      usage:  account.openTrades,
      limit:  limits.maxOpenTrades,
      unit:   "trades",
    },
    {
      label:  "Exposure Limit",
      passed: exposurePct <= limits.maxExposurePercent,
      usage:  parseFloat(exposurePct.toFixed(2)),
      limit:  limits.maxExposurePercent,
      unit:   "%",
    },
    {
      label:  "Margin Validation",
      passed: marginLevel >= 0.2,
      usage:  parseFloat(((1 - marginLevel) * 100).toFixed(2)),
      limit:  80,
      unit:   "%",
    },
  ];

  const firstFail = checks.find(c => !c.passed);
  const riskScore = calculateRiskScore(account, limits);

  return {
    passed:          !firstFail,
    riskScore,
    rejectionReason: firstFail ? firstFail.label : null,
    checks,
  };
}
