/**
 * Refer Project — MT5 Connector Interface + Simulated Implementation
 *
 * Real MT5 connectivity requires a Windows environment with a running MT5 terminal
 * (MetaTrader5 Python lib or MetaApi.cloud REST bridge).
 *
 * This file defines the interface and provides a SimulatedMT5Connector that generates
 * realistic forex market data for development/demo purposes.
 * Swap in a RealMT5Connector that implements the same interface for production.
 */
import type { Candle } from "./types.js";
import { BASE_PRICES, PIP_SIZE } from "./types.js";

/* ── Interface ───────────────────────────────────────────────────────────── */
export interface MT5AccountInfo {
  balance: number;
  equity:  number;
  margin:  number;
  freeMargin: number;
}

export interface MT5Position {
  ticket:     string;
  symbol:     string;
  type:       "BUY" | "SELL";
  volume:     number;
  openPrice:  number;
  currentPrice: number;
  profit:     number;
  openTime:   Date;
}

export interface MT5TickData {
  symbol: string;
  bid:    number;
  ask:    number;
  spread: number; // in price units
  time:   Date;
}

export interface MT5Connector {
  connect():    Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getAccountInfo(): Promise<MT5AccountInfo>;
  getCandles(symbol: string, count?: number): Promise<Candle[]>;
  getTick(symbol: string): Promise<MT5TickData>;
  openPosition(symbol: string, type: "BUY" | "SELL", volume: number): Promise<string>;
  closePosition(ticket: string): Promise<boolean>;
  getOpenPositions(): Promise<MT5Position[]>;
}

/* ── Price simulation engine ─────────────────────────────────────────────── */
class PriceSimulator {
  private prices  = new Map<string, number>();
  private history = new Map<string, Candle[]>();
  private trends  = new Map<string, number>();

  constructor() {
    for (const [sym, base] of Object.entries(BASE_PRICES)) {
      this.prices.set(sym, base);
      this.trends.set(sym, (Math.random() - 0.5) * 0.2);
      this.history.set(sym, this.generateHistory(sym, base, 200));
    }
  }

  private generateHistory(symbol: string, base: number, count: number): Candle[] {
    const vol = base * 0.0005;
    const candles: Candle[] = [];
    let price = base * (1 + (Math.random() - 0.5) * 0.002);
    let trend = (Math.random() - 0.5) * 0.3;
    for (let i = 0; i < count; i++) {
      const reversion = (base - price) * 0.008;
      const noise     = (Math.random() - 0.5) * vol * 2;
      const change    = trend * vol * 0.5 + reversion + noise;
      const open  = price;
      const close = price + change;
      const wick  = Math.random() * vol * 0.8;
      candles.push({
        time:   Date.now() - (count - i) * 60_000,
        open,
        high:   Math.max(open, close) + wick,
        low:    Math.min(open, close) - wick,
        close,
        volume: Math.floor(Math.random() * 800 + 200),
      });
      price = close;
      if (Math.random() < 0.05) trend = (Math.random() - 0.5) * 0.3;
    }
    return candles;
  }

  tick(symbol: string): void {
    const base  = BASE_PRICES[symbol] ?? 1;
    const cur   = this.prices.get(symbol) ?? base;
    const vol   = base * 0.0004;
    const trend = this.trends.get(symbol) ?? 0;
    const rev   = (base - cur) * 0.01;
    const noise = (Math.random() - 0.5) * vol * 2;
    const newPrice = Math.max(cur + trend * vol * 0.3 + rev + noise, base * 0.5);
    this.prices.set(symbol, newPrice);
    if (Math.random() < 0.03) this.trends.set(symbol, (Math.random() - 0.5) * 0.3);

    const hist = this.history.get(symbol) ?? [];
    const prev = hist[hist.length - 1];
    const wick = Math.random() * vol * 0.5;
    hist.push({
      time:   Date.now(),
      open:   prev?.close ?? newPrice,
      high:   Math.max(prev?.close ?? newPrice, newPrice) + wick,
      low:    Math.min(prev?.close ?? newPrice, newPrice) - wick,
      close:  newPrice,
      volume: Math.floor(Math.random() * 600 + 100),
    });
    if (hist.length > 500) hist.splice(0, hist.length - 500);
    this.history.set(symbol, hist);
  }

