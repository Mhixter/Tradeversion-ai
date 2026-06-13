import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Users, UserPlus, Search, Mail, Phone, Shield, ChevronDown,
  MoreHorizontal, CheckCircle2, Clock, XCircle, Edit3, Trash2,
  X, Building2, Briefcase,
} from "lucide-react";

type StaffStatus = "active" | "invited" | "inactive";
type StaffRole = "founder" | "manager" | "developer" | "analyst" | "support";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  phone: string | null;
  bio: string | null;
  invitedAt: string;
  joinedAt: string | null;
  createdAt: string;
}

const ROLES: { value: StaffRole; label: string; color: string }[] = [
  { value: "founder",   label: "Founder",   color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { value: "manager",   label: "Manager",   color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { value: "developer", label: "Developer", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { value: "analyst",   label: "Analyst",   color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  { value: "support",   label: "Support",   color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
];

const DEPARTMENTS = ["Engineering", "Product", "Support", "Operations", "Analytics", "Marketing", "Finance"];

const STATUS_CONFIG: Record<StaffStatus, { icon: React.ElementType; label: string; color: string }> = {
  active:   { icon: CheckCircle2, label: "Active",   color: "text-emerald-500" },
  invited:  { icon: Clock,        label: "Invited",  color: "text-blue-500" },
  inactive: { icon: XCircle,      label: "Inactive", color: "text-muted-foreground" },
};

function RoleBadge({ role }: { role: StaffRole }) {
  const config = ROLES.find(r => r.value === role) ?? ROLES[4];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

interface StaffFormProps {
  initial?: Partial<StaffMember>;
  onSave: (data: Partial<StaffMember>) => void;
  onCancel: () => void;
  loading: boolean;
}

function StaffForm({ initial, onSave, onCancel, loading }: StaffFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    role: initial?.role ?? "support" as StaffRole,
    department: initial?.department ?? "Support",
    phone: initial?.phone ?? "",
    bio: initial?.bio ?? "",
    status: initial?.status ?? "invited" as StaffStatus,
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
          <input value={form.name} onChange={set("name")} placeholder="Jane Smith"
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address *</label>
          <input value={form.email} onChange={set("email")} type="email" placeholder="jane@example.com"
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
          <select value={form.role} onChange={set("role")}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
          <select value={form.department} onChange={set("department")}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000"
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        {initial && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <select value={form.status} onChange={set("status")}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio / Notes</label>
        <textarea value={form.bio} onChange={set("bio")} rows={2} placeholder="Short description or internal notes…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={loading || !form.name || !form.email}>
          {loading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : initial ? "Save Changes" : "Add Member"}
        </Button>
      </div>
    </div>
  );
}

export default function TeamManagement() {
  const { toast } = useToast();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/staff", { credentials: "include" })
      .then(r => r.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => toast({ title: "Failed to load team", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form: Partial<StaffMember>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setMembers(prev => [...prev, data]);
      setShowAdd(false);
      toast({ title: "Team member added", description: `${data.name} has been invited.` });
    } catch (e: any) {
      toast({ title: "Failed to add member", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form: Partial<StaffMember>) => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${editing.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setMembers(prev => prev.map(m => m.id === editing.id ? data : m));
      setEditing(null);
      toast({ title: "Member updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    try {
      await fetch(`/api/staff/${id}`, { method: "DELETE", credentials: "include" });
      setMembers(prev => prev.filter(m => m.id !== id));
      setMenuOpen(null);
      toast({ title: "Member removed" });
    } catch {
      toast({ title: "Failed to remove member", variant: "destructive" });
    }
  };

  const handleDeactivate = async (member: StaffMember) => {
    const newStatus = member.status === "inactive" ? "active" : "inactive";
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(prev => prev.map(m => m.id === member.id ? data : m));
      setMenuOpen(null);
      toast({ title: newStatus === "inactive" ? "Member deactivated" : "Member reactivated" });
    } catch (e: any) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const depts = ["All", ...Array.from(new Set(members.map(m => m.department)))];

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || m.department === deptFilter;
    return matchSearch && matchDept;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === "active").length,
    invited: members.filter(m => m.status === "invited").length,
    byDept: DEPARTMENTS.filter(d => members.some(m => m.department === d)).map(d => ({
      dept: d, count: members.filter(m => m.department === d).length,
    })),
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6" onClick={() => setMenuOpen(null)}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Internal Team</h1>
              <p className="text-sm text-muted-foreground">Manage platform staff, roles, and departments</p>
            </div>
          </div>
          <Button onClick={() => { setShowAdd(true); setEditing(null); }} size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" />Add Member
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Staff",    value: stats.total,   color: "text-foreground" },
            { label: "Active",         value: stats.active,  color: "text-emerald-500" },
            { label: "Pending Invite", value: stats.invited, color: "text-blue-500" },
            { label: "Departments",    value: stats.byDept.length, color: "text-purple-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add / Edit form */}
        {(showAdd || editing) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  {editing ? "Edit Team Member" : "Add Team Member"}
                </CardTitle>
                <button onClick={() => { setShowAdd(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <StaffForm
                initial={editing ?? undefined}
                onSave={editing ? handleEdit : handleAdd}
                onCancel={() => { setShowAdd(false); setEditing(null); }}
                loading={saving}
              />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${deptFilter === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Team table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {members.length === 0 ? "No team members yet" : "No results found"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {members.length === 0
                      ? "Add your first team member to get started."
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
                {members.length === 0 && (
                  <Button size="sm" onClick={() => setShowAdd(true)}>
                    <UserPlus className="w-4 h-4 mr-1.5" />Add First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(member => {
                  const statusCfg = STATUS_CONFIG[member.status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                          <RoleBadge role={member.role} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />{member.email}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{member.department}
                          </span>
                          {member.phone && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />{member.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium shrink-0 ${statusCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>

                      {/* Joined */}
                      <div className="hidden lg:block text-xs text-muted-foreground shrink-0 text-right">
                        {member.joinedAt
                          ? `Joined ${new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                          : `Invited ${new Date(member.invitedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </div>

                      {/* Actions */}
                      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpen === member.id && (
                          <div className="absolute right-0 top-8 z-10 w-44 bg-popover border border-border rounded-xl shadow-lg py-1 text-sm">
                            <button
                              onClick={() => { setEditing(member); setShowAdd(false); setMenuOpen(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted text-foreground"
                            >
                              <Edit3 className="w-3.5 h-3.5" />Edit Details
                            </button>
                            <button
                              onClick={() => handleDeactivate(member)}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted text-foreground"
                            >
                              {member.status === "inactive"
                                ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Reactivate</>
                                : <><XCircle className="w-3.5 h-3.5 text-amber-500" />Deactivate</>}
                            </button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => handleDelete(member.id, member.name)}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department breakdown */}
        {stats.byDept.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />Department Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.byDept.map(d => (
                  <div key={d.dept} className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setDeptFilter(d.dept === deptFilter ? "All" : d.dept)}>
                    <p className="text-xs text-muted-foreground">{d.dept}</p>
                    <p className="text-lg font-bold text-foreground mt-1">{d.count}</p>
                    <p className="text-xs text-muted-foreground">{d.count === 1 ? "member" : "members"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
