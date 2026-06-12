import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLivePrices, ALL_SYMBOLS } from "@/hooks/useLivePrices";

export function MarketTickerBar() {
  const prices = useLivePrices(ALL_SYMBOLS);
  const items  = Array.from(prices.values());
  const doubled = [...items, ...items];          /* seamless loop */

  return (
    <div className="h-8 bg-[#0d0e14] border-b border-border/60 flex items-center overflow-hidden shrink-0 relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0d0e14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0d0e14] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-0 ticker-scroll" style={{ width: "max-content" }}>
        {doubled.map((item, i) => {
          const isUp   = item.direction === "up";
          const isDown = item.direction === "down";
          const posChg = item.changePct >= 0;

          return (
            <div
              key={i}
              className="flex items-center gap-2 px-4 border-r border-border/30 whitespace-nowrap"
            >
              <span className="text-[10px] font-bold text-muted-foreground tracking-wide">
                {item.symbol}
              </span>

              {/* Bid */}
              <span className={`text-[11px] font-mono font-bold transition-colors duration-150 ${
                isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-foreground"
              }`}>
                {item.bid.toFixed(item.digits)}
              </span>

              {/* Change% */}
              <span className={`text-[9px] flex items-center gap-0.5 font-semibold ${
                posChg ? "text-emerald-500" : "text-red-500"
              }`}>
                {posChg ? <TrendingUp className="w-2.5 h-2.5" /> : isDown ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2 h-2" />}
                {posChg ? "+" : ""}{item.changePct.toFixed(2)}%
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
          animation: ticker-scroll 80s linear infinite;
        }
        .ticker-scroll:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
