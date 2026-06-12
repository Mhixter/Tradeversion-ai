import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, GitBranch, Bot, Store, LineChart, Users,
  PieChart, ShieldAlert, Bell, Settings, Moon, Sun, X,
  Diamond, Building2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(true);

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
    { name: "Dashboard",       href: "/",              icon: LayoutDashboard },
    { name: "Strategy Buil…",  href: "/strategy-builder", icon: GitBranch   },
    { name: "Bot Manager",     href: "/bot-manager",   icon: Bot             },
    { name: "AI Marketplace",  href: "/ai-marketplace",icon: Store           },
    { name: "Backtesting",     href: "/backtesting",   icon: LineChart       },
    { name: "Copy Trading",    href: "/copy-trading",  icon: Users           },
    { name: "Portfolio",       href: "/portfolio",     icon: PieChart        },
    { name: "Risk Center",     href: "/risk-center",   icon: ShieldAlert     },
    { name: "Notifications",   href: "/notifications", icon: Bell, badge: 8  },
    { name: "Company",         href: "/company",       icon: Building2       },
    { name: "Settings",        href: "/settings",      icon: Settings        },
  ];

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
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
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
                  {item.badge && (
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
        {/* Upgrade box */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-3 text-white">
          <p className="text-[10px] font-bold mb-0.5">Upgrade Plan</p>
          <p className="text-[9px] text-white/70 mb-2 leading-tight">Unlock Advanced Portfolio Analytics</p>
          <Link href="/settings" onClick={onClose}>
            <Button variant="secondary" size="sm" className="w-full text-[10px] h-6 bg-white/20 hover:bg-white/30 text-white border-0">
              Upgrade Now
            </Button>
          </Link>
        </div>

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

        {/* User */}
        <Link href="/account" onClick={onClose}>
          <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback className="text-[10px]">JT</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate leading-tight">John Trader</p>
              <p className="text-[10px] text-primary font-semibold leading-tight">PRO</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
