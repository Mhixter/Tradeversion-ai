import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  GitBranch,
  Bot,
  Store,
  LineChart,
  Users,
  PieChart,
  ShieldAlert,
  Bell,
  Settings,
  Moon,
  Sun
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Strategy Builder", href: "/strategy-builder", icon: GitBranch },
    { name: "Bot Manager", href: "/bot-manager", icon: Bot },
    { name: "AI Marketplace", href: "/ai-marketplace", icon: Store },
    { name: "Backtesting", href: "/backtesting", icon: LineChart },
    { name: "Copy Trading", href: "/copy-trading", icon: Users },
    { name: "Portfolio", href: "/portfolio", icon: PieChart },
    { name: "Risk Center", href: "/risk-center", icon: ShieldAlert },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: 12 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-[135px] shrink-0 bg-sidebar border-r border-border flex flex-col h-full overflow-y-auto">
      <div className="p-4 flex items-center justify-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            TV
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                <div className="relative">
                  <item.icon className="w-6 h-6 mb-1" />
                  {item.badge && (
                    <div className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-center font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border flex flex-col gap-2">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 text-white">
          <p className="text-xs font-bold text-center mb-2">Pro Plan</p>
          <Button variant="secondary" size="sm" className="w-full text-xs h-7">Upgrade</Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-2">
          <Sun className="w-4 h-4 text-muted-foreground" />
          <div className="w-8 h-4 bg-muted rounded-full relative">
            <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
          </div>
          <Moon className="w-4 h-4 text-primary" />
        </div>

        <Link href="/account">
          <div className="flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-accent">
            <Avatar className="w-8 h-8 mb-1">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback>JT</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">John Trader</span>
            <span className="text-[10px] text-muted-foreground">PRO</span>
          </div>
        </Link>
      </div>
    </div>
  );
}