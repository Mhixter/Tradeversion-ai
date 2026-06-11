import React from "react";
import { Search, Bell, Maximize } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNavbar({ title = "Dashboard", subtitle = "Overview" }: { title?: string, subtitle?: string }) {
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search symbols, bots, strategies..." 
            className="w-full bg-accent border-none text-sm rounded-md pl-9 pr-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full border border-border">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-xs font-medium text-foreground">3 Connected</span>
        </div>

        <div className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">8</span>
          </div>
        </div>

        <Maximize className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />

        <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">John Trader</p>
            <p className="text-xs text-primary font-medium leading-tight">Pro Plan</p>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
            <AvatarFallback>JT</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}