import React from "react";
import { Search, Bell, Maximize, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export function TopNavbar({
  title = "Dashboard",
  subtitle = "Overview",
  onMenuClick,
}: {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}) {
  return (
    <div className="h-14 sm:h-16 border-b border-border bg-background flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search — hidden on small mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search symbols, bots, strategies..."
            className="w-48 lg:w-64 bg-accent border-none text-sm rounded-md pl-9 pr-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="input-search"
          />
        </div>

        {/* Brokers pill — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full border border-border">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-xs font-medium text-foreground">3 Connected</span>
        </div>

        {/* Bell */}
        <Link href="/notifications">
          <div className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors" data-testid="link-notifications">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">8</span>
            </div>
          </div>
        </Link>

        <Maximize className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors hidden sm:block" />

        {/* User */}
        <Link href="/account">
          <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer" data-testid="link-account">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-foreground leading-tight">John Trader</p>
              <p className="text-xs text-primary font-medium leading-tight">Pro Plan</p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback>JT</AvatarFallback>
            </Avatar>
          </div>
        </Link>
      </div>
    </div>
  );
}
