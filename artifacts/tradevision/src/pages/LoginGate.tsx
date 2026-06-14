import React from "react";
import {
  Shield, Zap, BarChart3, Bot, Users, Globe,
  TrendingUp, Activity, CheckCircle2,
} from "lucide-react";
import { LogoIcon } from "@/components/Logo";

export function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-primary/90 via-primary to-emerald-700 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <LogoIcon size={36} />
          <span className="text-white font-black text-lg tracking-tight">TradeVision AI</span>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-5">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: "Active Traders", value: "12,400+" },
                { label: "Avg Win Rate",   value: "68.4%"  },
                { label: "Daily Volume",   value: "$2.8B+" },
                { label: "Supported Brokers", value: "47+"  },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-white font-black text-xl">{s.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mini equity chart */}
            <div className="h-14 flex items-end gap-px">
              {[42,45,43,50,55,52,60,58,65,63,70,67,74,71,78,75,82,79,86,83,89,86,92,89,95,91,97,93,98,100].map((v, i) => (
                <div key={i} className="flex-1 rounded-sm bg-white/30" style={{ height: `${v}%`, opacity: i > 20 ? 1 : 0.5 + i * 0.02 }} />
              ))}
            </div>
            <p className="text-white/50 text-[10px] mt-2">Portfolio equity curve · last 30 days</p>
          </div>

          {[
            { icon: Shield,    text: "256-bit SSL encryption" },
            { icon: Globe,     text: "FCA & SEC compliant platform" },
            { icon: BarChart3, text: "Real-time market data feeds" },
            { icon: Bot,       text: "GPT-4 powered trading signals" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              {text}
            </div>
          ))}
        </div>

        <p className="text-white/40 text-xs relative z-10">© 2025 TradeVision AI. All rights reserved.</p>
      </div>

      {/* Right — sign in */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <LogoIcon size={32} />
          <span className="font-black text-base">TradeVision AI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-5">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2">Welcome to TradeVision AI</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to access your AI-powered trading dashboard, bots, and portfolio analytics.
            </p>
          </div>

          {/* Single sign-in CTA */}
          <button
            onClick={onLogin}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm mb-4"
          >
            <Zap className="w-4 h-4" />
            Sign In / Create Account
          </button>

          <p className="text-center text-xs text-muted-foreground mb-8">
            Free 14-day trial · No credit card required
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Shield,    text: "256-bit encryption" },
              { icon: Users,     text: "50,000+ traders" },
              { icon: TrendingUp,text: "99.9% uptime SLA" },
              { icon: Globe,     text: "FCA & SEC compliant" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/50 border border-border/40">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            {["No credit card required", "Cancel anytime", "SOC2 compliant"].map(t => (
              <span key={t} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" />{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
