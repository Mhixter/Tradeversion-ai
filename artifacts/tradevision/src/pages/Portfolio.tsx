import React from "react";
import { Layout } from "@/components/layout/Layout";
import {
  useGetPortfolioOverview,
  useGetPortfolioAllocation,
  useGetPortfolioHoldings,
  useGetPortfolioEquityCurve,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#8B5CF6"];

function EquityCurveChart() {
  const { data: curve, isLoading } = useGetPortfolioEquityCurve();

  if (isLoading) return <Skeleton className="w-full h-56" />;

  if (!curve || curve.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 gap-3 text-muted-foreground">
        <TrendingUp className="w-10 h-10 opacity-30" />
        <p className="text-sm font-medium">No performance data yet</p>
        <p className="text-xs opacity-70">Connect a broker and start a bot to see your equity curve</p>
      </div>
    );
  }

  const minY = Math.min(...curve.map((d: any) => Math.min(d.equity ?? 0, d.buyHold ?? 0)));
  const maxY = Math.max(...curve.map((d: any) => Math.max(d.equity ?? 0, d.buyHold ?? 0)));
  const yPad = (maxY - minY) * 0.1 || 1000;

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={curve} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <YAxis
          domain={[minY - yPad, maxY + yPad]}
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 11 }}
          formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
        />
        <Area type="monotone" dataKey="equity" name="Portfolio" stroke="#4F46E5" strokeWidth={2} fill="url(#eqGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Portfolio() {
  const { data: overview, isLoading: isOverviewLoading } = useGetPortfolioOverview();
  const { data: allocation, isLoading: isAllocationLoading } = useGetPortfolioAllocation();
  const { data: holdings, isLoading: isHoldingsLoading } = useGetPortfolioHoldings();

  return (
    <Layout title="Portfolio" subtitle="Detailed analysis of your investments and assets">
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* Top Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <StatBox title="Total Equity"  value={overview?.totalEquity}  prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Net Profit"    value={overview?.netProfit}    prefix="$" isCurrency isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Daily P&L"     value={overview?.dailyPnl}     prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Total Return"  value={overview?.totalReturn}  suffix="%" isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Sharpe Ratio"  value={overview?.sharpeRatio}             isLoading={isOverviewLoading} />
          <StatBox title="Max Drawdown"  value={overview?.maxDrawdown}  suffix="%" isLoading={isOverviewLoading} valueClass="text-destructive" />
        </div>

        {/* Equity Curve — real data from DB snapshots */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <CardTitle className="text-sm">Portfolio Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-4 overflow-hidden">
            <EquityCurveChart />
          </CardContent>
        </Card>

        {/* Allocation pie + Holdings table */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          <Card className="lg:col-span-4 border-border bg-card">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center px-4">
              {isAllocationLoading ? (
                <Skeleton className="w-44 h-44 rounded-full" />
              ) : allocation && allocation.length > 0 ? (
                <>
                  <div className="h-52 w-full max-w-xs mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocation}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={85}
                          paddingAngle={2} dataKey="percent" stroke="none"
                        >
                          {allocation.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(value: any) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2">
                    {allocation.map((item: any, i: number) => (
                      <div key={item.assetClass} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs">{item.assetClass}</span>
                        </div>
                        <span className="font-medium text-xs">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground">
                  <p className="text-sm">No allocation data yet</p>
                  <p className="text-xs opacity-70">Start bots to see allocation</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                    ) : holdings && holdings.length > 0 ? holdings.map((holding: any, i: number) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="font-semibold text-xs pl-4 whitespace-nowrap">{holding.symbol}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{holding.asset}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${holding.type === "BUY" ? "bg-buy/10 text-buy" : "bg-sell/10 text-sell"}`}>
                            {holding.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">{holding.quantity}</TableCell>
                        <TableCell className="text-xs text-right hidden md:table-cell whitespace-nowrap">${holding.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-xs text-right font-medium whitespace-nowrap">${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className={`text-xs text-right font-bold whitespace-nowrap ${holding.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs text-right hidden sm:table-cell whitespace-nowrap">{holding.allocation}%</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                          No holdings yet — connect a broker and run bots to see positions here
                        </TableCell>
                      </TableRow>
                    )}
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
            {prefix}{(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 })}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  );
}
