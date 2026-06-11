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
      <div className="flex flex-col gap-6">
        
        {/* Metrics Row */}
        <div className="grid grid-cols-6 gap-4">
          <MetricCard title="Risk Score" value={`${overview?.riskScore || 0}/100`} subtext={overview?.riskLabel} isLoading={isOverviewLoading} />
          <MetricCard title="Value at Risk (VaR)" value={`$${overview?.var_.toLocaleString()}`} subtext={`${overview?.varPercent}% Equity`} isLoading={isOverviewLoading} valueClass="text-destructive" />
          <MetricCard title="Expected Shortfall" value={`$${overview?.expectedShortfall.toLocaleString()}`} isLoading={isOverviewLoading} />
          <MetricCard title="Daily Drawdown" value={`${overview?.dailyDrawdown}%`} isLoading={isOverviewLoading} />
          <MetricCard title="Max Drawdown" value={`${overview?.maxDrawdown}%`} isLoading={isOverviewLoading} valueClass="text-destructive" />
          <MetricCard title="Risk/Reward Ratio" value={overview?.riskRewardRatio} isLoading={isOverviewLoading} valueClass="text-success" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Rules and Limits */}
          <Card className="col-span-8 border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm">Risk Limits Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-accent/20">
                  <TableRow className="border-border">
                    <TableHead className="pl-4">Rule Name</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead className="text-right pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLimitsLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                    ))
                  ) : limits?.map((limit, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell className="pl-4 font-medium text-sm">{limit.rule}</TableCell>
                      <TableCell>
                        <div className="w-full max-w-[200px] flex items-center gap-3">
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${limit.usagePercent > 80 ? 'bg-destructive' : limit.usagePercent > 50 ? 'bg-amber-500' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(limit.usagePercent || 0, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{limit.usagePercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{limit.limit}%</TableCell>
                      <TableCell className="text-right pr-4">
                        <Badge className={`text-[10px] uppercase ${limit.status === 'Safe' ? 'bg-success/20 text-success hover:bg-success/30' : limit.status === 'Warning' ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-destructive/20 text-destructive hover:bg-destructive/30'}`}>
                          {limit.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="col-span-4 border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isAlertsLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : alerts?.map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'danger' ? 'bg-destructive/5 border-destructive/20' : alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-accent border-border'}`}>
                  {alert.severity === 'danger' ? <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" /> : 
                   alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /> : 
                   <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">{alert.time}</span>
                  </div>
                </div>
              ))}
              {alerts?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 text-success mb-2 opacity-50" />
                  <p className="text-sm font-medium">No active risk alerts</p>
                  <p className="text-xs">Your portfolio is operating within safe parameters.</p>
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
      <CardContent className="p-4 flex flex-col justify-center gap-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-7 w-20 my-1" /> : (
          <h3 className={`text-xl font-bold ${valueClass}`}>
            {value}
          </h3>
        )}
        {(subtext || isLoading) && (
          isLoading ? <Skeleton className="h-3 w-16" /> : <p className="text-[10px] font-medium text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}