import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetCopyTraders, useGetCopyTradingStats, useGetCopyTradingStrategies } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Search, Users, Activity } from "lucide-react";

export default function CopyTrading() {
  const { data: traders, isLoading: isTradersLoading } = useGetCopyTraders();
  const { data: stats, isLoading: isStatsLoading } = useGetCopyTradingStats();

  return (
    <Layout title="Copy Trading" subtitle="Discover and copy top performing traders">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Features Row — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <FeatureCard icon={ShieldCheck} title="Verified Traders" desc="All master traders pass strict KYC and performance verification." />
          <FeatureCard icon={Activity} title="Real-time Copy" desc="Trades are copied instantly with minimal slippage." />
          <FeatureCard icon={Users} title="Flexible Control" desc="Set your own risk limits and stop copy rules." />
          <FeatureCard icon={ShieldCheck} title="Secure & Transparent" desc="Funds remain in your broker account at all times." />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 p-3 bg-card border border-border rounded-lg items-center">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search traders..." className="bg-accent border border-border rounded pl-9 pr-3 py-1.5 text-xs sm:text-sm w-full" />
          </div>
          <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm"><option>All Markets</option></select>
          <select className="bg-accent border border-border rounded px-2.5 py-1.5 text-xs sm:text-sm"><option>All Strategies</option></select>
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">Filters</Button>
        </div>

        {/* Trader Grid — 2 cols on mobile, 3 on tablet, 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {isTradersLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          ) : traders?.map((trader, i) => (
            <Card key={trader.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="p-3 sm:p-4 flex flex-col items-center text-center relative pb-2">
                <Badge className="absolute top-2 left-2 bg-accent text-muted-foreground text-[10px] px-1.5">#{trader.rank || i+1}</Badge>
                {trader.isVerified && <ShieldCheck className="absolute top-2 right-2 w-3.5 h-3.5 text-success" />}
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mb-1.5 sm:mb-2 border-2 border-border">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.id}`} />
                  <AvatarFallback className="text-xs">{trader.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-xs sm:text-sm leading-tight">{trader.name}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">{trader.strategy}</p>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-1 sm:pt-2 flex-1">
                <div className="flex flex-col items-center mb-2 sm:mb-4">
                  <span className="text-lg sm:text-2xl font-bold text-success">+{trader.roi}%</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">ROI All Time</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="flex flex-col p-1.5 sm:p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-0.5 text-[9px] sm:text-xs">Win Rate</span>
                    <span className="font-semibold text-[10px] sm:text-xs">{trader.winRate}%</span>
                  </div>
                  <div className="flex flex-col p-1.5 sm:p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-0.5 text-[9px] sm:text-xs">Copiers</span>
                    <span className="font-semibold text-[10px] sm:text-xs">{trader.copiers}</span>
                  </div>
                  <div className="flex flex-col p-1.5 sm:p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-0.5 text-[9px] sm:text-xs">Risk</span>
                    <span className="font-semibold text-[10px] sm:text-xs">{trader.riskScore}/10</span>
                  </div>
                  <div className="flex flex-col p-1.5 sm:p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-0.5 text-[9px] sm:text-xs">Max DD</span>
                    <span className="font-semibold text-[10px] sm:text-xs text-destructive">{trader.maxDrawdown}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-2 sm:p-4 pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90 h-7 sm:h-8 text-xs" size="sm">Copy</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-card border border-border rounded-lg">
      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-primary shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold mb-0.5 leading-tight">{title}</h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </div>
  )
}
