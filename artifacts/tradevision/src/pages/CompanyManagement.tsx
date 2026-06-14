import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/replit-auth-web";
import {
  Building2, Users, Shield, Crown, Eye, TrendingUp, Bot,
  Settings, Check, X, Mail, Search, Activity, Clock,
  AlertTriangle, CheckCircle2, UserPlus, Trash2, Edit2,
  Lock, MapPin, CalendarDays, Sparkles, ChevronRight, Loader2, Plus,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Role = "Owner" | "Admin" | "Manager" | "Trader" | "Viewer";
type MemberStatus = "Active" | "Pending" | "Suspended";

interface Member {
  id: string; name: string; email: string; avatar: string;
  role: Role; status: MemberStatus; joined: string;
  lastActive: string; bots: number; pnl: string;
}

/* ─── Role config ─────────────────────────────────────────────────────────── */
const RC: Record<Role, {
  icon: React.ElementType; description: string;
  pill: string; ring: string; glow: string;
  headerBg: string; dot: string;
}> = {
  Owner:   { icon: Crown,     description: "Full platform access, billing & company settings",         pill: "bg-gradient-to-r from-primary to-lime-500 text-primary-foreground",   ring: "ring-primary/60",     glow: "shadow-primary/20",    headerBg: "from-primary/20 to-lime-600/5",       dot: "bg-primary"     },
  Admin:   { icon: Shield,    description: "Manage team, bots & strategies. No billing access",        pill: "bg-gradient-to-r from-red-600 to-rose-500 text-white",               ring: "ring-red-500/60",     glow: "shadow-red-500/20",     headerBg: "from-red-600/20 to-rose-600/5",       dot: "bg-red-400"     },
  Manager: { icon: Settings,  description: "View all data, manage assigned bots & strategies",        pill: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white",              ring: "ring-blue-500/60",    glow: "shadow-blue-500/20",    headerBg: "from-blue-600/20 to-cyan-600/5",      dot: "bg-blue-400"    },
  Trader:  { icon: TrendingUp, description: "Execute trades, manage own bots & strategies only",      pill: "bg-gradient-to-r from-emerald-600 to-green-500 text-white",          ring: "ring-emerald-500/60", glow: "shadow-emerald-500/20", headerBg: "from-emerald-600/20 to-green-600/5",  dot: "bg-emerald-400" },
  Viewer:  { icon: Eye,       description: "Read-only access to all data, no execution rights",       pill: "bg-gradient-to-r from-gray-600 to-slate-500 text-white",             ring: "ring-gray-500/40",    glow: "shadow-gray-500/10",    headerBg: "from-gray-600/10 to-slate-600/5",     dot: "bg-gray-400"    },
};

/* ─── Permissions ─────────────────────────────────────────────────────────── */
const PERMS = [
  { label: "View Dashboard",      icon: TrendingUp,    owner: true,  admin: true,  manager: true,  trader: true,  viewer: true  },
  { label: "Execute Trades",      icon: TrendingUp,    owner: true,  admin: true,  manager: false, trader: true,  viewer: false },
  { label: "Manage Own Bots",     icon: Bot,           owner: true,  admin: true,  manager: true,  trader: true,  viewer: false },
  { label: "Manage All Bots",     icon: Bot,           owner: true,  admin: true,  manager: true,  trader: false, viewer: false },
  { label: "Create Strategies",   icon: Shield,        owner: true,  admin: true,  manager: true,  trader: true,  viewer: false },
  { label: "Risk Settings",       icon: AlertTriangle, owner: true,  admin: true,  manager: true,  trader: false, viewer: false },
  { label: "Invite Members",      icon: UserPlus,      owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "Manage Roles",        icon: Shield,        owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "View Analytics",      icon: TrendingUp,    owner: true,  admin: true,  manager: true,  trader: true,  viewer: true  },
  { label: "API Key Management",  icon: Lock,          owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "Billing & Plan",      icon: Crown,         owner: true,  admin: false, manager: false, trader: false, viewer: false },
  { label: "Company Settings",    icon: Building2,     owner: true,  admin: false, manager: false, trader: false, viewer: false },
];

/* ─── API helpers ─────────────────────────────────────────────────────────── */
function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

function apiMemberToMember(m: any): Member {
  const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email?.split("@")[0] || "Unknown";
  const role = (capitalize(m.role) || "Viewer") as Role;
  const status = (capitalize(m.status) || "Active") as MemberStatus;
  return {
    id: String(m.id),
    name,
    email: m.email || "",
    avatar: m.profileImageUrl || `https://i.pravatar.cc/150?u=${m.email || m.id}`,
    role,
    status,
    joined: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en", { month:"short", day:"numeric", year:"numeric" }) : "Unknown",
    lastActive: "—",
    bots: 0,
    pnl: "$0",
  };
}

const ACTIVITY = [
  { id:1, user:"John Trader",  avatar:"https://i.pravatar.cc/150?u=a042581f4e29026024d", action:"Changed Sarah Chen's role to Admin",         time:"5 min ago",   type:"role"    },
  { id:2, user:"Sarah Chen",   avatar:"https://i.pravatar.cc/150?u=b04e5b8e8f3e8e8e8e8e", action:"Invited emma@tradevision.com as Trader",      time:"2 hrs ago",   type:"invite"  },
  { id:3, user:"John Trader",  avatar:"https://i.pravatar.cc/150?u=a042581f4e29026024d", action:"Suspended Tom Bradley's account",              time:"2 weeks ago", type:"suspend" },
  { id:4, user:"Marcus Webb",  avatar:"https://i.pravatar.cc/150?u=c04e5b8e8f3e8e8e8e8e", action:"Created strategy 'XAUUSD Scalper' for team",  time:"3 days ago",  type:"create"  },
  { id:5, user:"John Trader",  avatar:"https://i.pravatar.cc/150?u=a042581f4e29026024d", action:"Updated company risk limits",                  time:"1 week ago",  type:"settings"},
  { id:6, user:"Alex Rivera",  avatar:"https://i.pravatar.cc/150?u=d04e5b8e8f3e8e8e8e8e", action:"Joined as Trader",                           time:"Mar 5, 2024", type:"join"    },
];

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function RolePill({ role }: { role: Role }) {
  const { icon: Icon, pill } = RC[role];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm ${pill}`}>
      <Icon className="w-2.5 h-2.5" />{role}
    </span>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const styles = {
    Active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Pending:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Suspended: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  const dots = { Active: "bg-emerald-400", Pending: "bg-amber-400", Suspended: "bg-red-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function PermCell({ val, role }: { val: boolean; role: Role }) {
  const { dot } = RC[role];
  return val
    ? <div className="flex justify-center"><div className={`w-5 h-5 rounded-full ${dot} bg-opacity-20 flex items-center justify-center`}><Check className="w-3 h-3 text-white" /></div></div>
    : <div className="flex justify-center"><X className="w-3 h-3 text-muted-foreground/20" /></div>;
}

/* ─── Invite modal ────────────────────────────────────────────────────────── */
function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Trader");
  const valid = email.includes("@") && email.includes(".");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="relative px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/10 to-emerald-600/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Invite Team Member</h2>
              <p className="text-[11px] text-muted-foreground">Send an email invitation to join your team</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="colleague@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 h-9 text-sm bg-background border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Role picker */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Select Role</label>
            <div className="space-y-2">
              {(["Admin","Manager","Trader","Viewer"] as Role[]).map(r => {
                const cfg = RC[r];
                const Icon = cfg.icon;
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? `bg-gradient-to-r ${cfg.headerBg} border-white/10 shadow-md`
                        : "border-border/50 hover:border-border bg-background/40 hover:bg-accent/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? cfg.pill : "bg-accent"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{r}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{cfg.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full h-10 bg-primary hover:bg-primary/90 font-semibold text-sm"
            disabled={!valid}
            onClick={() => { onInvite(email, role); onClose(); }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function CompanyManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "All">("All");
  const [activeTab, setActiveTab] = useState<"members" | "roles" | "permissions" | "activity">("members");
  const [showInvite, setShowInvite] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; current: Role } | null>(null);

  // ── Real API queries ─────────────────────────────────────────────────────
  const overviewQ = useQuery({
    queryKey: ["company-overview"],
    queryFn: async () => {
      const res = await fetch("/api/company/overview");
      if (!res.ok) throw new Error("Failed to load company");
      return res.json();
    },
    retry: false,
  });

  const membersQ = useQuery({
    queryKey: ["company-members"],
    queryFn: async () => {
      const res = await fetch("/api/company/members");
      if (!res.ok) throw new Error("Failed to load members");
      const data = await res.json();
      return (data as any[]).map(apiMemberToMember);
    },
    enabled: overviewQ.data?.exists === true,
  });

  const setupMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/company/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user ? `${user.firstName ?? ""}'s Company`.trim() : "My Company",
          country: "USA",
          industry: "Proprietary Trading",
        }),
      });
      if (!res.ok) throw new Error("Setup failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-overview"] });
      qc.invalidateQueries({ queryKey: ["company-members"] });
      toast({ title: "Company created!", description: "Your company has been set up with default departments." });
    },
    onError: () => toast({ title: "Error", description: "Failed to set up company.", variant: "destructive" }),
  });

  const inviteMut = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: Role }) => {
      const res = await fetch("/api/company/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: role.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Invite failed");
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["company-members"] });
      toast({ title: "Member added!", description: data.message });
    },
    onError: (err: Error) => toast({ title: "Could not add member", description: err.message, variant: "destructive" }),
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/company/members/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      return res.json();
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["company-members"] });
      toast({ title: status === "suspended" ? "Member suspended" : "Member activated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update status.", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/company/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Remove failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-members"] });
      toast({ title: "Member removed", description: "Member has been removed from the team." });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" }),
  });

  const roleChangeMut = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const res = await fetch(`/api/company/members/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.toLowerCase() }),
      });
      if (!res.ok) throw new Error("Role change failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-members"] });
      setEditingRole(null);
      toast({ title: "Role updated", description: "Member role has been changed." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update role.", variant: "destructive" }),
  });

  const members: Member[] = membersQ.data ?? [];
  const overview = overviewQ.data;
  const companyExists = overview?.exists === true;
  const companyName = overview?.company?.name ?? "Your Company";
  const companyCountry = overview?.company?.country ?? "USA";
  const myRole = (overview?.myRole ?? null) as string | null;
  const canManage = !!myRole && ["owner", "admin"].includes(myRole);

  const filtered = members.filter(m => {
    const s = search.toLowerCase();
    return (m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s))
      && (filterRole === "All" || m.role === filterRole);
  });

  const stats = {
    total:   members.length,
    active:  members.filter(m => m.status === "Active").length,
    pending: members.filter(m => m.status === "Pending").length,
    bots:    members.reduce((s, m) => s + m.bots, 0),
  };

  const handleRoleChange = (id: string, newRole: Role) => {
    const m = members.find(x => x.id === id);
    if (!m || m.role === "Owner") return;
    roleChangeMut.mutate({ id, role: newRole });
  };

  const handleStatusToggle = (id: string) => {
    const m = members.find(x => x.id === id);
    if (!m || m.role === "Owner") return;
    const newStatus = m.status === "Active" ? "suspended" : "active";
    statusMut.mutate({ id, status: newStatus });
  };

  const handleRemove = (id: string) => {
    const m = members.find(x => x.id === id);
    if (!m || m.role === "Owner") return;
    removeMut.mutate(id);
  };

  const handleInvite = (email: string, role: Role) => {
    inviteMut.mutate({ email, role });
  };

  // ── Company setup screen ─────────────────────────────────────────────────
  if (overviewQ.isLoading) {
    return (
      <Layout title="Company" subtitle="Manage your organization, team members and access roles">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!companyExists) {
    return (
      <Layout title="Company" subtitle="Set up your organization to manage your team">
        <div className="flex flex-col items-center justify-center py-24 max-w-md mx-auto text-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Set Up Your Company</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create your organization to invite team members, assign roles, and manage your trading operation as a team.
            </p>
          </div>
          <div className="w-full space-y-2 text-left bg-card border border-border/50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">What you get</p>
            {["5-tier RBAC (Owner, Admin, Manager, Trader, Viewer)", "Department tracking & budget management", "Team-wide bot allocation", "Audit log & activity feed", "Company risk management"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Button
            className="h-11 px-8 bg-primary hover:bg-primary/90 font-semibold text-sm shadow-lg shadow-primary/20 w-full"
            onClick={() => setupMut.mutate()}
            disabled={setupMut.isPending}
          >
            {setupMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Company
          </Button>
        </div>
      </Layout>
    );
  }


  const TABS = [
    { key: "members" as const,     label: `Members`,       count: filtered.length },
    { key: "roles" as const,       label: "Roles",         count: 5               },
    { key: "permissions" as const, label: "Permissions",   count: null            },
    { key: "activity" as const,    label: "Activity",      count: ACTIVITY.length },
  ];

  return (
    <Layout title="Company" subtitle="Manage your organization, team members and access roles">
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      <div className="flex flex-col gap-5">

        {/* ── Hero banner ────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
          {/* gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-700/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xl shadow-primary/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold tracking-tight">{companyName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-wide">
                  <Sparkles className="w-2.5 h-2.5" />PRO PLAN
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{companyCountry}</span>
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Founded {overview?.company?.createdAt ? new Date(overview.company.createdAt).toLocaleDateString("en", { month:"short", year:"numeric" }) : "2024"}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{overview?.company?.industry ?? "Proprietary Trading"}</span>
              </div>

              {/* Member face-pile */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map(m => (
                    <Avatar key={m.id} className="w-6 h-6 border-2 border-card">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">{stats.total} member{stats.total !== 1 ? "s" : ""} · {stats.active} active</span>
              </div>
            </div>

            {canManage && (
              <Button
                onClick={() => setShowInvite(true)}
                className="bg-primary hover:bg-primary/90 h-9 px-4 text-sm font-semibold shrink-0 shadow-lg shadow-primary/20"
                data-testid="button-invite-member"
              >
                <UserPlus className="w-3.5 h-3.5 mr-2" />Invite Member
              </Button>
            )}
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Total Members",  value:stats.total,   icon:Users,        from:"from-primary/20",   to:"to-lime-600/5",    iconColor:"text-primary",  numColor:"text-primary"  },
            { label:"Active Members", value:stats.active,  icon:CheckCircle2, from:"from-emerald-600/20",to:"to-green-600/5",  iconColor:"text-success",  numColor:"text-success"  },
            { label:"Pending Invites",value:stats.pending, icon:Clock,        from:"from-amber-600/20", to:"to-yellow-600/5",  iconColor:"text-amber-400",numColor:"text-amber-400"},
            { label:"Bots Running",   value:stats.bots,    icon:Bot,          from:"from-cyan-600/20",  to:"to-sky-600/5",     iconColor:"text-cyan-400", numColor:"text-cyan-400" },
          ].map(s => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${s.from} ${s.to} p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-2xl sm:text-3xl font-black ${s.numColor}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">{s.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-xl bg-card/60 flex items-center justify-center ${s.iconColor}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-0.5 border-b border-border overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 pb-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                activeTab === t.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${t.key}`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === t.key ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ MEMBERS TAB ═══════════════════════════════════════════════════ */}
        {activeTab === "members" && (
          <div className="flex flex-col gap-3">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs bg-card border-border/60" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {(["All","Owner","Admin","Manager","Trader","Viewer"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r)}
                    className={`px-3 h-9 rounded-lg text-xs font-semibold border transition-all ${
                      filterRole === r
                        ? r === "All"
                          ? "bg-primary text-white border-primary"
                          : `${RC[r as Role]?.pill ?? ""} border-transparent`
                        : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl border border-border/50 overflow-hidden bg-card">
              <table className="w-full">
                <thead>
                  <tr className="bg-accent/40 border-b border-border/60 text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Member</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Last Active</th>
                    <th className="text-right px-4 py-3">Bots</th>
                    <th className="text-right px-4 py-3">P&L</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const isOwner = m.role === "Owner";
                    const pnlPos = m.pnl.startsWith("+");
                    const pnlNeg = m.pnl.startsWith("-");
                    const { ring, glow } = RC[m.role];
                    return (
                      <tr
                        key={m.id}
                        className={`border-b border-border/40 hover:bg-accent/20 transition-colors group ${i % 2 === 0 ? "" : "bg-accent/5"}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className={`w-9 h-9 ring-2 ${ring} shadow-md ${glow}`}>
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-[10px]">{m.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              {m.status === "Active" && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold leading-tight">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {editingRole?.id === m.id && !isOwner ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={editingRole.current}
                                onChange={e => setEditingRole({ id: m.id, current: e.target.value as Role })}
                                className="bg-accent border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                              >
                                {(["Admin","Manager","Trader","Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
                              </select>
                              <button className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center" onClick={() => handleRoleChange(m.id, editingRole.current)}><Check className="w-3 h-3" /></button>
                              <button className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center" onClick={() => setEditingRole(null)}><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <RolePill role={m.role} />
                          )}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" />{m.joined}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{m.lastActive}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="inline-flex items-center justify-end gap-1 text-xs font-semibold">
                            <Bot className="w-3 h-3 text-muted-foreground" />{m.bots}
                          </span>
                        </td>
                        <td className={`px-4 py-3.5 text-right text-sm font-bold ${pnlPos ? "text-success" : pnlNeg ? "text-destructive" : "text-muted-foreground"}`}>{m.pnl}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage && !isOwner ? (
                              <>
                                <button
                                  className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                                  title="Change role"
                                  onClick={() => setEditingRole({ id: m.id, current: m.role })}
                                ><Edit2 className="w-3 h-3" /></button>
                                <button
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${m.status==="Active" ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                                  title={m.status==="Active" ? "Suspend" : "Activate"}
                                  onClick={() => handleStatusToggle(m.id)}
                                ><AlertTriangle className="w-3 h-3" /></button>
                                <button
                                  className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                  title="Remove member"
                                  onClick={() => handleRemove(m.id)}
                                ><Trash2 className="w-3 h-3" /></button>
                              </>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/20" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No members match your search</p>
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {filtered.map(m => {
                const { ring, glow } = RC[m.role];
                const pnlPos = m.pnl.startsWith("+");
                return (
                  <div key={m.id} className="bg-card border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className={`w-11 h-11 ring-2 ${ring} shadow-md ${glow} shrink-0`}>
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback className="text-xs">{m.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm font-bold truncate">{m.name}</p>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mb-2">{m.email}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <RolePill role={m.role} />
                          <span className={`text-[11px] font-bold ${pnlPos ? "text-success" : "text-destructive"}`}>{m.pnl}</span>
                          <span className="text-[10px] text-muted-foreground">{m.bots} bots</span>
                        </div>
                      </div>
                      {canManage && m.role !== "Owner" && (
                        <button
                          className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                          onClick={() => setEditingRole({ id: m.id, current: m.role })}
                        ><Edit2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    {editingRole?.id === m.id && m.role !== "Owner" && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Role:</span>
                        <select
                          value={editingRole.current}
                          onChange={e => setEditingRole({ id: m.id, current: e.target.value as Role })}
                          className="flex-1 bg-accent border border-border rounded-lg px-2 py-1.5 text-xs"
                        >
                          {(["Admin","Manager","Trader","Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
                        </select>
                        <button className="px-2 py-1.5 rounded-lg bg-primary text-white text-xs font-bold" onClick={() => handleRoleChange(m.id, editingRole.current)}>Save</button>
                        <button className="text-xs text-muted-foreground" onClick={() => setEditingRole(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ROLES TAB ═════════════════════════════════════════════════════ */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["Owner","Admin","Manager","Trader","Viewer"] as Role[]).map(role => {
              const cfg = RC[role];
              const Icon = cfg.icon;
              const roleMembers = members.filter(m => m.role === role);
              const count = roleMembers.length;
              return (
                <div key={role} className={`relative overflow-hidden rounded-xl border border-border/50 bg-card`}>
                  {/* Gradient top strip */}
                  <div className={`h-1 bg-gradient-to-r ${cfg.pill}`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cfg.headerBg} pointer-events-none`} />

                  <div className="relative p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${cfg.pill}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">{role}</h3>
                          <p className="text-[10px] text-muted-foreground">{count} member{count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${cfg.dot.replace("bg-","text-")}`}>{count}</span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{cfg.description}</p>

                    {roleMembers.length > 0 ? (
                      <div className="space-y-2">
                        {roleMembers.slice(0,4).map(m => (
                          <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/40 border border-border/30">
                            <Avatar className="w-6 h-6 shrink-0">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium flex-1 truncate">{m.name}</span>
                            <StatusBadge status={m.status} />
                          </div>
                        ))}
                        {roleMembers.length > 4 && (
                          <p className="text-[10px] text-muted-foreground text-center pt-1">+{roleMembers.length - 4} more</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[11px] text-muted-foreground">No members assigned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ PERMISSIONS TAB ═══════════════════════════════════════════════ */}
        {activeTab === "permissions" && (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-accent/20">
              <h3 className="text-sm font-bold">Permissions Matrix</h3>
              <p className="text-xs text-muted-foreground mt-0.5">A comprehensive overview of what each role can access and perform</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-52">Permission</th>
                    {(["Owner","Admin","Manager","Trader","Viewer"] as Role[]).map(role => {
                      const { icon: Icon, pill, dot } = RC[role];
                      return (
                        <th key={role} className="px-3 py-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-lg ${pill} flex items-center justify-center shadow-sm`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[10px] font-bold ${dot.replace("bg-","text-")}`}>{role}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERMS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <tr key={i} className={`border-b border-border/30 hover:bg-accent/10 transition-colors ${i % 2 === 0 ? "" : "bg-accent/5"}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                            <span className="text-xs font-medium">{p.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3"><PermCell val={p.owner}   role="Owner"   /></td>
                        <td className="px-3 py-3"><PermCell val={p.admin}   role="Admin"   /></td>
                        <td className="px-3 py-3"><PermCell val={p.manager} role="Manager" /></td>
                        <td className="px-3 py-3"><PermCell val={p.trader}  role="Trader"  /></td>
                        <td className="px-3 py-3"><PermCell val={p.viewer}  role="Viewer"  /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ACTIVITY TAB ══════════════════════════════════════════════════ */}
        {activeTab === "activity" && (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-accent/20 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">Audit Log</h3>
              <span className="ml-auto text-[10px] text-muted-foreground">Last 30 days</span>
            </div>

            <div className="p-5">
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

                <div className="space-y-5">
                  {ACTIVITY.map(log => {
                    const typeStyles: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
                      role:     { bg:"bg-primary/15",     color:"text-primary",     icon: Edit2       },
                      invite:   { bg:"bg-primary/15",     color:"text-primary",     icon: UserPlus    },
                      suspend:  { bg:"bg-amber-500/15",   color:"text-amber-400",   icon: AlertTriangle},
                      create:   { bg:"bg-success/15",     color:"text-success",     icon: CheckCircle2},
                      settings: { bg:"bg-emerald-500/15", color:"text-emerald-400", icon: Settings    },
                      join:     { bg:"bg-cyan-500/15",    color:"text-cyan-400",    icon: Users       },
                    };
                    const ts = typeStyles[log.type] ?? typeStyles.join;
                    const TIcon = ts.icon;
                    return (
                      <div key={log.id} className="relative flex items-start gap-4 pl-10">
                        {/* Dot on timeline */}
                        <div className={`absolute left-3.5 top-2 w-3 h-3 rounded-full border-2 border-card ${ts.bg.replace("/15","").replace("bg-","bg-")} shadow-sm`} />

                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${ts.bg} ${ts.color}`}>
                          <TIcon className="w-3.5 h-3.5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{log.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={log.avatar} />
                              <AvatarFallback className="text-[7px]">{log.user[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-muted-foreground">{log.user}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                            <span className="text-[11px] text-muted-foreground/60">{log.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
