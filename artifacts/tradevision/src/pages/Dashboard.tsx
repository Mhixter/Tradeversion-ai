import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetDashboardSummary, useGetEquityCurve, useGetDashboardRecentTrades, useGetDashboardSignals, useGetDashboardActiveBots, useGetDashboardConnectedAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Bot, DollarSign, Target, TrendingUp, TrendingDown, Gauge, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const { data: summary,    isLoading: isSummaryLoading }  = useGetDashboardSummary();
  const { data: equityCurve, isLoading: isCurveLoading }   = useGetEquityCurve();
  const { data: signals,    isLoading: isSignalsLoading }  = useGetDashboardSignals();
  const { data: activeBots, isLoading: isBotsLoading }     = useGetDashboardActiveBots();
  const { data: accounts,   isLoading: isAccountsLoading } = useGetDashboardConnectedAccounts();
  const { data: trades,     isLoading: isTradesLoading }   = useGetDashboardRecentTrades();

  const { connected, lastTick } = useWebSocket();

  // Summary comes exclusively from the authenticated REST API (per-user data).
  // WebSocket only carries market signals — no fake equity/winRate fallbacks.
  const liveSummary = summary;
  const liveSignals = lastTick?.signals ?? signals;
  const liveBots    = activeBots;

  const [timeframe, setTimeframe] = useState("1D");

  return (
    <Layout title="Dashboard" subtitle="Overview">
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* Live indicator bar */}
        <div className="flex items-center justify-end gap-2">
          {connected ? (
            <div className="flex items-center gap-1.5 text-xs text-success font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <Wifi className="w-3 h-3" />
              Live feed connected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              Connecting…
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Equity"  value={liveSummary?.totalEquity}  prefix="$" change={liveSummary?.equityChange24h} isLoading={isSummaryLoading && !lastTick} icon={DollarSign} flash={!!lastTick} />
          <StatCard title="Daily Profit"  value={liveSummary?.dailyProfit}  prefix="$" change={liveSummary?.profitChange}     isLoading={isSummaryLoading && !lastTick} icon={TrendingUp}  flash={!!lastTick} />
          <StatCard title="Active Bots"   value={liveSummary?.activeBots}                change={summary?.newBots}             isLoading={isSummaryLoading && !lastTick} icon={Bot} />
          <StatCard title="Win Rate"      value={liveSummary?.winRate}      suffix="%" change={summary?.winRateChange}        isLoading={isSummaryLoading && !lastTick} icon={Target} />
        </div>

        {/* Main chart + right panels */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          <Card className="lg:col-span-8 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
              <CardTitle className="text-sm font-semibold">Portfolio Performance</CardTitle>
              <div className="flex space-x-0.5 sm:space-x-1">
                {["1H", "4H", "1D", "1W", "1M"].map(t => (
                  <Badge
                    key={t}
                    variant={t === timeframe ? "default" : "outline"}
                    className="cursor-pointer text-[10px] px-1.5 py-0.5 sm:text-xs sm:px-2"
                    onClick={() => setTimeframe(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <div className="h-[220px] sm:h-[280px] lg:h-[350px]">
                {isCurveLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve || []} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="colorBuyHold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={42} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", fontSize: 12 }} />
                      <Area type="monotone" dataKey="buyHold" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 3" fillOpacity={1} fill="url(#colorBuyHold)" name="Buy & Hold" />
                      <Area type="monotone" dataKey="equity"  stroke="#4F46E5" strokeWidth={2}   fillOpacity={1} fill="url(#colorEquity)"   name="Portfolio"   />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 px-1">
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded-full inline-block" /><span className="text-[10px] text-muted-foreground">Portfolio</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block border-dashed" /><span className="text-[10px] text-muted-foreground">Buy &amp; Hold</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* AI Signals — live */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  AI Signal Center
                  <div className="flex items-center gap-1.5">
                    {connected && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                      </span>
                    )}
                    <Badge variant="outline" className="text-[10px] font-normal border-primary text-primary">LIVE</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3">
                <div className="flex flex-col gap-2.5">
                  {isSignalsLoading && !lastTick ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  ) : liveSignals?.slice(0, 4).map((signal: any) => (
                    <div key={signal.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] h-5 min-w-[36px] justify-center ${signal.direction === "BUY" ? "bg-buy hover:bg-buy" : "bg-sell hover:bg-sell"}`}>
                          {signal.direction}
                        </Badge>
                        <span className="font-semibold text-foreground text-xs">{signal.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-xs tabular-nums">{signal.price.toFixed(signal.symbol === "BTCUSD" || signal.symbol === "ETHUSD" ? 2 : 5)}</p>
                        <p className="text-[10px] text-muted-foreground">{signal.confidence}% conf</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Overview */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-0 px-4">
                <CardTitle className="text-sm font-semibold">Risk Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 flex flex-col items-center justify-center px-4">
                <div className="w-full flex justify-between text-sm mb-3">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Daily Drawdown</span>
                    <span className="font-semibold text-foreground tabular-nums">{(liveSummary?.maxDrawdown ?? summary?.maxDrawdown ?? 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Risk/Reward</span>
                    <span className="font-semibold text-foreground tabular-nums">{(liveSummary?.sharpeRatio ?? summary?.sharpeRatio ?? 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Gauge className="w-5 h-5 text-success" />
                  <span className="text-success font-semibold text-sm">Low Risk</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Connected Accounts */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold flex justify-between">
                Connected Accounts
                <span className="text-muted-foreground text-xs font-normal">Manage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <div className="flex flex-col gap-2.5">
                {isAccountsLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : accounts?.slice(0, 3).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center p-2 border border-border rounded hover:border-primary/50 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">{account.platform} - {account.broker}</span>
                      <span className="text-[10px] text-muted-foreground">{account.accountNumber}</span>
                    </div>
                    <div className="text-right flex flex-col shrink-0 ml-2">
                      <span className="text-sm font-bold text-foreground tabular-nums">${account.equity.toLocaleString()}</span>
                      <span className="text-[10px] text-success">Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Bots — live P&L */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Active Bots
                {connected && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <div className="flex flex-col gap-2">
                {isBotsLoading && !lastTick ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : (liveBots as any[])?.slice(0, 4).map((bot: any) => (
                  <div key={bot.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${bot.status === "RUNNING" ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                      <span className="font-medium text-xs truncate">{bot.name}</span>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-2">
                      <span className="text-muted-foreground text-xs">{bot.symbol}</span>
                      <span className={`text-xs text-right w-16 tabular-nums font-semibold ${bot.pnlToday >= 0 ? "text-success" : "text-destructive"}`}>
                        {bot.pnlToday >= 0 ? "+" : ""}{bot.pnlToday.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="h-8 text-xs px-2">Symbol</TableHead>
                    <TableHead className="h-8 text-xs px-2 text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTradesLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-2 py-2"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="px-2 py-2"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : (trades as any[])?.slice(0, 5).map((trade: any) => (
                    <TableRow key={trade.id} className="border-border">
                      <TableCell className="px-2 py-1.5 text-xs">
                        <div className="flex gap-2 items-center">
                          <span className={`font-bold text-[10px] ${trade.type === "BUY" ? "text-buy" : "text-sell"}`}>{trade.type}</span>
                          <span className="font-medium">{trade.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`px-2 py-1.5 text-xs text-right font-medium tabular-nums ${trade.profit >= 0 ? "text-success" : "text-destructive"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, prefix = "", suffix = "", change, isLoading, icon: Icon, flash = false }: {
  title: string; value?: number; prefix?: string; suffix?: string;
  change?: number; isLoading?: boolean; icon: any; flash?: boolean;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{title}</p>
          <div className="p-1 sm:p-1.5 rounded-md bg-accent text-muted-foreground">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1">
          {isLoading ? <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" /> : (
            <h3 className={`text-lg sm:text-2xl font-bold text-foreground leading-tight tabular-nums transition-colors ${flash ? "duration-500" : ""}`}>
              {prefix}{typeof value === "number"
                ? value.toLocaleString(undefined, { minimumFractionDigits: title.includes("Profit") || title.includes("Equity") ? 2 : 0, maximumFractionDigits: 2 })
                : value}{suffix}
            </h3>
          )}
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            {isLoading ? <Skeleton className="h-4 w-14" /> : (
              <Badge variant="outline" className={`h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 font-semibold border-transparent ${isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {isPositive ? "+" : ""}{(change ?? 0).toFixed(2)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
