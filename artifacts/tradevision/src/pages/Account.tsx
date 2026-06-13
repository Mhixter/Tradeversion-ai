import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Crown, TrendingUp, Bot, BarChart2, Wallet } from "lucide-react";
import { useGetBrokers, useGetBotsStats, useGetStrategies, useGetCurrentAuthUser } from "@workspace/api-client-react";

function StatSkeleton() {
  return <Skeleton className="h-8 w-24" />;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Account() {
  const { data: brokers, isLoading: brokersLoading } = useGetBrokers();
  const { data: stats, isLoading: statsLoading } = useGetBotsStats();
  const { data: strategies, isLoading: strategiesLoading } = useGetStrategies();
  const { data: authData, isLoading: authLoading } = useGetCurrentAuthUser();

  const user = authData?.user;
  const name = user?.name || user?.username || "Trader";
  const email = user?.email || "—";
  const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const initials = name.split(" ").map((p: string) => p[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const totalPnl = stats?.totalProfit ?? 0;
  const avgWinRate = stats?.avgWinRate ?? 0;
  const totalStrategies = strategies?.length ?? 0;
  const activeBots = stats?.running ?? 0;

  const totalEquity = brokers?.reduce((s, b) => s + parseFloat(String(b.equity)), 0) ?? 0;

  return (
    <Layout title="Account & Profile" subtitle="Your identity, broker connections and performance summary">
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Verification</p>
                <h3 className="text-sm sm:text-base font-bold text-success">
                  {authLoading ? <StatSkeleton /> : user ? "Verified" : "Unverified"}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Total Equity</p>
                <h3 className="text-sm sm:text-base font-bold">
                  {brokersLoading ? <StatSkeleton /> : `$${fmt(totalEquity)}`}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Connected Brokers</p>
                <h3 className="text-xl sm:text-2xl font-bold">
                  {brokersLoading ? <StatSkeleton /> : brokers?.length ?? 0}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Plan</p>
                <h3 className="text-sm sm:text-lg font-bold text-primary">Professional</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">

            {/* Profile Info */}
            <Card className="border-border bg-card">
              <CardHeader className="py-3 sm:py-4 border-b border-border/50 flex flex-row items-center justify-between px-4">
                <CardTitle className="text-sm sm:text-base">Profile Information</CardTitle>
                <Button variant="outline" size="sm" className="text-xs h-7 sm:h-8">Edit Profile</Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <Avatar className="w-16 h-16 sm:w-24 sm:h-24 border-2 border-border shrink-0">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{initials || "TV"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-y-4 sm:gap-x-8 text-sm w-full">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Full Name</span>
                      {authLoading ? <Skeleton className="h-5 w-32" /> : <span className="font-medium text-sm">{name}</span>}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Username</span>
                      {authLoading ? <Skeleton className="h-5 w-28" /> : <span className="font-medium text-sm">{user?.username ? `@${user.username}` : "—"}</span>}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Email</span>
                      {authLoading ? <Skeleton className="h-5 w-40" /> : (
                        <span className="font-medium text-sm flex items-center gap-2 flex-wrap">
                          {email}
                          {user && <Badge className="bg-success/20 text-success hover:bg-success/20 text-[10px] h-5 px-1">Verified</Badge>}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Member Since</span>
                      {authLoading ? <Skeleton className="h-5 w-24" /> : <span className="font-medium text-sm">{memberSince}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Broker Accounts */}
            <Card className="border-border bg-card">
              <CardHeader className="py-3 sm:py-4 border-b border-border/50 flex flex-row items-center justify-between px-4">
                <CardTitle className="text-sm sm:text-base">Broker Accounts</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-7 sm:h-8">+ Connect</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {brokersLoading && (
                    <div className="p-4 space-y-3">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                  )}
                  {!brokersLoading && !brokers?.length && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No broker accounts connected yet.
                    </div>
                  )}
                  {brokers?.map(b => (
                    <div key={b.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-accent flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">{b.platform}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">{b.broker}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{b.accountNumber} · {b.server}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <Badge className={`mb-0.5 text-[10px] ${b.isConnected ? "bg-success/20 text-success border-success/30" : "bg-muted text-muted-foreground"}`}>
                          {b.isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                        <p className="text-xs sm:text-sm font-bold">${parseFloat(String(b.equity)).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
                <CardTitle className="text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 border-2 border-primary">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{initials || "TV"}</AvatarFallback>
                </Avatar>
                <Badge className="bg-primary mb-1.5 sm:mb-2 text-xs">PRO</Badge>
                {authLoading
                  ? <Skeleton className="h-6 w-32 mb-1" />
                  : <h3 className="text-base sm:text-lg font-bold">{name}</h3>}
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 sm:mb-6">
                  {authLoading ? <Skeleton className="h-3 w-24" /> : `Member Since: ${memberSince}`}
                </p>

                <div className="w-full bg-accent rounded-lg p-3 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4 text-left">
                  <div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">All-Time P&amp;L</span>
                    {statsLoading
                      ? <Skeleton className="h-5 w-20" />
                      : <span className={`text-xs sm:text-sm font-bold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
                          {totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}
                        </span>}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Avg Win Rate</span>
                    {statsLoading
                      ? <Skeleton className="h-5 w-16" />
                      : <span className="text-xs sm:text-sm font-bold">{avgWinRate.toFixed(1)}%</span>}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Strategies</span>
                    {strategiesLoading
                      ? <Skeleton className="h-5 w-12" />
                      : <span className="text-xs sm:text-sm font-bold">{totalStrategies}</span>}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Active Bots</span>
                    {statsLoading
                      ? <Skeleton className="h-5 w-10" />
                      : <span className="text-xs sm:text-sm font-bold">{activeBots}</span>}
                  </div>
                </div>

                {/* Bot status breakdown */}
                {!statsLoading && stats && (
                  <div className="w-full mt-3 grid grid-cols-3 gap-2">
                    <div className="bg-success/10 rounded-md p-2 text-center">
                      <p className="text-sm font-bold text-success">{stats.running}</p>
                      <p className="text-[10px] text-muted-foreground">Running</p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2 text-center">
                      <p className="text-sm font-bold">{stats.stopped}</p>
                      <p className="text-[10px] text-muted-foreground">Stopped</p>
                    </div>
                    <div className="bg-destructive/10 rounded-md p-2 text-center">
                      <p className="text-sm font-bold text-destructive">{stats.error}</p>
                      <p className="text-[10px] text-muted-foreground">Error</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </Layout>
  );
}
