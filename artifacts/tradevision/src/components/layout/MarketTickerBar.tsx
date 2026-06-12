import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  digits: number;
}

const BASE_PRICES: TickerItem[] = [
  { symbol: "EURUSD",  price: 1.08524, change:  0.0012, digits: 5 },
  { symbol: "GBPUSD",  price: 1.27438, change: -0.0008, digits: 5 },
  { symbol: "USDJPY",  price: 149.582, change:  0.2100, digits: 3 },
  { symbol: "XAUUSD",  price: 2338.45, change:  4.2000, digits: 2 },
  { symbol: "XAGUSD",  price: 27.342,  change: -0.1500, digits: 3 },
  { symbol: "BTCUSD",  price: 67824.0, change:  412.00, digits: 1 },
  { symbol: "ETHUSD",  price: 3812.50, change: -28.400, digits: 2 },
  { symbol: "USDCHF",  price: 0.90218, change:  0.0005, digits: 5 },
  { symbol: "AUDUSD",  price: 0.65814, change: -0.0011, digits: 5 },
  { symbol: "USDCAD",  price: 1.36422, change:  0.0018, digits: 5 },
  { symbol: "NAS100",  price: 19482.5, change:  87.500, digits: 1 },
  { symbol: "US30",    price: 43218.0, change: -124.00, digits: 1 },
  { symbol: "USOIL",   price: 81.540,  change:  0.3800, digits: 3 },
  { symbol: "EURGBP",  price: 0.85124, change:  0.0003, digits: 5 },
  { symbol: "GBPJPY",  price: 190.284, change: -0.4100, digits: 3 },
];

function nudge(price: number, digits: number): number {
  const pip = Math.pow(10, -digits);
  const delta = (Math.random() - 0.5) * pip * 4;
  return parseFloat((price + delta).toFixed(digits));
}

export function MarketTickerBar() {
  const [prices, setPrices] = useState<TickerItem[]>(BASE_PRICES);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = prev.map(item => ({
          ...item,
          price: nudge(item.price, item.digits),
        }));
        setPrevPrices(
          prev.reduce((acc, p) => ({ ...acc, [p.symbol]: p.price }), {})
        );
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const items = [...prices, ...prices];

  return (
    <div className="h-8 bg-[#0d0e14] border-b border-border/60 flex items-center overflow-hidden shrink-0 relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0d0e14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0d0e14] to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex gap-0 ticker-scroll"
        style={{ width: "max-content" }}
      >
        {items.map((item, i) => {
          const prev = prevPrices[item.symbol];
          const up = prev !== undefined ? item.price >= prev : item.change >= 0;
          const isPositive = item.change >= 0;

          return (
            <div
              key={i}
              className="flex items-center gap-2 px-4 border-r border-border/30 whitespace-nowrap"
            >
              <span className="text-[10px] font-bold text-muted-foreground tracking-wide">
                {item.symbol}
              </span>
              <span
                className={`text-[11px] font-mono font-bold transition-colors duration-300 ${
                  up ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.price.toFixed(item.digits)}
              </span>
              <span
                className={`text-[9px] flex items-center gap-0.5 font-semibold ${
                  isPositive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {isPositive ? "+" : ""}
                {item.change.toFixed(item.digits > 3 ? 4 : item.digits > 1 ? 2 : 1)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll {
          animation: ticker-scroll 60s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
