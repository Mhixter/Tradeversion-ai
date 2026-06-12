import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Users, Shield, Crown, Eye, TrendingUp, Bot,
  Settings, Check, X, Plus, Mail, MoreHorizontal, Search,
  ChevronDown, Activity, Clock, AlertTriangle, CheckCircle2,
  UserPlus, Trash2, Edit2, Lock,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Role = "Owner" | "Admin" | "Manager" | "Trader" | "Viewer";
type MemberStatus = "Active" | "Pending" | "Suspended";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: MemberStatus;
  joined: string;
  lastActive: string;
  bots: number;
  pnl: string;
}

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<Role, { color: string; bg: string; icon: React.ElementType; description: string }> = {
  Owner:   { color: "text-purple-400",  bg: "bg-purple-500/15 border-purple-500/30",  icon: Crown,     description: "Full platform access, billing & company settings" },
  Admin:   { color: "text-red-400",     bg: "bg-red-500/15 border-red-500/30",        icon: Shield,    description: "Manage team, bots & strategies. No billing access" },
  Manager: { color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/30",      icon: Settings,  description: "View all data, manage assigned bots & strategies" },
  Trader:  { color: "text-success",     bg: "bg-success/15 border-success/30",        icon: TrendingUp, description: "Execute trades, manage own bots & strategies only" },
  Viewer:  { color: "text-gray-400",    bg: "bg-gray-500/10 border-gray-500/20",      icon: Eye,       description: "Read-only access to all data, no execution rights" },
};

// ── Permission matrix ─────────────────────────────────────────────────────────
const PERMISSIONS: { label: string; icon: React.ElementType; owner: boolean; admin: boolean; manager: boolean; trader: boolean; viewer: boolean }[] = [
  { label: "View Dashboard",        icon: TrendingUp, owner: true,  admin: true,  manager: true,  trader: true,  viewer: true  },
  { label: "Execute Trades",        icon: TrendingUp, owner: true,  admin: true,  manager: false, trader: true,  viewer: false },
  { label: "Manage Own Bots",       icon: Bot,        owner: true,  admin: true,  manager: true,  trader: true,  viewer: false },
  { label: "Manage All Bots",       icon: Bot,        owner: true,  admin: true,  manager: true,  trader: false, viewer: false },
  { label: "Create Strategies",     icon: Shield,     owner: true,  admin: true,  manager: true,  trader: true,  viewer: false },
  { label: "Risk Settings",         icon: AlertTriangle, owner: true, admin: true, manager: true, trader: false, viewer: false },
  { label: "Invite Members",        icon: UserPlus,   owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "Manage Roles",          icon: Shield,     owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "View Analytics",        icon: TrendingUp, owner: true,  admin: true,  manager: true,  trader: true,  viewer: true  },
  { label: "API Key Management",    icon: Lock,       owner: true,  admin: true,  manager: false, trader: false, viewer: false },
  { label: "Billing & Plan",        icon: Crown,      owner: true,  admin: false, manager: false, trader: false, viewer: false },
  { label: "Company Settings",      icon: Building2,  owner: true,  admin: false, manager: false, trader: false, viewer: false },
];

// ── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "John Trader",    email: "john@tradevision.com",    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", role: "Owner",   status: "Active",    joined: "Jan 12, 2024", lastActive: "Just now",     bots: 5,  pnl: "+$15,248" },
  { id: "2", name: "Sarah Chen",     email: "sarah@tradevision.com",   avatar: "https://i.pravatar.cc/150?u=b04e5b8e8f3e8e8e8e8e", role: "Admin",   status: "Active",    joined: "Feb 3, 2024",  lastActive: "2 min ago",    bots: 3,  pnl: "+$8,420"  },
  { id: "3", name: "Marcus Webb",    email: "marcus@tradevision.com",  avatar: "https://i.pravatar.cc/150?u=c04e5b8e8f3e8e8e8e8e", role: "Manager", status: "Active",    joined: "Feb 18, 2024", lastActive: "1 hr ago",     bots: 2,  pnl: "+$3,910"  },
  { id: "4", name: "Alex Rivera",    email: "alex@tradevision.com",    avatar: "https://i.pravatar.cc/150?u=d04e5b8e8f3e8e8e8e8e", role: "Trader",  status: "Active",    joined: "Mar 5, 2024",  lastActive: "3 hrs ago",    bots: 1,  pnl: "+$2,105"  },
  { id: "5", name: "Priya Sharma",   email: "priya@tradevision.com",   avatar: "https://i.pravatar.cc/150?u=e04e5b8e8f3e8e8e8e8e", role: "Trader",  status: "Active",    joined: "Mar 22, 2024", lastActive: "Yesterday",    bots: 1,  pnl: "-$340"    },
  { id: "6", name: "Daniel Park",    email: "daniel@tradevision.com",  avatar: "https://i.pravatar.cc/150?u=f04e5b8e8f3e8e8e8e8e", role: "Viewer",  status: "Active",    joined: "Apr 10, 2024", lastActive: "3 days ago",   bots: 0,  pnl: "$0"       },
  { id: "7", name: "Emma Wilson",    email: "emma@tradevision.com",    avatar: "https://i.pravatar.cc/150?u=g04e5b8e8f3e8e8e8e8e", role: "Trader",  status: "Pending",   joined: "May 2, 2024",  lastActive: "Never",        bots: 0,  pnl: "$0"       },
  { id: "8", name: "Tom Bradley",    email: "tom@tradevision.com",     avatar: "https://i.pravatar.cc/150?u=h04e5b8e8f3e8e8e8e8e", role: "Viewer",  status: "Suspended", joined: "Jan 30, 2024", lastActive: "2 weeks ago",  bots: 0,  pnl: "$0"       },
];

