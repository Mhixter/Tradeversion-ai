/**
 * Refer Project — Main admin module container.
 * Accessible only when company_admin_session is valid.
 * Route: /company-admin/refer-project
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Plug, BookOpen, Brain, Monitor, BarChart2,
  FileText, Settings, ArrowLeft, Shield, Activity,
} from "lucide-react";
import Dashboard       from "./Dashboard";
import ConnectedAccounts from "./ConnectedAccounts";
import TradingRules    from "./TradingRules";
import AIDecisionEngine from "./AIDecisionEngine";
import TradeMonitor    from "./TradeMonitor";
import Statistics      from "./Statistics";
import Logs            from "./Logs";
import RPSettings      from "./Settings";

const SESSION_KEY = "company_admin_session";

type RPPage = "dashboard" | "accounts" | "rules" | "ai" | "monitor" | "stats" | "logs" | "settings";

const NAV_ITEMS: { id: RPPage; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard",          icon: LayoutDashboard },
  { id: "accounts",  label: "Connected Accounts", icon: Plug },
  { id: "rules",     label: "Trading Rules",      icon: BookOpen },
  { id: "ai",        label: "AI Decision Engine", icon: Brain },
  { id: "monitor",   label: "Trade Monitor",      icon: Monitor },
  { id: "stats",     label: "Statistics",         icon: BarChart2 },
  { id: "logs",      label: "Logs",               icon: FileText },
  { id: "settings",  label: "Settings",           icon: Settings },
];

export default function ReferProject() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState<RPPage>("dashboard");
  const [session, setSession] = useState<{ admin: { email: string } } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) { navigate("/company-admin"); return; }
    try { setSession(JSON.parse(raw)); } catch { navigate("/company-admin"); }
  }, []);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card/40 flex flex-col">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">Refer Project</p>
            <p className="text-[10px] text-muted-foreground">Admin Module</p>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                page === item.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => navigate("/company-admin")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Admin
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Refer Project</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground capitalize">
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 bg-accent rounded-lg">
            <Shield className="w-3 h-3 text-amber-400" />
            {session.admin.email}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {page === "dashboard" && <Dashboard />}
          {page === "accounts"  && <ConnectedAccounts />}
          {page === "rules"     && <TradingRules />}
          {page === "ai"        && <AIDecisionEngine />}
          {page === "monitor"   && <TradeMonitor />}
          {page === "stats"     && <Statistics />}
          {page === "logs"      && <Logs />}
          {page === "settings"  && <RPSettings />}
        </main>
      </div>
    </div>
  );
}
