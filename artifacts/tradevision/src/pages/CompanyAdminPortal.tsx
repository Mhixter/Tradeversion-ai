import React, { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, Shield, Lock, Eye, EyeOff, LogOut,
  TrendingUp, BarChart2, Globe, ChevronRight, AlertCircle,
  CheckCircle2, Activity, Crown, Mail, Layers, RefreshCw,
  Bot, CreditCard, HeadphonesIcon, Wallet, Play, Pause, Square,
  DollarSign, TrendingDown, AlertTriangle, CheckCircle, Clock,
  UserCog, Key, Ban, Zap, MoreVertical, ArrowUpRight, ArrowDownRight,
  PlusCircle, Settings, ChevronDown,
} from "lucide-react";

const DEFAULT_EMAIL = "saidumuhammed664@gmail.com";
const DEFAULT_PASS  = "Mhixter664@gmail.com";
const SESSION_KEY   = "company_admin_session";

type AdminTab = "overview" | "companies" | "users" | "bots" | "billing" | "support" | "accounts" | "roles";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function apiPost(path: string, body?: object) {
  const r = await fetch(`${BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}
async function apiGet(path: string) {
  const r = await fetch(`${BASE}/api${path}`);
  return r.json();
}
async function apiPatch(path: string, body: object) {
  const r = await fetch(`${BASE}/api${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RUNNING:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    STOPPED:   "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PAUSED:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ERROR:     "bg-red-500/10 text-red-400 border-red-500/20",
    active:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    suspended: "bg-red-500/10 text-red-400 border-red-500/20",
    open:      "bg-red-500/10 text-red-400 border-red-500/20",
    pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
    resolved:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    success:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed:    "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${map[status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
      {status}
    </span>
  );
}

/* ── Login page ─────────────────────────────────────────────────────────── */
function LoginPage({ onLogin }: { onLogin: (s: any) => void }) {
  const [email, setEmail]       = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASS);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/company-admin/auth", { email, password });
      if (data.success) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
        onLogin(data);
      } else {
        setError(data.error ?? "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Platform Administration Portal
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-purple-600" />
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold">TradeVision Admin</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Platform-level administration &amp; control
              </p>
            </div>

            <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-primary/5 border border-primary/20">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                Default admin credentials are pre-filled. Access is restricted to the platform owner only.
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" required />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold" disabled={loading}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Signing in…</>
                  : <><Shield className="w-4 h-4 mr-2" />Access Admin Portal</>}
              </Button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          This portal is restricted to authorized platform administrators only.
        </p>
      </div>
    </div>
  );
}

