import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetPortfolioOverview, useGetPortfolioAllocation, useGetPortfolioHoldings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#8B5CF6"];

// ── Candlestick chart ────────────────────────────────────────────────────────
function seededRand(s: number) { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); }

const CANDLE_DATA = (() => {
  let price = 1.08400;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return Array.from({ length: 45 }, (_, i) => {
    const r1 = seededRand(i * 3), r2 = seededRand(i * 3 + 1), r3 = seededRand(i * 3 + 2);
    const change = (r1 - 0.46) * 0.0028;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + r2 * 0.0014;
    const low  = Math.min(open, close) - r3 * 0.0014;
    price = close;
    return {
      open, high, low, close, vol: r1 * 0.75 + 0.25,
      label: i % 9 === 0 ? `${months[Math.floor(i / 9)]} ${(i % 28) + 1}` : "",
    };
  });
})();

const TRADE_MARKS: { idx: number; type: "BUY" | "SELL" }[] = [
  { idx: 4, type: "BUY" }, { idx: 10, type: "SELL" },
  { idx: 18, type: "BUY" }, { idx: 26, type: "SELL" },
  { idx: 34, type: "BUY" }, { idx: 41, type: "SELL" },
];

function CandlestickChart() {
  const W = 900, H = 230;
  const padL = 58, padR = 14, padT = 12, padB = 26;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const volH = 32;
  const priceH = chartH - volH - 4;

  const allPrices = CANDLE_DATA.flatMap(d => [d.high, d.low]);
  const minP = Math.min(...allPrices) - 0.0005;
  const maxP = Math.max(...allPrices) + 0.0005;
  const pRange = maxP - minP;

  const toY  = (p: number) => padT + ((maxP - p) / pRange) * priceH;
  const n    = CANDLE_DATA.length;
  const slot = chartW / n;
  const cw   = Math.max(2, slot * 0.55);
  const toX  = (i: number) => padL + (i + 0.5) * slot;

  const yLevels = Array.from({ length: 5 }, (_, i) => minP + (pRange / 4) * i);
  const currentPrice = CANDLE_DATA[n - 1].close;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 230 }} preserveAspectRatio="none">
      {/* Background */}
      <rect x={padL} y={padT} width={chartW} height={priceH} fill="hsl(var(--background))" rx="3" />

      {/* Grid lines */}
      {yLevels.map((p, i) => {
        const y = toY(p);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border)/0.4)" strokeWidth="0.5" strokeDasharray="3,4" />
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="hsl(var(--muted-foreground))">{p.toFixed(4)}</text>
          </g>
        );
      })}

      {/* Current price line */}
      {(() => {
        const cy = toY(currentPrice);
        return (
          <g>
            <line x1={padL} y1={cy} x2={W - padR} y2={cy} stroke="#4F46E5" strokeWidth="1" strokeDasharray="4,3" />
            <rect x={W - padR - 44} y={cy - 8} width={44} height={16} fill="#4F46E5" rx="3" />
            <text x={W - padR - 4} y={cy + 4} textAnchor="end" fontSize="8" fontWeight="bold" fill="white">{currentPrice.toFixed(4)}</text>
          </g>
        );
      })()}

      {/* Candles */}
      {CANDLE_DATA.map((d, i) => {
        const x = toX(i);
        const isGreen = d.close >= d.open;
        const color = isGreen ? "#22C55E" : "#EF4444";
        const bTop = toY(Math.max(d.open, d.close));
        const bBot = toY(Math.min(d.open, d.close));
        return (
          <g key={i}>
            <line x1={x} y1={toY(d.high)} x2={x} y2={toY(d.low)} stroke={color} strokeWidth="1" />
            <rect x={x - cw / 2} y={bTop} width={cw} height={Math.max(1, bBot - bTop)} fill={color} opacity="0.85" />
          </g>
        );
      })}

      {/* Trade markers */}
      {TRADE_MARKS.map(({ idx, type }) => {
        const d = CANDLE_DATA[idx];
        const x = toX(idx);
        const isBuy = type === "BUY";
        const markerColor = isBuy ? "#3B82F6" : "#EF4444";
        const py = isBuy ? toY(d.low) + 10 : toY(d.high) - 10;
        const tri = isBuy
          ? `${x},${py - 7} ${x - 5},${py + 3} ${x + 5},${py + 3}`
          : `${x},${py + 7} ${x - 5},${py - 3} ${x + 5},${py - 3}`;
        return (
          <g key={idx}>
            <polygon points={tri} fill={markerColor} opacity="0.95" />
            <text x={x} y={isBuy ? py + 13 : py - 10} textAnchor="middle" fontSize="7" fontWeight="bold" fill={markerColor}>{type}</text>
          </g>
        );
      })}

      {/* Volume bars */}
      {CANDLE_DATA.map((d, i) => {
        const x = toX(i);
        const vb = d.vol * volH;
        const isGreen = d.close >= d.open;
        return (
          <rect key={`v${i}`} x={x - cw / 2} y={padT + chartH - vb} width={cw} height={vb} fill={isGreen ? "#22C55E" : "#EF4444"} opacity="0.25" />
        );
      })}

      {/* X labels */}
      {CANDLE_DATA.map((d, i) => d.label ? (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{d.label}</text>
      ) : null)}
    </svg>
  );
}