const ACTIVITY_LOG = [
  { id: 1, user: "John Trader",  action: "Changed Sarah Chen's role to Admin",           time: "5 min ago",   type: "role"    },
  { id: 2, user: "Sarah Chen",   action: "Invited emma@tradevision.com as Trader",        time: "2 hrs ago",   type: "invite"  },
  { id: 3, user: "John Trader",  action: "Suspended Tom Bradley's account",               time: "2 weeks ago", type: "suspend" },
  { id: 4, user: "Marcus Webb",  action: "Created strategy 'XAUUSD Scalper' for team",   time: "3 days ago",  type: "create"  },
  { id: 5, user: "John Trader",  action: "Updated company risk limits",                   time: "1 week ago",  type: "settings"},
  { id: 6, user: "Alex Rivera",  action: "Joined as Trader",                              time: "Mar 5, 2024", type: "join"    },
];

// ── Helper components ─────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: MemberStatus }) {
  const map = { Active: "bg-success", Pending: "bg-amber-500", Suspended: "bg-destructive" };
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-1.5 h-1.5 rounded-full ${map[status]}`} />
      {status}
    </span>
  );
}

function PermCheck({ val }: { val: boolean }) {
  return val
    ? <Check className="w-3.5 h-3.5 text-success mx-auto" />
    : <X className="w-3 h-3 text-muted-foreground/30 mx-auto" />;
}

// ── Invite panel ──────────────────────────────────────────────────────────────
function InvitePanel({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Trader");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" />Invite Team Member</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign Role</label>
            <div className="grid grid-cols-1 gap-2">
              {(["Admin", "Manager", "Trader", "Viewer"] as Role[]).map(r => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${role === r ? `${cfg.bg} ${cfg.color} border-current` : "border-border hover:border-primary/40 text-muted-foreground"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{r}</p>
                      <p className="text-[10px] opacity-70 leading-tight">{cfg.description}</p>
                    </div>
                    {role === r && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 h-9"
            disabled={!email.includes("@")}
            onClick={() => { onInvite(email, role); onClose(); }}
          >
            <Mail className="w-3.5 h-3.5 mr-2" />Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CompanyManagement() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "All">("All");
  const [activeTab, setActiveTab] = useState<"members" | "roles" | "permissions" | "activity">("members");
  const [showInvite, setShowInvite] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; current: Role } | null>(null);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "All" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === "Active").length,
    pending: members.filter(m => m.status === "Pending").length,
    bots: members.reduce((s, m) => s + m.bots, 0),
  };

  const handleRoleChange = (id: string, newRole: Role) => {
    const member = members.find(m => m.id === id);
    if (!member || member.role === "Owner") return;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    toast({ title: "Role updated", description: `${member.name}'s role changed to ${newRole}.` });
    setEditingRole(null);
  };

  const handleStatusToggle = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member || member.role === "Owner") return;
    const newStatus: MemberStatus = member.status === "Active" ? "Suspended" : "Active";
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    toast({ title: `Account ${newStatus.toLowerCase()}`, description: `${member.name} is now ${newStatus.toLowerCase()}.` });
  };

  const handleRemove = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member || member.role === "Owner") return;
    setMembers(prev => prev.filter(m => m.id !== id));
    toast({ title: "Member removed", description: `${member.name} has been removed from the team.` });
  };

  const handleInvite = (email: string, role: Role) => {
    const newMember: Member = {
      id: String(Date.now()),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      email,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      role,
      status: "Pending",
      joined: new Date().toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }),
      lastActive: "Never",
      bots: 0,
      pnl: "$0",
    };
    setMembers(prev => [...prev, newMember]);
    toast({ title: "Invitation sent", description: `${email} has been invited as ${role}.` });
  };

  return (
    <Layout title="Company" subtitle="Manage your organization, team members and access roles">
      {showInvite && <InvitePanel onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      <div className="flex flex-col gap-4 sm:gap-6">

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-card border border-border rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">TradeVision Capital LLC</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">PRO PLAN</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Founded Jan 2024 · New York, USA · Proprietary Trading Firm</p>
          </div>
          <Button
            onClick={() => setShowInvite(true)}
            className="bg-primary hover:bg-primary/90 text-xs h-8 shrink-0"
            data-testid="button-invite-member"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />Invite Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: stats.total, icon: Users, color: "text-primary" },
            { label: "Active Members", value: stats.active, icon: CheckCircle2, color: "text-success" },
            { label: "Pending Invites", value: stats.pending, icon: Clock, color: "text-amber-400" },
            { label: "Bots Running", value: stats.bots, icon: Bot, color: "text-cyan-400" },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-accent flex items-center justify-center ${s.color} shrink-0`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
          {(["members", "roles", "permissions", "activity"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap capitalize transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              data-testid={`tab-${tab}`}
            >
              {tab === "members" ? `Members (${filtered.length})` : tab === "permissions" ? "Permissions Matrix" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── MEMBERS TAB ── */}
        {activeTab === "members" && (
          <div className="flex flex-col gap-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as Role | "All")}
                className="bg-accent border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8"
              >
                <option value="All">All Roles</option>
                {(["Owner", "Admin", "Manager", "Trader", "Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Members list — cards on mobile, table on desktop */}
            <div className="hidden sm:block">
              <Card className="border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-accent/30 text-muted-foreground text-xs">
                        <th className="text-left px-4 py-3 font-medium">Member</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Last Active</th>
                        <th className="text-right px-4 py-3 font-medium">Bots</th>
                        <th className="text-right px-4 py-3 font-medium">P&L</th>
                        <th className="text-center px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(member => {
                        const isOwner = member.role === "Owner";
                        const pnlPositive = member.pnl.startsWith("+");
                        const pnlNegative = member.pnl.startsWith("-");
                        return (
                          <tr key={member.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-[10px]">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                  </Avatar>
                                  {member.status === "Active" && <span className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-card" />}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold">{member.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {editingRole?.id === member.id && !isOwner ? (
                                <div className="flex items-center gap-1">
                                  <select
                                    value={editingRole.current}
                                    onChange={e => setEditingRole({ id: member.id, current: e.target.value as Role })}
                                    className="bg-accent border border-border rounded px-1.5 py-1 text-[10px] focus:outline-none"
                                    autoFocus
                                  >
                                    {(["Admin", "Manager", "Trader", "Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
                                  </select>
                                  <button className="text-success hover:opacity-80" onClick={() => handleRoleChange(member.id, editingRole.current)}><Check className="w-3 h-3" /></button>
                                  <button className="text-destructive hover:opacity-80" onClick={() => setEditingRole(null)}><X className="w-3 h-3" /></button>
                                </div>
                              ) : (
                                <RoleBadge role={member.role} />
                              )}
                            </td>
                            <td className="px-4 py-3"><StatusDot status={member.status} /></td>
                            <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{member.joined}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{member.lastActive}</td>
                            <td className="px-4 py-3 text-xs text-right font-medium">{member.bots}</td>
                            <td className={`px-4 py-3 text-xs text-right font-bold ${pnlPositive ? "text-success" : pnlNegative ? "text-destructive" : "text-muted-foreground"}`}>{member.pnl}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {!isOwner && (
                                  <>
                                    <button
                                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                      title="Change role"
                                      onClick={() => setEditingRole({ id: member.id, current: member.role })}
                                    ><Edit2 className="w-3 h-3" /></button>
                                    <button
                                      className={`p-1 transition-colors ${member.status === "Active" ? "text-muted-foreground hover:text-amber-400" : "text-muted-foreground hover:text-success"}`}
                                      title={member.status === "Active" ? "Suspend" : "Activate"}
                                      onClick={() => handleStatusToggle(member.id)}
                                    ><AlertTriangle className="w-3 h-3" /></button>
                                    <button
                                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                      title="Remove member"
                                      onClick={() => handleRemove(member.id)}
                                    ><Trash2 className="w-3 h-3" /></button>
                                  </>
                                )}
                                {isOwner && <Lock className="w-3 h-3 text-muted-foreground/30" />}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden flex flex-col gap-2">
              {filtered.map(member => {
                const isOwner = member.role === "Owner";
                const pnlPositive = member.pnl.startsWith("+");
                return (
                  <Card key={member.id} className="border-border bg-card">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-[10px]">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          {member.status === "Active" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-card" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate">{member.name}</p>
                            <StatusDot status={member.status} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{member.email}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <RoleBadge role={member.role} />
                            <span className="text-[10px] text-muted-foreground">{member.bots} bots</span>
                            <span className={`text-[10px] font-bold ${pnlPositive ? "text-success" : "text-destructive"}`}>{member.pnl}</span>
                          </div>
                        </div>
                        {!isOwner && (
                          <div className="flex flex-col gap-1 shrink-0">
                            <button className="p-1.5 text-muted-foreground hover:text-primary" onClick={() => setEditingRole({ id: member.id, current: member.role })}><Edit2 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(member.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      {editingRole?.id === member.id && !isOwner && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Change role:</span>
                          <select
                            value={editingRole.current}
                            onChange={e => setEditingRole({ id: member.id, current: e.target.value as Role })}
                            className="flex-1 bg-accent border border-border rounded px-2 py-1 text-xs"
                          >
                            {(["Admin", "Manager", "Trader", "Viewer"] as Role[]).map(r => <option key={r}>{r}</option>)}
                          </select>
                          <button className="text-xs bg-primary text-white px-2 py-1 rounded" onClick={() => handleRoleChange(member.id, editingRole.current)}>Save</button>
                          <button className="text-xs text-muted-foreground" onClick={() => setEditingRole(null)}>Cancel</button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROLES TAB ── */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(["Owner", "Admin", "Manager", "Trader", "Viewer"] as Role[]).map(role => {
              const cfg = ROLE_CONFIG[role];
              const Icon = cfg.icon;
              const count = members.filter(m => m.role === role).length;
              const roleMembers = members.filter(m => m.role === role);
              return (
                <Card key={role} className={`border ${cfg.bg}`}>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <CardTitle className={`text-sm font-bold ${cfg.color}`}>{role}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{count} member{count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className={`text-xl font-black ${cfg.color}`}>{count}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>
                    {roleMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {roleMembers.slice(0, 4).map(m => (
                          <div key={m.id} className="flex items-center gap-1.5 bg-background/60 rounded-full px-2 py-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-foreground">{m.name.split(" ")[0]}</span>
                          </div>
                        ))}
                        {roleMembers.length > 4 && (
                          <span className="text-[10px] text-muted-foreground px-2 py-1">+{roleMembers.length - 4} more</span>
                        )}
                      </div>
                    )}
                    {roleMembers.length === 0 && (
                      <p className="text-[10px] text-muted-foreground italic">No members with this role</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── PERMISSIONS TAB ── */}
        {activeTab === "permissions" && (
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-border/50">
              <CardTitle className="text-sm">Permissions Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">What each role can and cannot do</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-accent/20">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-48">Permission</th>
                      {(["Owner", "Admin", "Manager", "Trader", "Viewer"] as Role[]).map(role => {
                        const cfg = ROLE_CONFIG[role];
                        const Icon = cfg.icon;
                        return (
                          <th key={role} className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                              <span className={`text-[10px] font-semibold ${cfg.color}`}>{role}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS.map((perm, i) => {
                      const Icon = perm.icon;
                      return (
                        <tr key={i} className="border-b border-border/40 hover:bg-accent/10 transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs">{perm.label}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center"><PermCheck val={perm.owner} /></td>
                          <td className="px-3 py-2.5 text-center"><PermCheck val={perm.admin} /></td>
                          <td className="px-3 py-2.5 text-center"><PermCheck val={perm.manager} /></td>
                          <td className="px-3 py-2.5 text-center"><PermCheck val={perm.trader} /></td>
                          <td className="px-3 py-2.5 text-center"><PermCheck val={perm.viewer} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && (
          <Card className="border-border bg-card">
            <CardHeader className="px-4 py-3 border-b border-border/50">
              <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ACTIVITY_LOG.map((log, i) => {
                const iconMap: Record<string, React.ElementType> = { role: Edit2, invite: UserPlus, suspend: AlertTriangle, create: Plus, settings: Settings, join: Users };
                const colorMap: Record<string, string> = { role: "text-blue-400 bg-blue-500/10", invite: "text-primary bg-primary/10", suspend: "text-amber-400 bg-amber-500/10", create: "text-success bg-success/10", settings: "text-purple-400 bg-purple-500/10", join: "text-cyan-400 bg-cyan-500/10" };
                const Icon = iconMap[log.type] || Activity;
                return (
                  <div key={log.id} className={`flex items-start gap-3 px-4 py-3 ${i < ACTIVITY_LOG.length - 1 ? "border-b border-border/40" : ""} hover:bg-accent/10 transition-colors`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorMap[log.type]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{log.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">by <span className="text-foreground/70">{log.user}</span></span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground">{log.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

      </div>
    </Layout>
  );
}
