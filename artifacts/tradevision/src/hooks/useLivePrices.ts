import { useState, useEffect, useRef, useCallback } from "react";

export interface LivePrice {
  symbol:   string;
  bid:      number;
  ask:      number;
  mid:      number;
  change:   number;       // absolute change from session open
  changePct: number;      // percent change
  digits:   number;
  direction: "up" | "down" | "flat";
  high:     number;
  low:      number;
}

/* Instrument specs */
const SPECS: Array<{
  symbol: string; open: number; digits: number;
  spread: number; volatility: number;
}> = [
  { symbol: "EURUSD",  open: 1.08500, digits: 5, spread: 0.00010, volatility: 0.000015 },
  { symbol: "GBPUSD",  open: 1.27430, digits: 5, spread: 0.00012, volatility: 0.000018 },
  { symbol: "USDJPY",  open: 149.500, digits: 3, spread: 0.010,   volatility: 0.0025   },
  { symbol: "USDCHF",  open: 0.90200, digits: 5, spread: 0.00012, volatility: 0.000014 },
  { symbol: "AUDUSD",  open: 0.65810, digits: 5, spread: 0.00012, volatility: 0.000016 },
  { symbol: "USDCAD",  open: 1.36420, digits: 5, spread: 0.00013, volatility: 0.000017 },
  { symbol: "NZDUSD",  open: 0.60940, digits: 5, spread: 0.00014, volatility: 0.000018 },
  { symbol: "EURGBP",  open: 0.85120, digits: 5, spread: 0.00012, volatility: 0.000013 },
  { symbol: "EURJPY",  open: 162.200, digits: 3, spread: 0.012,   volatility: 0.003    },
  { symbol: "GBPJPY",  open: 190.250, digits: 3, spread: 0.015,   volatility: 0.004    },
  { symbol: "XAUUSD",  open: 2338.00, digits: 2, spread: 0.30,    volatility: 0.15     },
  { symbol: "XAGUSD",  open: 27.340,  digits: 3, spread: 0.025,   volatility: 0.012    },
  { symbol: "BTCUSD",  open: 67800.0, digits: 1, spread: 5.0,     volatility: 40.0     },
  { symbol: "ETHUSD",  open: 3810.00, digits: 2, spread: 1.50,    volatility: 3.5      },
  { symbol: "XRPUSD",  open: 0.58200, digits: 5, spread: 0.00020, volatility: 0.0004   },
  { symbol: "NAS100",  open: 19480.0, digits: 1, spread: 0.8,     volatility: 6.0      },
  { symbol: "US30",    open: 43220.0, digits: 1, spread: 1.0,     volatility: 8.0      },
  { symbol: "SPX500",  open: 5840.00, digits: 2, spread: 0.30,    volatility: 2.0      },
  { symbol: "USOIL",   open: 81.540,  digits: 3, spread: 0.030,   volatility: 0.060    },
  { symbol: "BRENT",   open: 85.120,  digits: 3, spread: 0.035,   volatility: 0.065    },
];

/* Shared singleton — so all components share the same price stream */
let singleton: {
  prices: Map<string, LivePrice>;
  subs: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
  mids: Map<string, number>;
} | null = null;

function getOrCreateSingleton() {
  if (singleton) return singleton;

  const mids = new Map<string, number>(SPECS.map(s => [s.symbol, s.open]));
  const prices = new Map<string, LivePrice>();

  const buildPrice = (spec: typeof SPECS[0], mid: number): LivePrice => {
    const halfSpread = spec.spread / 2;
    const change     = parseFloat((mid - spec.open).toFixed(spec.digits));
    const changePct  = parseFloat(((change / spec.open) * 100).toFixed(3));
    return {
      symbol:    spec.symbol,
      bid:       parseFloat((mid - halfSpread).toFixed(spec.digits)),
      ask:       parseFloat((mid + halfSpread).toFixed(spec.digits)),
      mid,
      change,
      changePct,
      digits:    spec.digits,
      direction: "flat",
      high:      parseFloat((Math.max(mid, spec.open) + spec.volatility * 2).toFixed(spec.digits)),
      low:       parseFloat((Math.min(mid, spec.open) - spec.volatility * 2).toFixed(spec.digits)),
    };
  };

  /* Initialise prices */
  SPECS.forEach(s => prices.set(s.symbol, buildPrice(s, s.open)));

  const tick = () => {
    SPECS.forEach(spec => {
      const prev = mids.get(spec.symbol)!;
      /* Brownian-motion with mean reversion toward open */
      const drift    = (spec.open - prev) * 0.0002;
      const diffuse  = (Math.random() - 0.5) * 2 * spec.volatility;
      const next     = parseFloat((prev + drift + diffuse).toFixed(spec.digits + 1));
      mids.set(spec.symbol, next);

      const p = buildPrice(spec, next);
      p.direction = next > prev ? "up" : next < prev ? "down" : "flat";
      /* keep running high/low */
      const old = prices.get(spec.symbol)!;
      p.high = parseFloat(Math.max(old.high, next).toFixed(spec.digits));
      p.low  = parseFloat(Math.min(old.low, next).toFixed(spec.digits));
      prices.set(spec.symbol, p);
    });
    singleton!.subs.forEach(fn => fn());
  };

  singleton = { prices, subs: new Set(), timer: null, mids };
  singleton.timer = setInterval(tick, 250); /* 250 ms = 4 ticks/sec */
  return singleton;
}

/* React hook — subscribe to the singleton */
export function useLivePrices(symbols?: string[]): Map<string, LivePrice> {
  const store  = getOrCreateSingleton();
  const [, setV] = useState(0);

  useEffect(() => {
    const cb = () => setV(v => v + 1);
    store.subs.add(cb);
    return () => { store.subs.delete(cb); };
  }, []);

  if (!symbols) return store.prices;
  const filtered = new Map<string, LivePrice>();
  symbols.forEach(s => {
    const p = store.prices.get(s);
    if (p) filtered.set(s, p);
  });
  return filtered;
}

/* Convenience: single symbol */
export function useLivePrice(symbol: string): LivePrice | undefined {
  const map = useLivePrices([symbol]);
  return map.get(symbol);
}

/* Imperatively get current price (no re-render) */
export function getPrice(symbol: string): LivePrice | undefined {
  return getOrCreateSingleton().prices.get(symbol);
}

export const ALL_SYMBOLS = SPECS.map(s => s.symbol);
