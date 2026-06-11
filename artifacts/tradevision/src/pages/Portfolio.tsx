import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetPortfolioOverview, useGetPortfolioAllocation, useGetPortfolioHoldings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#8B5CF6"];

export default function Portfolio() {
  const { data: overview, isLoading: isOverviewLoading } = useGetPortfolioOverview();
  const { data: allocation, isLoading: isAllocationLoading } = useGetPortfolioAllocation();
  const { data: holdings, isLoading: isHoldingsLoading } = useGetPortfolioHoldings();

  return (
    <Layout title="Portfolio" subtitle="Detailed analysis of your investments and assets">
      <div className="flex flex-col gap-6">
        
        {/* Top Stats */}
        <div className="grid grid-cols-6 gap-4">
          <StatBox title="Total Equity" value={overview?.totalEquity} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Net Profit" value={overview?.netProfit} prefix="$" isCurrency isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Daily P&L" value={overview?.dailyPnl} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Total Return" value={overview?.totalReturn} suffix="%" isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Sharpe Ratio" value={overview?.sharpeRatio} isLoading={isOverviewLoading} />
          <StatBox title="Max Drawdown" value={overview?.maxDrawdown} suffix="%" isLoading={isOverviewLoading} valueClass="text-destructive" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-4 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-64 w-full">
                {isAllocationLoading ? <Skeleton className="w-full h-full rounded-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
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
              <div className="w-full mt-4 space-y-2">
                {allocation?.map((item, i) => (
                  <div key={item.assetClass} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span>{item.assetClass}</span>
                    </div>
                    <span className="font-medium">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm">Holdings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-accent/30 hover:bg-accent/30">
                    <TableHead>Symbol</TableHead>
                    <TableHead>Asset Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="text-right">Alloc %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isHoldingsLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : holdings?.map((holding, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell className="font-semibold text-xs">{holding.symbol}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{holding.asset}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${holding.type === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'}`}>
                          {holding.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right">{holding.quantity}</TableCell>
                      <TableCell className="text-xs text-right">${holding.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                      <TableCell className="text-xs text-right font-medium">${holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                      <TableCell className={`text-xs text-right font-bold ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-xs text-right">{holding.allocation}%</TableCell>
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

function StatBox({ title, value, prefix = "", suffix = "", isLoading, valueClass = "text-foreground", isCurrency = false }: any) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 flex flex-col justify-center gap-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-8 w-24" /> : (
          <h3 className={`text-xl font-bold ${valueClass}`}>
            {prefix}{value != null ? value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 }) : 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}