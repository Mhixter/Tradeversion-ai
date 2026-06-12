import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Home, ArrowLeft, BarChart2, Bot, TrendingUp,
  Search, Zap, AlertTriangle,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Dashboard",       href: "/",              icon: Home       },
  { label: "Bot Manager",     href: "/bot-manager",   icon: Bot        },
  { label: "Copy Trading",    href: "/copy-trading",  icon: TrendingUp },
  { label: "AI Marketplace",  href: "/ai-marketplace",icon: Zap        },
];

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 overflow-hidden relative">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-600/4 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Glowing 404 numeral */}
        <div className="relative mb-6 select-none">
          <p
            className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 40%, #a855f7 80%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 60px rgba(139,92,246,0.4))",
            }}
          >
            404
          </p>
          {/* Floating icon in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-2xl flex items-center justify-center mt-2">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
          The route you're looking for doesn't exist or has been moved.
          Head back to the trading floor — your bots are waiting.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full max-w-xs">
          <Button
            className="flex-1 h-11 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25"
            onClick={() => setLocation("/")}
          >
            <Home className="w-4 h-4 mr-2" />Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 font-semibold border-border hover:border-primary/50 hover:bg-primary/5"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />Go Back
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-sm mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-widest">Quick links</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick link grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <button
              key={href}
              onClick={() => setLocation(href)}
              className="group flex items-center gap-2.5 px-4 py-3 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-10 text-[11px] text-muted-foreground/40 tracking-wide">
          TradeVision AI · Enterprise Trading Platform
        </p>
      </div>
    </div>
  );
}
