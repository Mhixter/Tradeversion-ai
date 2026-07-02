/**
 * Refer Project — AI Decision Engine
 * Computes a 0-100 confidence score from technical indicators.
 * Works on any Candle[] array (real MT5 data or simulated).
 */
import type { Candle, AIScoreDetail, AIWeights, AIThresholds, RPSettings } from "./types.js";
import { PIP_SIZE } from "./types.js";

/* ── Indicator helpers ───────────────────────────────────────────────────── */

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = values[0] ?? 0;
  for (const v of values) {
    prev = v * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function atr(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i - 1].close;
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - c),
      Math.abs(candles[i].low - c),
    );
    trs.push(tr);
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length);
}

function macd(closes: number[]): { macdLine: number[]; signal: number[]; histogram: number[] } {
  const fast   = ema(closes, 12);
  const slow   = ema(closes, 26);
  const macdLine = fast.map((v, i) => v - slow[i]);
  const signal   = ema(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signal[i]);
  return { macdLine, signal, histogram };
}

/* ── Support / Resistance from recent swings ─────────────────────────────── */
function supportResistanceScore(candles: Candle[], currentPrice: number): number {
  const lookback = candles.slice(-30);
  const highs = lookback.map(c => c.high);
  const lows  = lookback.map(c => c.low);
  const resistance = Math.max(...highs);
  const support    = Math.min(...lows);
  const range      = resistance - support;
  if (range === 0) return 50;
  // Score: closer to support (for BUY) = higher score. We return a neutral 50-based score.
  const posInRange = (currentPrice - support) / range; // 0=at support, 1=at resistance
  // Closer to support => better BUY opportunity (score closer to 100 near support, 0 near resistance)
  return Math.round((1 - posInRange) * 100);
}

/* ── Market structure: higher highs / lower lows ─────────────────────────── */
function marketStructureScore(closes: number[]): number {
  const n = Math.min(closes.length, 20);
  const recent = closes.slice(-n);
  let higherHighs = 0, lowerLows = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) higherHighs++;
    else if (recent[i] < recent[i - 1]) lowerLows++;
  }
  const ratio = higherHighs / (higherHighs + lowerLows + 0.001);
  return Math.round(ratio * 100);
}

/* ── Trend score ─────────────────────────────────────────────────────────── */
function trendScore(currentPrice: number, ema12: number, ema26: number, ema50: number): number {
  let score = 50;
  // Price above EMA50 → bullish (+20)
  if (currentPrice > ema50) score += 20; else score -= 20;
  // EMA12 above EMA26 → short-term bullish (+15)
  if (ema12 > ema26) score += 15; else score -= 15;
  // EMA12 above EMA50 → trend aligned (+15)
  if (ema12 > ema50) score += 15; else score -= 15;
  return Math.max(0, Math.min(100, score));
}

/* ── Momentum score from RSI ─────────────────────────────────────────────── */
function momentumScore(rsiVal: number): number {
  // RSI 45-55 is neutral (50). Above 55 is bullish strength. Below 45 oversold potential.
  // We map: RSI in [30,70] → score [20,80] with 50=50
  if (rsiVal >= 55 && rsiVal <= 70) return 75;  // bullish momentum
  if (rsiVal >= 45 && rsiVal <  55) return 50;  // neutral
  if (rsiVal >  70)                  return 30;  // overbought — risky
  if (rsiVal >= 30 && rsiVal <  45) return 65;  // oversold bounce potential
  return 20; // extreme oversold/overbought
}

/* ── Volatility score from ATR ───────────────────────────────────────────── */
function volatilityScore(atrVal: number, currentPrice: number, symbol: string): number {
  const pip  = PIP_SIZE[symbol] ?? 0.0001;
  const atrPips = atrVal / pip;
  // Moderate volatility (10-30 pips) is ideal. Too low or too high = risky.
  if (atrPips < 5)   return 40; // too quiet
  if (atrPips <= 30) return 80; // sweet spot
  if (atrPips <= 60) return 60; // acceptable
  return 30;                     // too volatile
}

/* ── Spread score ────────────────────────────────────────────────────────── */
function spreadScore(currentSpread: number, maxSpread: number): number {
  if (currentSpread <= 0)           return 70;
  if (currentSpread <= maxSpread * 0.5) return 90;
  if (currentSpread <= maxSpread * 0.8) return 70;
  if (currentSpread <= maxSpread)       return 40;
  return 10; // above max — should be rejected
}

/* ── Main scoring function ───────────────────────────────────────────────── */
export function computeAIScore(
  symbol:   string,
  candles:  Candle[],
  spread:   number,
  weights:  AIWeights,
  thresholds: AIThresholds,
  settings: Pick<RPSettings, "maxSpread">,
): AIScoreDetail {
  const closes  = candles.map(c => c.close);
  const current = closes[closes.length - 1] ?? 0;

  const ema12Arr = ema(closes, 12);
  const ema26Arr = ema(closes, 26);
  const ema50Arr = ema(closes, 50);
  const ema12Val = ema12Arr[ema12Arr.length - 1] ?? current;
  const ema26Val = ema26Arr[ema26Arr.length - 1] ?? current;
  const ema50Val = ema50Arr[ema50Arr.length - 1] ?? current;

  const rsiVal  = rsi(closes);
  const atrVal  = atr(candles);
  const { histogram } = macd(closes);
  const macdHist = histogram[histogram.length - 1] ?? 0;

  const scores = {
    trend:            trendScore(current, ema12Val, ema26Val, ema50Val),
    momentum:         momentumScore(rsiVal),
    volatility:       volatilityScore(atrVal, current, symbol),
    supportResistance:supportResistanceScore(candles, current),
    spread:           spreadScore(spread, settings.maxSpread),
    marketStructure:  marketStructureScore(closes),
  };

  // Normalise weights to sum=100
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 100;
  const confidence =
    (scores.trend            * weights.trend            / totalWeight +
     scores.momentum         * weights.momentum         / totalWeight +
     scores.volatility       * weights.volatility       / totalWeight +
     scores.supportResistance* weights.supportResistance/ totalWeight +
     scores.spread           * weights.spread           / totalWeight +
     scores.marketStructure  * weights.marketStructure  / totalWeight);

  const rounded = Math.round(confidence);
  const signal: AIScoreDetail["signal"] =
    rounded >= thresholds.strong ? "STRONG" :
    rounded >= thresholds.medium ? "MEDIUM" : "SKIP";

  return {
    ...scores,
    confidence:   rounded,
    signal,
    rsi:          rsiVal,
    macdHistogram:macdHist,
    atr:          atrVal,
    ema12:        ema12Val,
    ema26:        ema26Val,
    ema50:        ema50Val,
    currentPrice: current,
    currentSpread:spread,
  };
}
