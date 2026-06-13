import React from "react";
import { Diamond, TrendingUp, Shield, Zap, Bot, BarChart3, Users, Globe, Lock } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

export function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-primary/90 via-primary to-violet-700 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Diamond className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">TradeVision AI</span>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-5">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: "Active Traders", value: "12,400+" },
                { label: "Avg Win Rate", value: "68.4%" },
                { label: "Daily Volume", value: "$2.8B+" },
                { label: "Supported Brokers", value: "47+" },
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

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Diamond className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base">TradeVision AI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-foreground mb-1.5">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your trading dashboard</p>
          </div>

          {/* Social sign-in buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-sm font-semibold text-foreground shadow-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-sm font-semibold text-foreground shadow-sm"
            >
              <AppleIcon />
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground px-1">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email / password fields */}
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-accent border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <button className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-accent border border-border rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm mb-5"
          >
            <Zap className="w-4 h-4" />
            Sign In
          </button>

          <p className="text-center text-xs text-muted-foreground mb-8">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary font-semibold hover:underline">
              Create one free
            </a>
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
        </div>
      </div>
    </div>
  );
}
