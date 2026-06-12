import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, Shield, Lock, Eye, EyeOff, LogOut,
  TrendingUp, BarChart2, Globe, ChevronRight, AlertCircle,
  CheckCircle2, Activity, Crown, Mail, Layers, RefreshCw,
} from "lucide-react";

const DEFAULT_EMAIL = "saidumuhammed664@gmail.com";
const DEFAULT_PASS  = "Mhixter664@gmail.com";
const SESSION_KEY   = "company_admin_session";

/* ── helpers ────────────────────────────────────────────────────────────── */
async function apiPost(path: string, body: object) {
  const r = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function apiGet(path: string) {
  const r = await fetch(`/api${path}`);
  return r.json();
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
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Company Administration Portal
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-purple-600" />

          <div className="p-8">
            {/* Logo + title */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold">TradeVision Admin</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Company management &amp; team administration
              </p>
            </div>

            {/* Default credentials notice */}
            <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-primary/5 border border-primary/20">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                Default admin credentials are pre-filled below. You can sign in directly.
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold" disabled={loading}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Signing in…</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" />Access Admin Portal</>
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}

/* ── Stats card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────────────────── */
function AdminDashboard({ session, onLogout }: { session: any; onLogout: () => void }) {
  const [stats, setStats]       = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);
  const [tab, setTab]           = useState<"overview" | "companies" | "users">("overview");
  const [loading, setLoading]   = useState(true);

  const reload = async () => {
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
  };

  useEffect(() => { reload(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold">TradeVision Admin</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">SUPER ADMIN</span>
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
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
          >
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-bold">Company Administration</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all companies, members, departments and users across the platform.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <StatCard label="Total Companies"   value={stats.totalCompanies}   icon={Building2}  color="bg-primary/10 text-primary" />
            <StatCard label="Total Members"     value={stats.totalMembers}     icon={Users}      color="bg-blue-500/10 text-blue-400" />
            <StatCard label="Active Members"    value={stats.activeMembers}    icon={Activity}   color="bg-success/10 text-success" />
            <StatCard label="Departments"       value={stats.totalDepartments} icon={Layers}     color="bg-violet-500/10 text-violet-400" />
            <StatCard label="Platform Users"    value={stats.totalUsers}       icon={Globe}      color="bg-amber-500/10 text-amber-400" />
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-border">
          {(["overview","companies","users"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-5 text-sm font-semibold capitalize transition-all ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "overview" ? "Overview" : t === "companies" ? `Companies (${companies.length})` : `Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent companies */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <h3 className="text-sm font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Recent Companies</h3>
                <button onClick={() => setTab("companies")} className="text-xs text-primary hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="divide-y divide-border/40">
                {companies.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-600/10 flex items-center justify-center text-xs font-bold text-primary">
                      {c.name?.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.industry} · {c.country}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{c.memberCount} members</p>
                      <p className="text-[10px] text-muted-foreground">{c.departmentCount} depts</p>
                    </div>
                  </div>
                ))}
                {companies.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">No companies registered yet</div>
                )}
              </div>
            </div>

            {/* Recent users */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <h3 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Platform Users</h3>
                <button onClick={() => setTab("users")} className="text-xs text-primary hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></button>
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
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-bold shrink-0">ACTIVE</span>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">No users found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Companies tab ── */}
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
                          {c.name?.slice(0,2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.industry ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.country ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-right font-semibold">{c.memberCount}</td>
                    <td className="px-5 py-3 text-xs text-right text-success font-semibold">{c.activeCount}</td>
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

        {/* ── Users tab ── */}
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
                    <td className="px-5 py-3 text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-bold">ACTIVE</span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