/* ── Bots Tab ────────────────────────────────────────────────────────────── */
function BotsTab() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setBots(await apiGet("/company-admin/bots")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const control = async (id: number, action: "start" | "stop" | "pause") => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      await apiPost(`/company-admin/bots/${id}/${action}`);
      await load();
    } finally {
      setActionLoading(p => ({ ...p, [id]: false }));
    }
  };

  const controlAll = async (action: "start-all" | "stop-all") => {
    setLoading(true);
    try { await apiPost(`/company-admin/bots/${action}`); await load(); }
    finally { setLoading(false); }
  };

  const running = bots.filter(b => b.status === "RUNNING").length;
  const stopped = bots.filter(b => b.status === "STOPPED").length;
  const paused  = bots.filter(b => b.status === "PAUSED").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Running" value={running} icon={Play}  color="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Stopped" value={stopped} icon={Square} color="bg-zinc-500/10 text-zinc-400" />
        <StatCard label="Paused"  value={paused}  icon={Pause}  color="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => controlAll("start-all")}>
          <Play className="w-3.5 h-3.5" />Start All
        </Button>
        <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => controlAll("stop-all")}>
          <Square className="w-3.5 h-3.5" />Stop All
        </Button>
        <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-5 py-3">Bot</th>
              <th className="text-left px-5 py-3">Market</th>
              <th className="text-left px-5 py-3">Strategy</th>
              <th className="text-right px-5 py-3">Win Rate</th>
              <th className="text-right px-5 py-3">P&L</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-center px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((b: any) => (
              <tr key={b.id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{b.name}</p>
                      <p className="text-[10px] text-muted-foreground">{b.account}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{b.market} · {b.timeframe}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{b.strategy}</td>
                <td className="px-5 py-3 text-xs text-right font-semibold">{b.winRate.toFixed(1)}%</td>
                <td className="px-5 py-3 text-xs text-right">
                  <span className={b.pnlAllTime >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                    {b.pnlAllTime >= 0 ? "+" : ""}${b.pnlAllTime.toFixed(0)}
                  </span>
                </td>
                <td className="px-5 py-3 text-center"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {b.status !== "RUNNING" && (
                      <button onClick={() => control(b.id, "start")} disabled={actionLoading[b.id]}
                        className="p-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="Start">
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                    {b.status === "RUNNING" && (
                      <button onClick={() => control(b.id, "pause")} disabled={actionLoading[b.id]}
                        className="p-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors" title="Pause">
                        <Pause className="w-3 h-3" />
                      </button>
                    )}
                    {b.status !== "STOPPED" && (
                      <button onClick={() => control(b.id, "stop")} disabled={actionLoading[b.id]}
                        className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Stop">
                        <Square className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bots.length === 0 && !loading && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No bots found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Billing Tab ─────────────────────────────────────────────────────────── */
function BillingTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/company-admin/billing").then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue"     value={`$${data.monthlyRevenue.toLocaleString()}`} icon={DollarSign}  color="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Active Subscriptions" value={data.activeSubscriptions}                  icon={CreditCard}  color="bg-primary/10 text-primary" />
        <StatCard label="Pending Payments"    value={data.pendingPayments}                       icon={Clock}       color="bg-amber-500/10 text-amber-400" />
        <StatCard label="Failed Payments"     value={data.failedPayments}                        icon={AlertTriangle} color="bg-red-500/10 text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Plan breakdown */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Subscription Plans</h3>
          </div>
          <div className="p-5 space-y-3">
            {data.plans.map((p: any) => {
              const colorMap: Record<string, string> = { blue: "bg-blue-500", violet: "bg-violet-500", amber: "bg-amber-500" };
              const total = data.plans.reduce((s: number, x: any) => s + x.subscribers, 0) || 1;
              const pct = Math.round((p.subscribers / total) * 100);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorMap[p.color] ?? "bg-primary"}`} />
                      <span className="text-xs font-semibold">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">${p.price}/mo</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold">{p.subscribers}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">users</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                    <div className={`h-full ${colorMap[p.color] ?? "bg-primary"} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Recent Transactions</h3>
          </div>
          <div className="divide-y divide-border/40">
            {data.recentTransactions.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  t.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                  t.status === "failed"  ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {t.status === "success" ? <CheckCircle className="w-3.5 h-3.5" /> :
                   t.status === "failed"  ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{t.user}</p>
                  <p className="text-[10px] text-muted-foreground">{t.plan} · {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground">${t.amount}</p>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment gateway config */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Settings className="w-4 h-4 text-primary" />Payment Gateway Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "Stripe", status: "active",   logo: "S", color: "bg-violet-500" },
            { name: "PayPal", status: "inactive",  logo: "P", color: "bg-blue-500" },
            { name: "Crypto", status: "inactive",  logo: "₿", color: "bg-amber-500" },
          ].map(gw => (
            <div key={gw.name} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${gw.color} flex items-center justify-center text-white text-xs font-bold`}>{gw.logo}</div>
                <div>
                  <p className="text-xs font-semibold">{gw.name}</p>
                  <StatusBadge status={gw.status} />
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                {gw.status === "active" ? "Configure" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Support Tab ─────────────────────────────────────────────────────────── */
function SupportTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "resolved">("all");

  useEffect(() => {
    apiGet("/company-admin/support").then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiPatch(`/company-admin/support/${id}`, { status });
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
  const open     = tickets.filter(t => t.status === "open").length;
  const pending  = tickets.filter(t => t.status === "pending").length;
  const resolved = tickets.filter(t => t.status === "resolved").length;

  const priorityColor: Record<string, string> = {
    high:   "text-red-400",
    medium: "text-amber-400",
    low:    "text-blue-400",
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Open Tickets"     value={open}     icon={AlertCircle}  color="bg-red-500/10 text-red-400" />
        <StatCard label="Pending"          value={pending}  icon={Clock}        color="bg-amber-500/10 text-amber-400" />
        <StatCard label="Resolved"         value={resolved} icon={CheckCircle}  color="bg-emerald-500/10 text-emerald-400" />
      </div>

      <div className="flex gap-1 bg-accent/40 rounded-xl p-1 w-fit">
        {(["all","open","pending","resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-5 py-3">Ticket</th>
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-center px-5 py-3">Priority</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Date</th>
              <th className="text-center px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: any) => (
              <tr key={t.id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="text-xs font-semibold">{t.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{t.id}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{t.user}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{t.category}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[10px] font-bold capitalize ${priorityColor[t.priority]}`}>{t.priority}</span>
                </td>
                <td className="px-5 py-3 text-center"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3 text-xs text-right text-muted-foreground">{new Date(t.created).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {t.status !== "resolved" && (
                      <button onClick={() => updateStatus(t.id, "resolved")}
                        className="text-[9px] px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-colors">
                        Resolve
                      </button>
                    )}
                    {t.status === "open" && (
                      <button onClick={() => updateStatus(t.id, "pending")}
                        className="text-[9px] px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold transition-colors">
                        Pending
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No tickets found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Live Accounts Tab ───────────────────────────────────────────────────── */
function LiveAccountsTab() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAccounts(await apiGet("/company-admin/live-accounts")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const suspend = async (id: string) => {
    await apiPost(`/company-admin/live-accounts/${id}/suspend`);
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: "suspended" } : a));
  };
  const activate = async (id: string) => {
    await apiPost(`/company-admin/live-accounts/${id}/activate`);
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: "active" } : a));
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalPnl     = accounts.reduce((s, a) => s + a.totalPnl, 0);
  const active       = accounts.filter(a => a.status === "active").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Accounts" value={accounts.length}           icon={Wallet}     color="bg-primary/10 text-primary" />
        <StatCard label="Active"         value={active}                    icon={CheckCircle} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Total Balance"  value={`$${totalBalance.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={DollarSign} color="bg-violet-500/10 text-violet-400" />
        <StatCard label="Total P&L"      value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={totalPnl >= 0 ? TrendingUp : TrendingDown} color={totalPnl >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"} />
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Live Trading Accounts</h3>
        <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-5 py-3">Account</th>
              <th className="text-left px-5 py-3">Trader</th>
              <th className="text-left px-5 py-3">Broker</th>
              <th className="text-right px-5 py-3">Balance</th>
              <th className="text-right px-5 py-3">Equity</th>
              <th className="text-right px-5 py-3">P&L</th>
              <th className="text-center px-5 py-3">Trades</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-center px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a: any) => (
              <tr key={a.id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="text-xs font-mono font-semibold">{a.accountNumber}</p>
                    <p className="text-[10px] text-muted-foreground">{a.currency} · 1:{a.leverage}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-xs font-semibold">{a.userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{a.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{a.broker}</td>
                <td className="px-5 py-3 text-xs text-right font-mono font-semibold">${a.balance.toLocaleString()}</td>
                <td className="px-5 py-3 text-xs text-right font-mono">${a.equity.toLocaleString()}</td>
                <td className="px-5 py-3 text-xs text-right">
                  <span className={a.totalPnl >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                    {a.totalPnl >= 0 ? "+" : ""}${a.totalPnl.toFixed(0)}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-center font-semibold">{a.openTrades}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {a.status === "active" ? (
                      <button onClick={() => suspend(a.id)}
                        className="text-[9px] px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => activate(a.id)}
                        className="text-[9px] px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-colors">
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && !loading && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">No live accounts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Roles Tab ───────────────────────────────────────────────────────────── */
function RolesTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/company-admin/roles").then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const colorMap: Record<string, string> = {
    amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    gray:   "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {data.roleDefinitions.map((r: any) => (
          <div key={r.role} className="bg-card border border-border/50 rounded-2xl p-4">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold mb-3 ${colorMap[r.color] ?? colorMap.gray}`}>
              <Key className="w-3 h-3" />{r.label}
            </div>
            <p className="text-2xl font-black">{r.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">members</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Role definitions */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Role Permissions</h3>
          </div>
          <div className="divide-y divide-border/40">
            {data.roleDefinitions.map((r: any) => (
              <div key={r.role} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${colorMap[r.color] ?? colorMap.gray}`}>{r.label}</span>
                  <span className="text-[10px] text-muted-foreground">{r.count} members</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.map((p: string) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-md bg-accent text-muted-foreground font-mono">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members list */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><UserCog className="w-4 h-4 text-primary" />Member Roles</h3>
          </div>
          {data.members.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">No members found</div>
          ) : (
            <div className="divide-y divide-border/40">
              {data.members.slice(0, 8).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-violet-600/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {m.id}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Member #{m.id}</p>
                      <p className="text-[10px] text-muted-foreground">Company {m.companyId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${colorMap[data.roleDefinitions.find((r: any) => r.role === m.role)?.color ?? "gray"] ?? colorMap.gray}`}>
                      {m.role}
                    </span>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Overview Tab ────────────────────────────────────────────────────────── */
function OverviewTab({ stats, companies, users, setTab }: { stats: any; companies: any[]; users: any[]; setTab: (t: AdminTab) => void }) {
  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Companies"    value={stats.totalCompanies}   icon={Building2}  color="bg-primary/10 text-primary" />
          <StatCard label="Users"        value={stats.totalUsers}       icon={Users}      color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Active Bots"  value={stats.runningBots}      icon={Bot}        color="bg-emerald-500/10 text-emerald-400" sub={`of ${stats.totalBots} total`} />
          <StatCard label="Revenue/mo"   value={`$${(stats.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-violet-500/10 text-violet-400" />
          <StatCard label="Open Tickets" value={stats.openTickets}      icon={HeadphonesIcon} color="bg-amber-500/10 text-amber-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Manage All Bots",    tab: "bots"     as AdminTab, icon: Bot,           color: "text-primary" },
              { label: "Billing & Payments", tab: "billing"  as AdminTab, icon: CreditCard,    color: "text-violet-400" },
              { label: "Support Tickets",    tab: "support"  as AdminTab, icon: HeadphonesIcon, color: "text-amber-400" },
              { label: "Live Accounts",      tab: "accounts" as AdminTab, icon: Wallet,        color: "text-emerald-400" },
              { label: "Role Management",    tab: "roles"    as AdminTab, icon: Shield,         color: "text-blue-400" },
            ].map(a => (
              <button key={a.tab} onClick={() => setTab(a.tab)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/40 hover:bg-accent transition-colors text-left group">
                <a.icon className={`w-4 h-4 ${a.color} shrink-0`} />
                <span className="text-xs font-semibold">{a.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent companies */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Recent Companies</h3>
            <button onClick={() => setTab("companies")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40">
            {companies.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-600/10 flex items-center justify-center text-xs font-bold text-primary">
                  {c.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.industry} · {c.country}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold">{c.memberCount}</p>
                  <p className="text-[10px] text-muted-foreground">members</p>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No companies yet</div>
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Platform Users</h3>
            <button onClick={() => setTab("users")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40">
            {users.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
                <Avatar className="w-8 h-8 border border-border">
                  {u.profileImageUrl && <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover rounded-full" />}
                  <AvatarFallback className="text-[10px]">{(u.firstName?.[0] ?? "?")}{(u.lastName?.[0] ?? "")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{u.firstName ?? ""} {u.lastName ?? ""}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email ?? u.id}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">ACTIVE</span>
              </div>
            ))}
            {users.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No users found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────────────────── */
function AdminDashboard({ session, onLogout }: { session: any; onLogout: () => void }) {
  const [stats, setStats]         = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers]         = useState<any[]>([]);
  const [tab, setTab]             = useState<AdminTab>("overview");
  const [loading, setLoading]     = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, u] = await Promise.all([
        apiGet("/company-admin/stats"),
        apiGet("/company-admin/companies"),
        apiGet("/company-admin/users"),
      ]);
      setStats(s);
      setCompanies(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview",   label: "Overview",       icon: BarChart2 },
    { id: "companies",  label: "Companies",       icon: Building2 },
    { id: "users",      label: "Users",           icon: Users },
    { id: "bots",       label: "Bot Control",     icon: Bot },
    { id: "billing",    label: "Billing",         icon: CreditCard },
    { id: "support",    label: "Support",         icon: HeadphonesIcon },
    { id: "accounts",   label: "Live Accounts",   icon: Wallet },
    { id: "roles",      label: "Roles",           icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold">TradeVision</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">PLATFORM ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reload} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg text-xs text-muted-foreground">
            <Crown className="w-3 h-3 text-amber-400" />
            {session.admin.email}
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10 border border-transparent hover:border-destructive/20">
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-14 z-20 border-b border-border bg-card/60 backdrop-blur-md px-6 flex gap-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 pb-3 pt-3 px-4 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-5">
          <h1 className="text-lg font-bold capitalize">
            {tabs.find(t => t.id === tab)?.label ?? "Overview"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tab === "overview"  && "Full platform overview — companies, users, bots and revenue at a glance."}
            {tab === "companies" && "Manage all registered companies and their departments."}
            {tab === "users"     && "All registered platform users."}
            {tab === "bots"      && "Start, stop, or pause any trading bot across the entire platform."}
            {tab === "billing"   && "Subscriptions, payment gateway configuration, and transaction history."}
            {tab === "support"   && "Manage and respond to user support tickets."}
            {tab === "accounts"  && "Monitor and control all live trading accounts."}
            {tab === "roles"     && "Platform-wide role and permission management."}
          </p>
        </div>

        {tab === "overview"  && <OverviewTab stats={stats} companies={companies} users={users} setTab={setTab} />}
        {tab === "companies" && (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Company</th>
                  <th className="text-left px-5 py-3">Industry</th>
                  <th className="text-left px-5 py-3">Country</th>
                  <th className="text-right px-5 py-3">Members</th>
                  <th className="text-right px-5 py-3">Active</th>
                  <th className="text-right px-5 py-3">Depts</th>
                  <th className="text-right px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c: any) => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-violet-600/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {c.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.industry ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.country ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-right font-semibold">{c.memberCount}</td>
                    <td className="px-5 py-3 text-xs text-right text-emerald-400 font-semibold">{c.activeCount}</td>
                    <td className="px-5 py-3 text-xs text-right">{c.departmentCount}</td>
                    <td className="px-5 py-3 text-xs text-right text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No companies registered yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {tab === "users" && (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-right px-5 py-3">Joined</th>
                  <th className="text-right px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 border border-border shrink-0">
                          {u.profileImageUrl && <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover rounded-full" />}
                          <AvatarFallback className="text-[10px]">{(u.firstName?.[0] ?? "?")}{(u.lastName?.[0] ?? "")}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold">{u.firstName ?? ""} {u.lastName ?? ""}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{u.email ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-right text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right"><StatusBadge status="active" /></td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {tab === "bots"     && <BotsTab />}
        {tab === "billing"  && <BillingTab />}
        {tab === "support"  && <SupportTab />}
        {tab === "accounts" && <LiveAccountsTab />}
        {tab === "roles"    && <RolesTab />}
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export default function CompanyAdminPortal() {
  const [session, setSession] = useState<any>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (!session?.success) {
    return <LoginPage onLogin={setSession} />;
  }

  return <AdminDashboard session={session} onLogout={handleLogout} />;
}
