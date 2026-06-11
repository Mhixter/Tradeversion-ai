import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetBots, useGetBotsStats, useGetTopPerformingBots } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Square, Pause, MoreVertical, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BotManager() {
  const { data: bots, isLoading: isBotsLoading } = useGetBots();
  const { data: stats, isLoading: isStatsLoading } = useGetBotsStats();

  return (
    <Layout title="Bot Manager" subtitle="Manage and monitor your active trading bots">
      <div className="flex flex-col gap-6">
        
        {/* Header Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" className="h-9"><Download className="w-4 h-4 mr-2" /> Import Bot</Button>
          <Button variant="default" size="sm" className="h-9 bg-primary"><Plus className="w-4 h-4 mr-2" /> Create New Bot</Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-6 gap-4">
          <StatCard title="Total Bots" value={stats?.totalBots} isLoading={isStatsLoading} />
          <StatCard title="Running" value={stats?.running} isLoading={isStatsLoading} valueClass="text-success" />
          <StatCard title="Stopped" value={stats?.stopped} isLoading={isStatsLoading} valueClass="text-destructive" />
          <StatCard title="Paused" value={stats?.paused} isLoading={isStatsLoading} valueClass="text-amber-500" />
          <StatCard title="Total Profit" value={stats?.totalProfit} prefix="$" isLoading={isStatsLoading} valueClass="text-success" />
          <StatCard title="Win Rate Avg" value={stats?.avgWinRate} suffix="%" isLoading={isStatsLoading} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-9 flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="flex gap-2 p-3 bg-card border border-border rounded-lg items-center">
              <input type="text" placeholder="Search bots..." className="bg-accent border border-border rounded px-3 py-1.5 text-sm w-64" />
              <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm"><option>All Status</option></select>
              <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm"><option>All Accounts</option></select>
            </div>

            {/* Main Table */}
            <Card className="border-border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow className="border-border">
                    <TableHead className="font-medium">Bot Name</TableHead>
                    <TableHead className="font-medium">Strategy</TableHead>
                    <TableHead className="font-medium">Market</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">P&L (Today)</TableHead>
                    <TableHead className="font-medium text-right">P&L (All Time)</TableHead>
                    <TableHead className="font-medium text-right">Win Rate</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isBotsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    ))
                  ) : bots?.map(bot => (
                    <TableRow key={bot.id} className="border-border hover:bg-accent/50">
                      <TableCell className="font-medium">{bot.name}</TableCell>
                      <TableCell className="text-muted-foreground">{bot.strategy}</TableCell>
                      <TableCell>{bot.market} <span className="text-muted-foreground text-xs ml-1">{bot.timeframe}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-semibold tracking-wider ${
                          bot.status === 'RUNNING' ? 'text-success border-success/30 bg-success/10' :
                          bot.status === 'STOPPED' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                          'text-amber-500 border-amber-500/30 bg-amber-500/10'
                        }`}>
                          {bot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${bot.pnlToday >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {bot.pnlToday >= 0 ? '+' : ''}${bot.pnlToday.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${bot.pnlAllTime >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {bot.pnlAllTime >= 0 ? '+' : ''}${bot.pnlAllTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{bot.winRate}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 text-muted-foreground">
                          {bot.status !== 'RUNNING' && <button className="hover:text-success"><Play className="w-4 h-4" /></button>}
                          {bot.status === 'RUNNING' && <button className="hover:text-amber-500"><Pause className="w-4 h-4" /></button>}
                          {bot.status !== 'STOPPED' && <button className="hover:text-destructive"><Square className="w-4 h-4" /></button>}
                          <button className="hover:text-foreground"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="col-span-3 flex flex-col gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Top Performing Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bots?.slice(0,5).map(b => (
                    <div key={b.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0">
                      <span className="font-medium truncate mr-2">{b.name}</span>
                      <span className="text-success font-semibold shrink-0">+${b.pnlAllTime.toLocaleString()}</span>
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
      <CardContent className="p-4 flex flex-col gap-1 justify-center">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-8 w-20" /> : (
          <h3 className={`text-2xl font-bold ${valueClass}`}>
            {prefix}{value?.toLocaleString() ?? 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}