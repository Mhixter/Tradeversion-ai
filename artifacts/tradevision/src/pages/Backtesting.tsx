import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetBacktests, useGetBacktest, useGetBacktestTrades, useGetBacktestEquityCurve, useGetBacktestMonthlyPerformance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Backtesting() {
  const { data: backtests, isLoading: isListLoading } = useGetBacktests();
  // Using the first backtest for preview if available
  const backtestId = backtests?.[0]?.id || 1;
  const { data: backtest, isLoading: isBacktestLoading } = useGetBacktest(backtestId);
  const { data: trades, isLoading: isTradesLoading } = useGetBacktestTrades(backtestId);
  const { data: equityCurve, isLoading: isCurveLoading } = useGetBacktestEquityCurve(backtestId);
  const { data: monthlyPerf, isLoading: isPerfLoading } = useGetBacktestMonthlyPerformance(backtestId);

  return (
    <Layout title="Backtesting" subtitle="Historical strategy performance analysis">
      <div className="flex flex-col gap-6">
        
        {/* Top Bar */}
        <div className="flex gap-4 p-4 bg-card border border-border rounded-lg items-center">
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm flex-1"><option>AI Scalper Pro</option></select>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm flex-1"><option>MT5 - IC Markets</option></select>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm w-32"><option>EURUSD</option></select>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm w-32"><option>M15</option></select>
          <input type="date" className="bg-accent border border-border rounded px-3 py-1.5 text-sm" />
          <span className="text-muted-foreground">-</span>
          <input type="date" className="bg-accent border border-border rounded px-3 py-1.5 text-sm" />
          <Button className="bg-primary hover:bg-primary/90">Run New Backtest</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {["Overview", "Performance", "Trades", "Risk Analysis", "Equity Curve", "Drawdown", "Monthly Report"].map((t, i) => (
            <div key={t} className={`pb-2 px-2 text-sm font-medium cursor-pointer ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
            </div>
          ))}
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <StatBox title="Net Profit" value={backtest?.netProfit} prefix="$" isCurrency isLoading={isBacktestLoading} valueClass="text-success" />
          <StatBox title="Total Return" value={backtest?.totalReturn} suffix="%" isLoading={isBacktestLoading} valueClass="text-success" />
          <StatBox title="Profit Factor" value={backtest?.profitFactor} isLoading={isBacktestLoading} />
          <StatBox title="Win Rate" value={backtest?.winRate} suffix="%" isLoading={isBacktestLoading} />
          <StatBox title="Total Trades" value={backtest?.totalTrades} isLoading={isBacktestLoading} />
          <StatBox title="Sharpe Ratio" value={backtest?.sharpeRatio} isLoading={isBacktestLoading} />
          <StatBox title="Max Drawdown" value={backtest?.maxDrawdown} suffix="%" isLoading={isBacktestLoading} valueClass="text-destructive" />
          <StatBox title="Expectancy" value={backtest?.expectancy} prefix="$" isLoading={isBacktestLoading} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-9 border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
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
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                      <Area type="monotone" dataKey="equity" stroke="#4F46E5" fill="url(#colorEquityBT)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm">Backtest Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">5 months</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Days</span><span className="font-medium">{backtest?.totalDays || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Bars</span><span className="font-medium">{backtest?.totalBars?.toLocaleString() || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Data Quality</span><span className="font-medium text-success">{backtest?.dataQuality || 99.9}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Initial Balance</span><span className="font-medium">${backtest?.initialBalance?.toLocaleString() || 10000}</span></div>
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
      <CardContent className="p-4 flex flex-col justify-center gap-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-8 w-24" /> : (
          <h3 className={`text-2xl font-bold ${valueClass}`}>
            {prefix}{value != null ? value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 }) : 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}