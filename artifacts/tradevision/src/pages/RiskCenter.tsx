import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetRiskOverview, useGetRiskLimits, useGetRiskAlerts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RiskCenter() {
  const { data: overview, isLoading: isOverviewLoading } = useGetRiskOverview();
  const { data: limits, isLoading: isLimitsLoading } = useGetRiskLimits();
  const { data: alerts, isLoading: isAlertsLoading } = useGetRiskAlerts();

  return (
    <Layout title="Risk Center" subtitle="Monitor and control your portfolio exposure">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Metrics Row — 2x3 on mobile, 6 cols on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          <MetricCard title="Risk Score" value={`${overview?.riskScore || 0}/100`} subtext={overview?.riskLabel} isLoading={isOverviewLoading} />
          <MetricCard title="VaR" value={`$${overview?.var_?.toLocaleString() ?? 0}`} subtext={`${overview?.varPercent}% Equity`} isLoading={isOverviewLoading} valueClass="text-destructive" />
          <MetricCard title="Exp. Shortfall" value={`$${overview?.expectedShortfall?.toLocaleString() ?? 0}`} isLoading={isOverviewLoading} />
          <MetricCard title="Daily Drawdown" value={`${overview?.dailyDrawdown}%`} isLoading={isOverviewLoading} />
          <MetricCard title="Max Drawdown" value={`${overview?.maxDrawdown}%`} isLoading={isOverviewLoading} valueClass="text-destructive" />
          <MetricCard title="Risk/Reward" value={overview?.riskRewardRatio} isLoading={isOverviewLoading} valueClass="text-success" />
        </div>

        {/* Tables — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Rules and Limits */}
          <Card className="lg:col-span-8 border-border bg-card">
            <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
              <CardTitle className="text-sm">Risk Limits Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/20">
                    <TableRow className="border-border">
                      <TableHead className="pl-4 whitespace-nowrap">Rule Name</TableHead>
                      <TableHead className="whitespace-nowrap">Usage</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Limit</TableHead>
                      <TableHead className="text-right pr-4 whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLimitsLoading ? (
                      Array(4).fill(0).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                      ))
                    ) : limits?.map((limit, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="pl-4 font-medium text-xs sm:text-sm whitespace-nowrap">{limit.rule}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[140px] sm:max-w-[200px] flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 h-1.5 sm:h-2 bg-accent rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${(limit.usagePercent ?? 0) > 80 ? 'bg-destructive' : (limit.usagePercent ?? 0) > 50 ? 'bg-amber-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(limit.usagePercent || 0, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold whitespace-nowrap">{limit.usagePercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{limit.limit}%</TableCell>
                        <TableCell className="text-right pr-4 whitespace-nowrap">
                          <Badge className={`text-[10px] uppercase ${limit.status === 'Safe' ? 'bg-success/20 text-success hover:bg-success/30' : limit.status === 'Warning' ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-destructive/20 text-destructive hover:bg-destructive/30'}`}>
                            {limit.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="lg:col-span-4 border-border bg-card">
            <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3">
              {isAlertsLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : alerts?.map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'danger' ? 'bg-destructive/5 border-destructive/20' : alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-accent border-border'}`}>
                  {alert.severity === 'danger' ? <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> : 
                   alert.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : 
                   <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-semibold text-foreground">{alert.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground font-medium">{alert.time}</span>
                  </div>
                </div>
              ))}
              {alerts?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <ShieldCheck className="w-10 h-10 text-success mb-2 opacity-50" />
                  <p className="text-sm font-medium">No active risk alerts</p>
                  <p className="text-xs">Operating within safe parameters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, subtext, isLoading, valueClass = "text-foreground" }: any) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-2.5 sm:p-4 flex flex-col justify-center gap-0.5 sm:gap-1">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{title}</p>
        {isLoading ? <Skeleton className="h-6 sm:h-7 w-16 sm:w-20 my-0.5" /> : (
          <h3 className={`text-sm sm:text-xl font-bold leading-tight ${valueClass}`}>
            {value}
          </h3>
        )}
        {(subtext || isLoading) && (
          isLoading ? <Skeleton className="h-3 w-12" /> : <p className="text-[10px] font-medium text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}
