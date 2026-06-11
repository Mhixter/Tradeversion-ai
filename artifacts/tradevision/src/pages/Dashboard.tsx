import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetDashboardSummary, useGetEquityCurve, useGetDashboardRecentTrades, useGetDashboardSignals, useGetDashboardActiveBots, useGetDashboardConnectedAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ArrowUpRight, ArrowDownRight, Bot, Activity, DollarSign, Target, TrendingUp, TrendingDown, Clock, ShieldCheck, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PIE_COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#06B6D4", "#6366F1"];

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: equityCurve, isLoading: isCurveLoading } = useGetEquityCurve();
  const { data: signals, isLoading: isSignalsLoading } = useGetDashboardSignals();
  const { data: activeBots, isLoading: isBotsLoading } = useGetDashboardActiveBots();
  const { data: accounts, isLoading: isAccountsLoading } = useGetDashboardConnectedAccounts();
  const { data: trades, isLoading: isTradesLoading } = useGetDashboardRecentTrades();

  return (
    <Layout title="Dashboard" subtitle="Overview">
      <div className="flex flex-col gap-6">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Equity" value={summary?.totalEquity} prefix="$" change={summary?.equityChange24h} isLoading={isSummaryLoading} icon={DollarSign} />
          <StatCard title="Daily Profit" value={summary?.dailyProfit} prefix="$" change={summary?.profitChange} isLoading={isSummaryLoading} icon={TrendingUp} />
          <StatCard title="Active Bots" value={summary?.activeBots} change={summary?.newBots} isLoading={isSummaryLoading} icon={Bot} />
          <StatCard title="Win Rate" value={summary?.winRate} suffix="%" change={summary?.winRateChange} isLoading={isSummaryLoading} icon={Target} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Chart */}
          <Card className="col-span-8 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Portfolio Performance</CardTitle>
              <div className="flex space-x-1">
                {["1H", "4H", "1D", "1W", "1M", "1Y"].map(t => (
                  <Badge key={t} variant={t === "1D" ? "default" : "outline"} className="cursor-pointer">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {isCurveLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="equity" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Panels */}
          <div className="col-span-4 flex flex-col gap-6">
            <Card className="border-border bg-card flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  AI Signal Center
                  <Badge variant="outline" className="text-[10px] font-normal border-primary text-primary">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="flex flex-col gap-3">
                  {isSignalsLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  ) : signals?.slice(0, 4).map(signal => (
                    <div key={signal.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] h-5 ${signal.direction === 'BUY' ? 'bg-buy hover:bg-buy' : 'bg-sell hover:bg-sell'}`}>
                          {signal.direction}
                        </Badge>
                        <span className="font-semibold text-foreground">{signal.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{signal.price.toFixed(5)}</p>
                        <p className="text-[10px] text-muted-foreground">{signal.confidence}% Confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card flex-1">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-semibold">Risk Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col items-center justify-center">
                <div className="w-full flex justify-between text-sm mb-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Daily Drawdown</span>
                    <span className="font-semibold text-foreground">{summary?.maxDrawdown}%</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Risk/Reward</span>
                    <span className="font-semibold text-foreground">{summary?.sharpeRatio}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Gauge className="w-6 h-6 text-success" />
                  <span className="text-success font-semibold">Low Risk</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between">
                Connected Accounts
                <span className="text-muted-foreground text-xs font-normal">Manage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col gap-3">
                  {isAccountsLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                  ) : accounts?.slice(0, 3).map(account => (
                    <div key={account.id} className="flex justify-between items-center p-2 border border-border rounded hover:border-primary/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{account.platform} - {account.broker}</span>
                        <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                      </div>
                      <div className="text-right flex flex-col">
                        <span className="text-sm font-bold text-foreground">${account.equity.toLocaleString()}</span>
                        <span className="text-[10px] text-success">Connected</span>
                      </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Active Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                  {isBotsLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  ) : activeBots?.slice(0, 4).map(bot => (
                    <div key={bot.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bot.status === 'RUNNING' ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                        <span className="font-medium">{bot.name}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground w-16">{bot.symbol}</span>
                        <span className={`w-16 text-right ${bot.pnlToday >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {bot.pnlToday >= 0 ? '+' : ''}{bot.pnlToday.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
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
                  ) : trades?.slice(0, 4).map(trade => (
                     <TableRow key={trade.id} className="border-border">
                       <TableCell className="px-2 py-1.5 text-xs">
                         <div className="flex gap-2 items-center">
                           <span className={trade.type === 'BUY' ? 'text-buy font-bold' : 'text-sell font-bold'}>{trade.type}</span>
                           <span className="font-medium">{trade.symbol}</span>
                         </div>
                       </TableCell>
                       <TableCell className={`px-2 py-1.5 text-xs text-right font-medium ${trade.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                         {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
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

function StatCard({ title, value, prefix = "", suffix = "", change, isLoading, icon: Icon }: any) {
  const isPositive = change >= 0;
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="p-1.5 rounded-md bg-accent text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {isLoading ? <Skeleton className="h-7 w-24" /> : (
            <h3 className="text-2xl font-bold text-foreground">
              {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: title.includes('Profit') ? 2 : 0, maximumFractionDigits: 2 }) : value}{suffix}
            </h3>
          )}
          
          <div className="flex items-center gap-1 mt-1">
            {isLoading ? <Skeleton className="h-4 w-16" /> : (
              <>
                <Badge variant="outline" className={`h-5 text-[10px] px-1 font-semibold border-transparent ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {isPositive ? '+' : ''}{change}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}