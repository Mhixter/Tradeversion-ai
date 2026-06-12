import React from "react";
import { Diamond, TrendingUp, Shield, Zap, Bot, BarChart3, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Diamond className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">TradeVision AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onLogin}>Sign In</Button>
          <Button size="sm" onClick={onLogin}>Get Started Free</Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 mb-6">
          <Zap className="w-3 h-3" />Enterprise AI Trading Platform
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground max-w-2xl leading-tight mb-4">
          Trade Smarter with{" "}
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Artificial Intelligence
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Automate your trading strategies with AI-powered bots, real-time risk management, and professional-grade execution across all major markets.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Button size="lg" className="px-8 text-base" onClick={onLogin}>
            <Zap className="w-4 h-4 mr-2" />Start 14-Day Free Trial
          </Button>
          <Button variant="outline" size="lg" className="px-8 text-base" onClick={onLogin}>
            View Live Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-2xl w-full">
          {[
            { label: "Active Traders", value: "12,400+" },
            { label: "Daily Volume", value: "$2.8B+" },
            { label: "Avg Bot Win Rate", value: "68.4%" },
            { label: "Supported Brokers", value: "47+" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-border bg-card text-center">
              <p className="text-xl font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {[
            { icon: Bot,       title: "AI Trading Bots",       desc: "Algorithmic strategies powered by GPT-4 and technical analysis" },
            { icon: Shield,    title: "Risk Management",        desc: "Real-time position monitoring with automated stop-loss execution" },
            { icon: Users,     title: "Copy Trading",           desc: "Mirror professional traders with one click and full transparency" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-border bg-card text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {[
            { icon: Shield, text: "256-bit SSL" },
            { icon: Globe, text: "FCA & SEC Compliant" },
            { icon: BarChart3, text: "Real-time Data" },
            { icon: TrendingUp, text: "99.9% Uptime SLA" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
