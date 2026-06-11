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
      <div className="flex flex-col gap-6">
        
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Profile Completion</p>
                <h3 className="text-2xl font-bold">92%</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Verification Status</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <h3 className="text-xl font-bold text-success">Verified</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Connected Brokers</p>
                <h3 className="text-2xl font-bold">{brokers?.length || 5}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Subscription Plan</p>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-primary">Professional</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 flex flex-col gap-6">
            
            {/* Profile Info */}
            <Card className="border-border bg-card">
              <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Profile Information</CardTitle>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24 border-2 border-border">
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Full Name</span>
                      <span className="font-medium">John Trader</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Username</span>
                      <span className="font-medium">@johntrader_pro</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Email</span>
                      <span className="font-medium flex items-center gap-2">john@tradevision.com <Badge className="bg-success/20 text-success hover:bg-success/20 text-[10px] h-5 px-1">Verified</Badge></span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Phone Number</span>
                      <span className="font-medium">+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Broker Accounts */}
            <Card className="border-border bg-card">
              <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Broker Accounts</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Manage Connections</Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Connect New Broker</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {brokers?.map(b => (
                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-accent flex items-center justify-center font-bold text-xs">{b.platform}</div>
                        <div>
                          <p className="font-semibold text-sm">{b.broker}</p>
                          <p className="text-xs text-muted-foreground">{b.accountNumber} • {b.server}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success/20 text-success hover:bg-success/30 mb-1 border-success/30">Connected</Badge>
                        <p className="text-sm font-bold">${b.equity.toLocaleString()}</p>
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

          <div className="col-span-4 flex flex-col gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center text-center">
                 <Avatar className="w-20 h-20 mb-3 border-2 border-primary">
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <Badge className="bg-primary mb-2">PRO</Badge>
                  <h3 className="text-lg font-bold">John Trader</h3>
                  <p className="text-xs text-muted-foreground mb-6">Member Since: Jan 2023</p>

                  <div className="w-full bg-accent rounded-lg p-4 grid grid-cols-2 gap-4 text-left mb-6">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Lifetime Profit</span>
                      <span className="text-sm font-bold text-success">+$215,743.25</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Win Rate</span>
                      <span className="text-sm font-bold text-foreground">78.45%</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Strategies</span>
                      <span className="text-sm font-bold text-foreground">23</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Active Bots</span>
                      <span className="text-sm font-bold text-foreground">7</span>
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