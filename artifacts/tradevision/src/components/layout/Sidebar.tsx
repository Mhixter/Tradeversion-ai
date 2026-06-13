import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, GitBranch, Bot, Store, LineChart, Users,
  PieChart, ShieldAlert, Bell, Settings, Moon, Sun, X,
  Diamond, Building2, CreditCard, Shield, LogOut, Crown, UserCog,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { useCompanyRole } from "@/hooks/useCompanyRole";

const ROLE_PILL: Record<string, string> = {
  owner:   "bg-purple-500/20 text-purple-400",
  admin:   "bg-red-500/20 text-red-400",
  manager: "bg-blue-500/20 text-blue-400",
  trader:  "bg-emerald-500/20 text-emerald-400",
  viewer:  "bg-gray-500/20 text-gray-400",
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(true);
  const { user, logout } = useAuth();
  const { role, canViewBilling, canManageMembers, canManageBots, canCreateStrategies, canManageRisk, inCompany } = useCompanyRole();

  useEffect(() => {
    const stored = localStorage.getItem("tv-theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tv-theme", next ? "dark" : "light");
  };

  const navItems = [
    { name: "Dashboard",       href: "/",                 icon: LayoutDashboard, show: true },
    { name: "Strategy Buil…",  href: "/strategy-builder", icon: GitBranch,       show: canCreateStrategies || !inCompany },
    { name: "Bot Manager",     href: "/bot-manager",      icon: Bot,             show: canManageBots || !inCompany },
    { name: "AI Marketplace",  href: "/ai-marketplace",   icon: Store,           show: true },
    { name: "Backtesting",     href: "/backtesting",      icon: LineChart,       show: true },
    { name: "Copy Trading",    href: "/copy-trading",     icon: Users,           show: true },
    { name: "Portfolio",       href: "/portfolio",        icon: PieChart,        show: true },
    { name: "Risk Center",     href: "/risk-center",      icon: ShieldAlert,     show: canManageRisk || !inCompany },
    { name: "Company",         href: "/company",          icon: Building2,       show: true },
    { name: "Notifications",   href: "/notifications",    icon: Bell,            show: true, badge: 8 },
    { name: "KYC",             href: "/kyc",              icon: Shield,          show: true },
    { name: "Billing",         href: "/billing",          icon: CreditCard,      show: canViewBilling || !inCompany },
    { name: "Team",            href: "/team-management",  icon: UserCog,         show: true },
    { name: "Settings",        href: "/settings",         icon: Settings,        show: true },
  ].filter(i => i.show);

  const initials = user
    ? `${(user.firstName?.[0] ?? "")}${(user.lastName?.[0] ?? "")}`.toUpperCase() || "U"
    : "U";
  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "User"
    : "User";

  return (
    <div className="w-[160px] shrink-0 bg-sidebar border-r border-border flex flex-col h-full overflow-y-auto overflow-x-hidden">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Diamond className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground truncate">TradeVision</span>
        </div>
        {onClose && (
          <button className="lg:hidden p-1 text-muted-foreground hover:text-foreground shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} onClick={onClose}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="relative shrink-0">
                  <item.icon className="w-4 h-4" />
                  {"badge" in item && item.badge && (
                    <div className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 border-t border-border flex flex-col gap-2 pt-2 shrink-0">
        {/* Admin Portal link */}
        <a
          href={`${import.meta.env.BASE_URL?.replace(/\/$/, "")}/company-admin`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors group"
        >
          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[10px] font-bold text-primary truncate">Admin Portal</span>
          <Crown className="w-3 h-3 text-amber-400 ml-auto shrink-0" />
        </a>

        {/* Upgrade box */}
        <Link href="/billing" onClick={onClose}>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-3 text-white cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-1 mb-0.5">
              <Crown className="w-3 h-3" />
              <p className="text-[10px] font-bold">Upgrade Plan</p>
            </div>
            <p className="text-[9px] text-white/70 mb-2 leading-tight">Unlock Advanced AI Trading</p>
            <div className="text-center py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold">
              View Plans
            </div>
          </div>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent transition-colors group"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Sun className={`w-3.5 h-3.5 transition-colors ${!isDark ? "text-amber-500" : "text-muted-foreground"}`} />
          <div className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? "bg-primary" : "bg-amber-400"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isDark ? "right-0.5" : "left-0.5"}`} />
          </div>
          <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-primary" : "text-muted-foreground"}`} />
        </button>

        {/* User + role badge */}
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate leading-tight">{displayName}</p>
            {role ? (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_PILL[role] ?? "bg-gray-500/20 text-gray-400"}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ) : (
              <p className="text-[10px] text-primary font-semibold leading-tight">PRO</p>
            )}
          </div>
          <button
            onClick={logout}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
