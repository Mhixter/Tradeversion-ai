import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  useGetNotifications,
  useGetNotificationSummary,
  useMarkAllNotificationsRead,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle, Bot, CheckCircle2, Settings, ArrowRightLeft,
  Bell, ShieldAlert, TrendingUp, Zap, Info, X, ChevronRight,
  Circle, Filter, BellOff, MoreVertical, Clock, Radio,
} from "lucide-react";

type FilterTab = "all" | "unread" | "trading" | "risk" | "system" | "security";

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; severity: string }> = {
  risk:     { icon: AlertTriangle,  color: "text-amber-400",     bg: "bg-amber-500/10 border-amber-500/20",    label: "Risk",     severity: "high" },
  bot:      { icon: Bot,            color: "text-emerald-400",   bg: "bg-emerald-500/10 border-emerald-500/20", label: "Bot",      severity: "info" },
  trade:    { icon: TrendingUp,     color: "text-blue-400",      bg: "bg-blue-500/10 border-blue-500/20",      label: "Trade",    severity: "info" },
  system:   { icon: Settings,       color: "text-slate-400",     bg: "bg-slate-500/10 border-slate-500/20",    label: "System",   severity: "low" },
  account:  { icon: ArrowRightLeft, color: "text-emerald-400",   bg: "bg-emerald-500/10 border-emerald-500/20", label: "Account", severity: "info" },
  security: { icon: ShieldAlert,    color: "text-red-400",       bg: "bg-red-500/10 border-red-500/20",        label: "Security", severity: "critical" },
  signal:   { icon: Zap,            color: "text-primary",       bg: "bg-primary/10 border-primary/20",        label: "Signal",   severity: "high" },
  default:  { icon: Bell,           color: "text-muted-foreground", bg: "bg-muted/10 border-border",           label: "Info",     severity: "low" },
};

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, info: 2, low: 3 };

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.default;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  } catch { return ""; }
}

