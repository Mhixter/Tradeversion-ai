import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetBots, useGetBotsStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Square, Pause, MoreVertical, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BotManager() {
  const { data: bots, isLoading: isBotsLoading } = useGetBots();
  const { data: stats, isLoading: isStatsLoading } = useGetBotsStats();

  return (
    <Layout title="Bot Manager" subtitle="Manage and monitor your active trading bots">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Header Actions */}
        <div className="flex justify-end gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Import
          </Button>
          <Button variant="default" size="sm" className="h-8 sm:h-9 bg-primary text-xs sm:text-sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Bot
          </Button>
        </div>

        {/* Stats Row — 3 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <StatCard title="Total Bots" value={stats?.totalBots} isLoading={isStatsLoading} />
          <StatCard title="Running" value={stats?.running} isLoading={isStatsLoading} valueClass="text-success" />
          <StatCard title="Stopped" value={stats?.stopped} isLoading={isStatsLoading} valueClass="text-destructive" />
          <StatCard title="Paused" value={stats?.paused} isLoading={isStatsLoading} valueClass="text-amber-500" />
          <StatCard title="Total Profit" value={stats?.totalProfit} prefix="$" isLoading={isStatsLoading} valueClass="text-success" />
          <StatCard title="Win Rate" value={stats?.avgWinRate} suffix="%" isLoading={isStatsLoading} />
        </div>

        {/* Main content — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-9 flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 p-3 bg-card border border-border rounded-lg items-center">
              <input type="text" placeholder="Search bots..." className="bg-accent border border-border rounded px-3 py-1.5 text-xs sm:text-sm flex-1 min-w-[120px]" />
              <select className="bg-accent border border-border rounded px-2 py-1.5 text-xs sm:text-sm">
                <option>All Status</option>
              </select>
              <select className="bg-accent border border-border rounded px-2 py-1.5 text-xs sm:text-sm">
                <option>All Accounts</option>
              </select>
            </div>

            {/* Table — scrollable on mobile */}
            <Card className="border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/50">
                    <TableRow className="border-border">
                      <TableHead className="font-medium whitespace-nowrap">Bot Name</TableHead>
                      <TableHead className="font-medium hidden sm:table-cell whitespace-nowrap">Strategy</TableHead>
                      <TableHead className="font-medium whitespace-nowrap">Market</TableHead>
                      <TableHead className="font-medium whitespace-nowrap">Status</TableHead>
                      <TableHead className="font-medium text-right whitespace-nowrap">P&L Today</TableHead>
                      <TableHead className="font-medium text-right hidden md:table-cell whitespace-nowrap">P&L All Time</TableHead>
                      <TableHead className="font-medium text-right hidden sm:table-cell whitespace-nowrap">Win %</TableHead>
                      <TableHead className="font-medium text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isBotsLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                      ))
                    ) : bots?.map(bot => (
                      <TableRow key={bot.id} className="border-border hover:bg-accent/50">
                        <TableCell className="font-medium text-sm whitespace-nowrap">{bot.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs hidden sm:table-cell whitespace-nowrap">{bot.strategy}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {bot.market}
                          <span className="text-muted-foreground ml-1 text-[10px]">{bot.timeframe}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className={`text-[10px] font-semibold tracking-wider whitespace-nowrap ${
                            bot.status === 'RUNNING' ? 'text-success border-success/30 bg-success/10' :
                            bot.status === 'STOPPED' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                            'text-amber-500 border-amber-500/30 bg-amber-500/10'
                          }`}>
                            {bot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium text-xs whitespace-nowrap ${bot.pnlToday >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {bot.pnlToday >= 0 ? '+' : ''}${bot.pnlToday.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-medium text-xs hidden md:table-cell whitespace-nowrap ${bot.pnlAllTime >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {bot.pnlAllTime >= 0 ? '+' : ''}${bot.pnlAllTime.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-xs hidden sm:table-cell whitespace-nowrap">{bot.winRate}%</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5 text-muted-foreground">
                            {bot.status !== 'RUNNING' && <button className="hover:text-success p-0.5"><Play className="w-3.5 h-3.5" /></button>}
                            {bot.status === 'RUNNING' && <button className="hover:text-amber-500 p-0.5"><Pause className="w-3.5 h-3.5" /></button>}
                            {bot.status !== 'STOPPED' && <button className="hover:text-destructive p-0.5"><Square className="w-3.5 h-3.5" /></button>}
                            <button className="hover:text-foreground p-0.5"><MoreVertical className="w-3.5 h-3.5" /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="py-3 sm:py-4 px-4">
                <CardTitle className="text-sm">Top Performing Bots</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="space-y-3">
                  {bots?.slice(0,5).map(b => (
                    <div key={b.id} className="flex justify-between items-center text-sm border-b border-border pb-2.5 last:border-0">
                      <span className="font-medium truncate mr-2 text-xs">{b.name}</span>
                      <span className={`font-semibold shrink-0 text-xs ${b.pnlAllTime >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {b.pnlAllTime >= 0 ? '+' : ''}${b.pnlAllTime.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, prefix = "", suffix = "", isLoading, valueClass = "text-foreground" }: any) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1 justify-center">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{title}</p>
        {isLoading ? <Skeleton className="h-6 sm:h-8 w-12 sm:w-20" /> : (
          <h3 className={`text-sm sm:text-2xl font-bold leading-tight ${valueClass}`}>
            {prefix}{value?.toLocaleString() ?? 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}
