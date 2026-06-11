import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetNotifications, useGetNotificationSummary, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bot, CheckCircle2, Settings, ArrowRightLeft, Users, Bell, ShieldAlert } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useGetNotifications();
  const { data: summary, isLoading: isSummaryLoading } = useGetNotificationSummary();
  const markAllRead = useMarkAllNotificationsRead();

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'bot': return <Bot className="w-5 h-5 text-success" />;
      case 'trade': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'system': return <Settings className="w-5 h-5 text-muted-foreground" />;
      case 'account': return <ArrowRightLeft className="w-5 h-5 text-success" />;
      case 'security': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Layout title="Notification Center" subtitle="System alerts, bot updates, and risk warnings">
      <div className="flex gap-6 h-full">
        
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-card border border-border p-3 rounded-lg">
            <div className="flex gap-2">
              <Badge variant="default" className="bg-primary hover:bg-primary cursor-pointer px-3 py-1">All</Badge>
              <Badge variant="outline" className="cursor-pointer px-3 py-1 hover:bg-accent">Unread ({summary?.unread || 0})</Badge>
              <Badge variant="outline" className="cursor-pointer px-3 py-1 hover:bg-accent">Trading</Badge>
              <Badge variant="outline" className="cursor-pointer px-3 py-1 hover:bg-accent">System</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate({})}>Mark all as read</Button>
          </div>

          <Card className="border-border bg-card flex-1 overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className="p-4 border-b border-border"><Skeleton className="h-12 w-full" /></div>)
              ) : notifications?.map(n => (
                <div key={n.id} className={`flex items-start gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="mt-1">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!n.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{n.title}</h4>
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="w-80 shrink-0 flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isSummaryLoading ? <Skeleton className="h-40 w-full" /> : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Unread</span>
                    <Badge className="bg-primary">{summary?.unread || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Trading</span>
                    <span className="font-medium">{summary?.trading || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">System</span>
                    <span className="font-medium">{summary?.system || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Security</span>
                    <span className="font-medium">{summary?.security || 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}