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
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Top Stats — 3 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <StatBox title="Total Equity" value={overview?.totalEquity} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Net Profit" value={overview?.netProfit} prefix="$" isCurrency isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Daily P&L" value={overview?.dailyPnl} prefix="$" isCurrency isLoading={isOverviewLoading} />
          <StatBox title="Total Return" value={overview?.totalReturn} suffix="%" isLoading={isOverviewLoading} valueClass="text-success" />
          <StatBox title="Sharpe Ratio" value={overview?.sharpeRatio} isLoading={isOverviewLoading} />
          <StatBox title="Max Drawdown" value={overview?.maxDrawdown} suffix="%" isLoading={isOverviewLoading} valueClass="text-destructive" />
        </div>

        {/* Chart + Table — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Pie chart — full width on mobile, 4 cols on desktop */}
          <Card className="lg:col-span-4 border-border bg-card">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center px-4">
              <div className="h-52 w-full max-w-xs mx-auto">
                {isAllocationLoading ? <Skeleton className="w-full h-full rounded-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
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
              <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2">
                {allocation?.map((item, i) => (
                  <div key={item.assetClass} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs">{item.assetClass}</span>
                    </div>
                    <span className="font-medium text-xs">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holdings table — full width on mobile, 8 cols on desktop */}
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
                    ) : holdings?.map((holding, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="font-semibold text-xs pl-4 whitespace-nowrap">{holding.symbol}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{holding.asset}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${holding.type === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'}`}>
                            {holding.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">{holding.quantity}</TableCell>
                        <TableCell className="text-xs text-right hidden md:table-cell whitespace-nowrap">${holding.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        <TableCell className="text-xs text-right font-medium whitespace-nowrap">${holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        <TableCell className={`text-xs text-right font-bold whitespace-nowrap ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-xs text-right hidden sm:table-cell whitespace-nowrap">{holding.allocation}%</TableCell>
                      </TableRow>
                    ))}
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
            {prefix}{value != null ? value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: 2 }) : 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  )
}
