import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetNotifications, useGetNotificationSummary, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bot, CheckCircle2, Settings, ArrowRightLeft, Bell, ShieldAlert } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useGetNotifications();
  const { data: summary, isLoading: isSummaryLoading } = useGetNotificationSummary();
  const markAllRead = useMarkAllNotificationsRead();

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />;
      case 'bot': return <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-success" />;
      case 'trade': return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case 'system': return <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />;
      case 'account': return <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-success" />;
      case 'security': return <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />;
      default: return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
    }
  };

  return (
    <Layout title="Notifications" subtitle="System alerts, bot updates, and risk warnings">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
          {/* Filter bar */}
          <div className="flex justify-between items-center bg-card border border-border p-2.5 sm:p-3 rounded-lg gap-2">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
              <Badge variant="default" className="bg-primary hover:bg-primary cursor-pointer px-2.5 py-1 text-xs whitespace-nowrap">All</Badge>
              <Badge variant="outline" className="cursor-pointer px-2.5 py-1 hover:bg-accent text-xs whitespace-nowrap">
                Unread {summary?.unread ? `(${summary.unread})` : ''}
              </Badge>
              <Badge variant="outline" className="cursor-pointer px-2.5 py-1 hover:bg-accent text-xs whitespace-nowrap hidden sm:flex">Trading</Badge>
              <Badge variant="outline" className="cursor-pointer px-2.5 py-1 hover:bg-accent text-xs whitespace-nowrap hidden sm:flex">System</Badge>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 text-xs h-7 sm:h-8" onClick={() => markAllRead.mutate(undefined as unknown as void)}>
              Mark all read
            </Button>
          </div>

          <Card className="border-border bg-card flex-1 overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className="p-4 border-b border-border"><Skeleton className="h-12 w-full" /></div>)
              ) : notifications?.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3 sm:p-4 border-b border-border hover:bg-accent/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="mt-0.5 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5 gap-2">
                      <h4 className={`text-xs sm:text-sm truncate ${!n.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{n.title}</h4>
                      <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary panel — full width on mobile (below), fixed width on lg (side) */}
        <div className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="py-3 sm:py-4 border-b border-border/50 px-4">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isSummaryLoading ? <Skeleton className="h-32 w-full" /> : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs">Total Unread</span>
                    <Badge className="bg-primary text-xs">{summary?.unread || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs">Trading</span>
                    <span className="font-medium text-xs">{summary?.trading || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs">System</span>
                    <span className="font-medium text-xs">{summary?.system || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs">Security</span>
                    <span className="font-medium text-xs">{summary?.security || 0}</span>
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