  getPrice(symbol: string):   number   { return this.prices.get(symbol) ?? BASE_PRICES[symbol] ?? 1; }
  getHistory(symbol: string): Candle[] { return this.history.get(symbol) ?? []; }
  getSpread(symbol: string):  number {
    const pip = PIP_SIZE[symbol] ?? 0.0001;
    return pip * (1 + Math.random() * 2); // 1-3 pip spread
  }
}

// Single shared simulator instance (module-level singleton)
export const simulator = new PriceSimulator();

/* ── Simulated Connector ─────────────────────────────────────────────────── */
export class SimulatedMT5Connector implements MT5Connector {
  private connected  = false;
  private balance    = 10_000 + Math.random() * 40_000;
  private positions  = new Map<string, MT5Position>();
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private readonly symbols: string[];

  constructor(symbols: string[] = Object.keys(BASE_PRICES)) {
    this.symbols = symbols;
  }

  async connect(): Promise<boolean> {
    await this.delay(300 + Math.random() * 500);
    this.connected = true;
    // Update prices every 5s
    this.tickHandle = setInterval(() => {
      for (const sym of this.symbols) simulator.tick(sym);
    }, 5_000);
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.tickHandle) clearInterval(this.tickHandle);
    this.connected = false;
  }

  isConnected(): boolean { return this.connected; }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    const floatingPnl = [...this.positions.values()]
      .reduce((s, p) => s + p.profit, 0);
    const equity = this.balance + floatingPnl;
    return { balance: this.balance, equity, margin: equity * 0.01, freeMargin: equity * 0.99 };
  }

  async getCandles(symbol: string, count = 200): Promise<Candle[]> {
    const hist = simulator.getHistory(symbol);
    return hist.slice(-count);
  }

  async getTick(symbol: string): Promise<MT5TickData> {
    const bid    = simulator.getPrice(symbol);
    const spread = simulator.getSpread(symbol);
    return { symbol, bid, ask: bid + spread, spread, time: new Date() };
  }

  async openPosition(symbol: string, type: "BUY" | "SELL", volume: number): Promise<string> {
    const tick   = await this.getTick(symbol);
    const price  = type === "BUY" ? tick.ask : tick.bid;
    const ticket = `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.positions.set(ticket, {
      ticket, symbol, type, volume,
      openPrice: price, currentPrice: price, profit: 0, openTime: new Date(),
    });
    return ticket;
  }

  async closePosition(ticket: string): Promise<boolean> {
    const pos = this.positions.get(ticket);
    if (!pos) return false;
    const tick = await this.getTick(pos.symbol);
    const closePrice = pos.type === "BUY" ? tick.bid : tick.ask;
    const pip   = PIP_SIZE[pos.symbol] ?? 0.0001;
    const pips  = pos.type === "BUY"
      ? (closePrice - pos.openPrice) / pip
      : (pos.openPrice - closePrice) / pip;
    const pnl   = pips * pos.volume * 10; // simplified: $10 per pip per 0.1 lot
    this.balance += pnl;
    this.positions.delete(ticket);
    return true;
  }

  async getOpenPositions(): Promise<MT5Position[]> {
    // Update floating P&L
    for (const [ticket, pos] of this.positions) {
      const tick = await this.getTick(pos.symbol);
      const pip  = PIP_SIZE[pos.symbol] ?? 0.0001;
      const closePrice = pos.type === "BUY" ? tick.bid : tick.ask;
      const pips = pos.type === "BUY"
        ? (closePrice - pos.openPrice) / pip
        : (pos.openPrice - closePrice) / pip;
      this.positions.set(ticket, {
        ...pos,
        currentPrice: closePrice,
        profit: pips * pos.volume * 10,
      });
    }
    return [...this.positions.values()];
  }

  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}
