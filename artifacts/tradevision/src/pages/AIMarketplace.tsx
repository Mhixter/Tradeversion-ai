import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetMarketplaceListings, useGetMarketplaceHighlights } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Cpu, Filter } from "lucide-react";

const categories = ["All Strategies", "AI Scalping", "Trend Following", "Swing Trading", "Mean Reversion", "Breakout"];

export default function AIMarketplace() {
  const { data: listings, isLoading } = useGetMarketplaceListings();

  return (
    <Layout title="AI Marketplace" subtitle="Discover and deploy premium AI trading strategies">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Banner */}
        <div className="rounded-xl bg-gradient-to-r from-primary/20 via-indigo-900/40 to-background border border-primary/20 p-4 sm:p-6 flex items-center justify-between overflow-hidden relative">
          <div className="z-10 flex-1 min-w-0 mr-4">
            <h2 className="text-base sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
              <Cpu className="text-primary w-4 h-4 sm:w-5 sm:h-5 shrink-0"/> 
              <span className="truncate">Premium AI Strategies</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md hidden sm:block">Access institutional-grade algorithms built by top quant developers. Plug and play directly into your MT4/MT5 accounts.</p>
          </div>
          <Button className="z-10 bg-primary text-white shrink-0 text-xs sm:text-sm h-8 sm:h-9">Explore Premium</Button>
          <div className="absolute right-0 top-0 opacity-20 pointer-events-none mix-blend-screen w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
        </div>

        {/* Categories — horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((c, i) => (
              <Badge key={c} variant={i === 0 ? "default" : "secondary"} className="px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {/* Listings + Filters */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Listings Grid — 1 col mobile, 2 tablet, 3 desktop */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {isLoading ? (
               Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
            ) : listings?.map(item => (
              <Card key={item.id} className="bg-card border-border overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-border/50 bg-accent/20">
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                    <Badge className={`text-[10px] ${item.isPremium ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                      {item.isPremium ? 'PREMIUM' : 'STANDARD'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {item.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.type} • {item.timeframe}</p>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Win Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-success">{item.winRate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Profit F.</span>
                      <span className="text-xs sm:text-sm font-semibold text-foreground">{item.profitFactor}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Max DD</span>
                      <span className="text-xs sm:text-sm font-semibold text-destructive">{item.maxDrawdown}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 sm:p-4 border-t border-border/50 bg-accent/10 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-foreground">${item.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs px-4 sm:px-6 h-7 sm:h-8">Deploy</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Filters — hidden on mobile, shown on lg */}
          <div className="hidden lg:block w-64 shrink-0">
             <Card className="bg-card border-border sticky top-4">
               <CardHeader className="p-4 border-b border-border/50">
                 <CardTitle className="text-sm flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Asset Class</label>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" className="rounded bg-accent border-border" defaultChecked/> Forex</label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" className="rounded bg-accent border-border" defaultChecked/> Crypto</label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" className="rounded bg-accent border-border"/> Stocks</label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Risk Level</label>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="cursor-pointer bg-primary/20 text-primary border-primary/30 text-xs">Low</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">Med</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">High</Badge>
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
