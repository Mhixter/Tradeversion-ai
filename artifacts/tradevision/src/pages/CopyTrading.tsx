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
  const { data: strategies, isLoading: isStratsLoading } = useGetCopyTradingStrategies();

  return (
    <Layout title="Copy Trading" subtitle="Discover and copy top performing traders">
      <div className="flex flex-col gap-6">
        
        {/* Features Row */}
        <div className="grid grid-cols-4 gap-4">
          <FeatureCard icon={ShieldCheck} title="Verified Traders" desc="All master traders pass strict KYC and performance verification." />
          <FeatureCard icon={Activity} title="Real-time Copy" desc="Trades are copied instantly with minimal slippage." />
          <FeatureCard icon={Users} title="Flexible Control" desc="Set your own risk limits, max drawdown, and stop copy rules." />
          <FeatureCard icon={ShieldCheck} title="Secure & Transparent" desc="Funds remain in your broker account at all times." />
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 p-3 bg-card border border-border rounded-lg items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search traders..." className="bg-accent border border-border rounded pl-9 pr-3 py-1.5 text-sm w-full" />
          </div>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm"><option>All Markets</option></select>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm"><option>All Strategies</option></select>
          <select className="bg-accent border border-border rounded px-3 py-1.5 text-sm"><option>Min. Win Rate</option></select>
          <Button variant="outline" size="sm" className="h-9">Filters</Button>
        </div>

        {/* Trader Grid */}
        <div className="grid grid-cols-5 gap-4">
          {isTradersLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          ) : traders?.map((trader, i) => (
            <Card key={trader.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 flex flex-col items-center text-center relative pb-2">
                <Badge className="absolute top-2 left-2 bg-accent text-muted-foreground">#{trader.rank || i+1}</Badge>
                {trader.isVerified && <ShieldCheck className="absolute top-2 right-2 w-4 h-4 text-success" />}
                <Avatar className="w-16 h-16 mb-2 border-2 border-border">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.id}`} />
                  <AvatarFallback>{trader.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-base">{trader.name}</h3>
                <p className="text-xs text-muted-foreground">{trader.strategy}</p>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex flex-col items-center mb-4">
                  <span className="text-2xl font-bold text-success">+{trader.roi}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ROI All Time</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="flex flex-col p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-1">Win Rate</span>
                    <span className="font-semibold">{trader.winRate}%</span>
                  </div>
                  <div className="flex flex-col p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-1">Copiers</span>
                    <span className="font-semibold">{trader.copiers}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-1">Risk</span>
                    <span className="font-semibold">{trader.riskScore}/10</span>
                  </div>
                  <div className="flex flex-col p-2 bg-accent rounded">
                    <span className="text-muted-foreground mb-1">Max DD</span>
                    <span className="font-semibold text-destructive">{trader.maxDrawdown}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90" size="sm">Copy Strategy</Button>
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
    <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}