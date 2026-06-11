import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Crown } from "lucide-react";
import { useGetBrokers } from "@workspace/api-client-react";

export default function Account() {
  const { data: brokers } = useGetBrokers();

  return (
    <Layout title="Account & Profile" subtitle="Manage your identity and broker connections">
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Header Stats — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Profile Completion</p>
                <h3 className="text-xl sm:text-2xl font-bold">92%</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Verification</p>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <h3 className="text-sm sm:text-lg font-bold text-success">Verified</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Connected Brokers</p>
              <h3 className="text-xl sm:text-2xl font-bold">{brokers?.length || 5}</h3>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Plan</p>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-primary" />
                <h3 className="text-sm sm:text-lg font-bold text-primary">Professional</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main — stacked on mobile, side-by-side on lg */}
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
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-y-4 sm:gap-x-8 text-sm w-full">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Full Name</span>
                      <span className="font-medium text-sm">John Trader</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Username</span>
                      <span className="font-medium text-sm">@johntrader_pro</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Email</span>
                      <span className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        john@tradevision.com 
                        <Badge className="bg-success/20 text-success hover:bg-success/20 text-[10px] h-5 px-1">Verified</Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Phone Number</span>
                      <span className="font-medium text-sm">+1 (555) 123-4567</span>
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
                  {brokers?.map(b => (
                    <div key={b.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-accent flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">{b.platform}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">{b.broker}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{b.accountNumber} • {b.server}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <Badge className="bg-success/20 text-success hover:bg-success/30 mb-0.5 border-success/30 text-[10px]">Connected</Badge>
                        <p className="text-xs sm:text-sm font-bold">${b.equity.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {!brokers?.length && (
                    <div className="p-8 text-center text-muted-foreground text-sm">Loading brokers...</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
                <CardTitle className="text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                 <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 border-2 border-primary">
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <Badge className="bg-primary mb-1.5 sm:mb-2 text-xs">PRO</Badge>
                  <h3 className="text-base sm:text-lg font-bold">John Trader</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 sm:mb-6">Member Since: Jan 2023</p>

                  <div className="w-full bg-accent rounded-lg p-3 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4 text-left">
                    <div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Lifetime Profit</span>
                      <span className="text-xs sm:text-sm font-bold text-success">+$215,743</span>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Win Rate</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">78.45%</span>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Strategies</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">23</span>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">Active Bots</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">7</span>
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