function groupByDate(notifications: any[]): { label: string; items: any[] }[] {
  const groups: Record<string, any[]> = {};
  const now = new Date();
  for (const n of notifications) {
    let label = "Earlier";
    try {
      const d = new Date(n.createdAt || n.time || Date.now());
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff === 0) label = "Today";
      else if (diff === 1) label = "Yesterday";
      else if (diff < 7) label = "This Week";
    } catch { /* use default */ }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

const TAB_FILTERS: { key: FilterTab; label: string; match: (n: any) => boolean }[] = [
  { key: "all",      label: "All",      match: () => true },
  { key: "unread",   label: "Unread",   match: n => !n.isRead },
  { key: "trading",  label: "Trading",  match: n => ["trade", "bot", "signal"].includes(n.type) },
  { key: "risk",     label: "Risk",     match: n => n.type === "risk" },
  { key: "system",   label: "System",   match: n => n.type === "system" },
  { key: "security", label: "Security", match: n => n.type === "security" },
];

export default function Notifications() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { data: summary, isLoading: isSummaryLoading } = useGetNotificationSummary();
  const markAllRead = useMarkAllNotificationsRead();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number | string>>(new Set());
  const [read, setRead] = useState<Set<number | string>>(new Set());

  const isItemRead = (n: any) => n.isRead || read.has(n.id);
  const isItemDismissed = (n: any) => dismissed.has(n.id);

  const currentFilter = TAB_FILTERS.find(t => t.key === activeTab)!;

  const visible = (notifications as any[])
    .filter(n => !isItemDismissed(n) && currentFilter.match(n))
    .sort((a, b) => {
      const sa = SEVERITY_ORDER[getTypeMeta(a.type).severity] ?? 3;
      const sb = SEVERITY_ORDER[getTypeMeta(b.type).severity] ?? 3;
      if (sa !== sb) return sa - sb;
      return 0;
    });

  const unreadCount = (notifications as any[]).filter(n => !isItemRead(n) && !isItemDismissed(n)).length;
  const tabCount = (tab: FilterTab) => {
    const f = TAB_FILTERS.find(t => t.key === tab)!;
    return (notifications as any[]).filter(n => f.match(n) && !isItemDismissed(n)).length;
  };

  const groups = groupByDate(visible);

  return (
    <Layout title="Notification Center" subtitle="Real-time alerts, bot events, and risk warnings">
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 h-full">

        {/* ── Main Panel ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold">Notifications</h2>
              {/* Live indicator */}
              <div className="flex items-center gap-1 ml-1 text-emerald-400 text-[10px] font-medium">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Live</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BellOff className="w-3.5 h-3.5" />
                <span>Sound</span>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} className="scale-75 origin-right" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                onClick={() => markAllRead.mutate(undefined as unknown as void)}
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-destructive hover:text-destructive"
                onClick={() => setDismissed(new Set((notifications as any[]).map(n => n.id)))}
              >
                Clear all
              </Button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto">
            {TAB_FILTERS.map(tab => {
              const count = tabCount(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-accent text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification list */}
          <Card className="border-border bg-card flex-1 overflow-hidden">
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-accent/30">
                      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
                    <BellOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">All caught up</p>
                  <p className="text-xs text-muted-foreground">No notifications in this category</p>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {groups.map(group => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-[10px] text-muted-foreground">{group.items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map(n => {
                          const meta = getTypeMeta(n.type);
                          const Icon = meta.icon;
                          const isRead = isItemRead(n);
                          const isCritical = meta.severity === "critical";
                          const isHigh = meta.severity === "high";
                          return (
                            <div
                              key={n.id}
                              className={`group flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                                isCritical ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/8" :
                                isHigh ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/8" :
                                !isRead ? "border-primary/15 bg-primary/5 hover:bg-primary/8" :
                                "border-transparent bg-accent/30 hover:bg-accent/60"
                              }`}
                            >
                              {/* Icon */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${meta.bg}`}>
                                <Icon className={`w-4 h-4 ${meta.color}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-semibold ${!isRead ? "text-foreground" : "text-foreground/80"}`}>
                                      {n.title}
                                    </span>
                                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 border ${meta.bg} ${meta.color} hidden sm:flex`}>
                                      {meta.label}
                                    </Badge>
                                    {isCritical && (
                                      <Badge className="text-[9px] h-4 px-1.5 bg-red-500/20 text-red-400 border-red-500/30">
                                        Critical
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                      {n.createdAt ? formatRelativeTime(n.createdAt) : n.time}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {n.type === "risk" && (
                                    <button className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                                      View Risk Center <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  {n.type === "bot" && (
                                    <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                                      Open Bot Manager <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  {n.type === "trade" && (
                                    <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                      View Trade <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  {n.type === "security" && (
                                    <button className="text-[10px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
                                      Review Security <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setRead(prev => new Set([...prev, n.id]))}
                                    className="text-[10px] text-muted-foreground hover:text-foreground font-medium ml-auto"
                                  >
                                    {isRead ? "" : "Mark read"}
                                  </button>
                                  <button
                                    onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
                                    className="text-[10px] text-muted-foreground hover:text-destructive font-medium"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>

                              {/* Unread dot */}
                              {!isRead && (
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isCritical ? "bg-red-400" : isHigh ? "bg-amber-400" : "bg-primary"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right Sidebar ───────────────────────────────────────────────────── */}
        <div className="xl:w-72 xl:shrink-0 flex flex-col gap-4">

          {/* Summary Card */}
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isSummaryLoading ? <Skeleton className="h-32 w-full" /> : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Total Unread", value: summary?.unread ?? 0, color: "bg-primary/10 text-primary border-primary/20" },
                      { label: "Trading", value: summary?.trading ?? 0, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                      { label: "Risk", value: summary?.risk ?? 0, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                      { label: "Security", value: summary?.security ?? 0, color: "bg-red-500/10 text-red-400 border-red-500/20" },
                    ].map(item => (
                      <div key={item.label} className={`rounded-xl border p-3 ${item.color}`}>
                        <p className="text-xs font-medium opacity-80 mb-0.5">{item.label}</p>
                        <p className="text-xl font-black">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 space-y-1.5">
                    {[
                      { label: "System", value: summary?.system ?? 0 },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings quick-access */}
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Risk Alerts",   desc: "Margin & drawdown",       default: true  },
                { label: "Bot Events",    desc: "Start/stop/error",         default: true  },
                { label: "Trade Fills",   desc: "Order confirmations",      default: true  },
                { label: "Price Alerts",  desc: "Symbol triggers",          default: false },
                { label: "Email Digest",  desc: "Daily summary at 9:00 AM", default: true  },
                { label: "Telegram Bot",  desc: "Instant mobile alerts",    default: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} className="scale-90 origin-right shrink-0" />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-1 text-xs h-8">
                <Settings className="w-3 h-3 mr-1.5" />Full Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Recent activity log */}
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Log</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { channel: "In-App",   status: "Active",  count: 24, ok: true },
                { channel: "Email",    status: "Active",  count: 12, ok: true },
                { channel: "Push",     status: "Active",  count: 8,  ok: true },
                { channel: "Telegram", status: "Not set", count: 0,  ok: false },
                { channel: "SMS",      status: "Disabled",count: 0,  ok: false },
              ].map(item => (
                <div key={item.channel} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
                    <span className="text-muted-foreground">{item.channel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count > 0 && <span className="font-medium">{item.count} sent</span>}
                    <span className={item.ok ? "text-emerald-400" : "text-muted-foreground/60"}>{item.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
