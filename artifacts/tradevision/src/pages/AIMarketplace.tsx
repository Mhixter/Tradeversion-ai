import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetMarketplaceListings, useGetMarketplaceHighlights } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, TrendingUp, Cpu, Filter } from "lucide-react";

export default function AIMarketplace() {
  const { data: listings, isLoading } = useGetMarketplaceListings();

  const categories = ["All Strategies", "AI Scalping", "Trend Following", "Swing Trading", "Mean Reversion", "Breakout"];

  return (
    <Layout title="AI Marketplace" subtitle="Discover and deploy premium AI trading strategies">
      <div className="flex flex-col gap-6">
        
        {/* Banner */}
        <div className="h-32 rounded-xl bg-gradient-to-r from-primary/20 via-indigo-900/40 to-background border border-primary/20 p-6 flex items-center justify-between overflow-hidden relative">
          <div className="z-10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Cpu className="text-primary"/> Premium AI Strategies</h2>
            <p className="text-muted-foreground text-sm max-w-md">Access institutional-grade algorithms built by top quant developers. Plug and play directly into your MT4/MT5 accounts.</p>
          </div>
          <Button className="z-10 bg-primary text-white">Explore Premium</Button>
          <div className="absolute right-0 top-0 opacity-20 pointer-events-none mix-blend-screen w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
        </div>

        <div className="flex gap-4 mb-2">
          {categories.map(c => (
            <Badge key={c} variant="secondary" className="px-4 py-1.5 text-xs font-medium cursor-pointer hover:bg-primary hover:text-white transition-colors">
              {c}
            </Badge>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1 grid grid-cols-3 gap-4">
            {isLoading ? (
               Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
            ) : listings?.map(item => (
              <Card key={item.id} className="bg-card border-border overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                <CardHeader className="p-4 pb-2 border-b border-border/50 bg-accent/20">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={item.isPremium ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}>
                      {item.isPremium ? 'PREMIUM' : 'STANDARD'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {item.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-base truncate">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.type} • {item.timeframe} • {item.market}</p>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Win Rate</span>
                      <span className="text-sm font-semibold text-success">{item.winRate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Profit Factor</span>
                      <span className="text-sm font-semibold text-foreground">{item.profitFactor}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Max DD</span>
                      <span className="text-sm font-semibold text-destructive">{item.maxDrawdown}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-border/50 bg-accent/10 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground">${item.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs px-6 h-8">Deploy</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="w-64 shrink-0 flex flex-col gap-4">
             <Card className="bg-card border-border">
               <CardHeader className="p-4 border-b border-border/50">
                 <CardTitle className="text-sm flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Asset Class</label>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-accent border-border" defaultChecked/> Forex</label>
                      <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-accent border-border" defaultChecked/> Crypto</label>
                      <label className="flex items-center gap-2"><input type="checkbox" className="rounded bg-accent border-border" /> Stocks</label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Risk Level</label>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="cursor-pointer bg-primary/20 text-primary border-primary/30">Low</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Med</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">High</Badge>
                    </div>
                  </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}