export default function Portfolio() {
  const { data: overview, isLoading: isOverviewLoading } = useGetPortfolioOverview();
  const { data: allocation, isLoading: isAllocationLoading } = useGetPortfolioAllocation();
  const { data: holdings, isLoading: isHoldingsLoading } = useGetPortfolioHoldings();

  return (
    <Layout title="Portfolio" subtitle="Detailed analysis of your investments and assets">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Top Stats — 3 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <StatBox title="Total Equity" value={overview?.totalEquity} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Net Profit" value={overview?.netProfit} prefix="$" isCurrency isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Daily P&L" value={overview?.dailyPnl} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Total Return" value={overview?.totalReturn} suffix="%" isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Sharpe Ratio" value={overview?.sharpeRatio} isLoading={isOverviewLoading} />
          <StatBox title="Max Drawdown" value={overview?.maxDrawdown} suffix="%" isLoading={isOverviewLoading} valueClass="text-destructive" />
        </div>

        {/* Candlestick Performance Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Portfolio Performance — EURUSD</CardTitle>
            <div className="flex gap-1">
              {["1D","1W","1M","3M","6M"].map((t, i) => (
                <button key={t} className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${i === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>{t}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 pb-1 overflow-hidden">
            <CandlestickChart />
          </CardContent>
        </Card>

        {/* Chart + Table — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Pie chart — full width on mobile, 4 cols on desktop */}
          <Card className="lg:col-span-4 border-border bg-card">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center px-4">
              <div className="h-52 w-full max-w-xs mx-auto">
                {isAllocationLoading ? <Skeleton className="w-full h-full rounded-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="percent"
                        stroke="none"
                      >
                        {allocation?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2">
                {allocation?.map((item, i) => (
                  <div key={item.assetClass} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs">{item.assetClass}</span>
                    </div>
                    <span className="font-medium text-xs">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holdings table — full width on mobile, 8 cols on desktop */}
          <Card className="lg:col-span-8 border-border bg-card">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Holdings Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-accent/30 hover:bg-accent/30">
                      <TableHead className="pl-4 whitespace-nowrap">Symbol</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Asset Class</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Qty</TableHead>
                      <TableHead className="text-right hidden md:table-cell whitespace-nowrap">Avg Price</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Price</TableHead>
                      <TableHead className="text-right whitespace-nowrap">P&L</TableHead>
                      <TableHead className="text-right hidden sm:table-cell whitespace-nowrap">Alloc %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isHoldingsLoading ? (
                      Array(6).fill(0).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      ))
                    ) : holdings?.map((holding, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="font-semibold text-xs pl-4 whitespace-nowrap">{holding.symbol}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{holding.asset}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${holding.type === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'}`}>
                            {holding.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">{holding.quantity}</TableCell>
                        <TableCell className="text-xs text-right hidden md:table-cell whitespace-nowrap">${holding.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        <TableCell className="text-xs text-right font-medium whitespace-nowrap">${holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        <TableCell className={`text-xs text-right font-bold whitespace-nowrap ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-xs text-right hidden sm:table-cell whitespace-nowrap">{holding.allocation}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatBox({ title, value, prefix = "", suffix = "", isLoading, valueClass = "text-foreground", isCurrency = false }: any) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-2.5 sm:p-4 flex flex-col justify-center gap-0.5 sm:gap-1">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{title}</p>
        {isLoading ? <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" /> : (
          <h3 className={`text-sm sm:text-xl font-bold leading-tight ${valueClass}`}>
            {prefix}{value != null ? value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 }) : 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}
