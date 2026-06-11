import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetBacktests, useGetBacktest, useGetBacktestTrades, useGetBacktestEquityCurve, useGetBacktestMonthlyPerformance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Backtesting() {
  const { data: backtests, isLoading: isListLoading } = useGetBacktests();
  const backtestId = backtests?.[0]?.id || 1;
  const { data: backtest, isLoading: isBacktestLoading } = useGetBacktest(backtestId);
  const { data: equityCurve, isLoading: isCurveLoading } = useGetBacktestEquityCurve(backtestId);

  return (
    <Layout title="Backtesting" subtitle="Historical strategy performance analysis">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Filter Bar — scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 p-3 bg-card border border-border rounded-lg items-center min-w-max sm:min-w-0 sm:flex-wrap">
            <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm">
              <option>AI Scalper Pro</option>
            </select>
            <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm">
              <option>MT5 - IC Markets</option>
            </select>
            <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm w-24">
              <option>EURUSD</option>
            </select>
            <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm w-20">
              <option>M15</option>
            </select>
            <input type="date" className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm" />
            <span className="text-muted-foreground">-</span>
            <input type="date" className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm" />
            <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 shrink-0">Run Backtest</Button>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 border-b border-border min-w-max sm:min-w-0">
            {["Overview", "Performance", "Trades", "Risk Analysis", "Equity Curve", "Monthly Report"].map((t, i) => (
              <div key={t} className={`pb-2 px-2 sm:px-3 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics — 2x4 on mobile, 4x2 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <StatBox title="Net Profit" value={backtest?.netProfit} prefix="$" isCurrency isLoading={isBacktestLoading} valueClass="text-success" />
          <StatBox title="Total Return" value={backtest?.totalReturn} suffix="%" isLoading={isBacktestLoading} valueClass="text-success" />
          <StatBox title="Profit Factor" value={backtest?.profitFactor} isLoading={isBacktestLoading} />
          <StatBox title="Win Rate" value={backtest?.winRate} suffix="%" isLoading={isBacktestLoading} />
          <StatBox title="Total Trades" value={backtest?.totalTrades} isLoading={isBacktestLoading} />
          <StatBox title="Sharpe Ratio" value={backtest?.sharpeRatio} isLoading={isBacktestLoading} />
          <StatBox title="Max Drawdown" value={backtest?.maxDrawdown} suffix="%" isLoading={isBacktestLoading} valueClass="text-destructive" />
          <StatBox title="Expectancy" value={backtest?.expectancy} prefix="$" isLoading={isBacktestLoading} />
        </div>

        {/* Chart + Info — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          <Card className="lg:col-span-9 border-border bg-card">
            <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
              <CardTitle className="text-sm">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-2 sm:px-4">
              <div className="h-[220px] sm:h-[280px] lg:h-[300px]">
                {isCurveLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve || []}>
                      <defs>
                        <linearGradient id="colorEquityBT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={42} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                      <Area type="monotone" dataKey="equity" stroke="#4F46E5" fill="url(#colorEquityBT)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-border bg-card">
            <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
              <CardTitle className="text-sm">Backtest Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Duration</span>
                <span className="font-medium text-xs">5 months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Total Days</span>
                <span className="font-medium text-xs">{backtest?.totalDays || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Total Bars</span>
                <span className="font-medium text-xs">{backtest?.totalBars?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Data Quality</span>
                <span className="font-medium text-xs text-success">{backtest?.dataQuality || 99.9}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Initial Balance</span>
                <span className="font-medium text-xs">${backtest?.initialBalance?.toLocaleString() || 10000}</span>
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
          <h3 className={`text-sm sm:text-2xl font-bold leading-tight ${valueClass}`}>
            {prefix}{value != null ? value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 }) : 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}
