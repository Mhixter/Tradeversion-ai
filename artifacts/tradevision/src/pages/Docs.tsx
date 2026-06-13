import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Diamond, Search, BookOpen, Code2, Zap, Bot, TrendingUp, Shield, BarChart2, Copy, ChevronRight, ArrowRight, Terminal, Globe } from "lucide-react";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <Diamond className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-sm">TradeVision AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground transition-colors">Platform Docs</Link>
          <Link href="/api-docs" className="hover:text-foreground transition-colors">API Reference</Link>
          <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
        </nav>
        <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
      </div>
    </header>
  );
}

const PLATFORM_SECTIONS = [
  {
    icon: Zap, title: "Getting Started", color: "text-emerald-400 bg-emerald-400/10",
    articles: ["Quick Start Guide", "Connect Your First Broker", "Deploy Your First Bot", "Understanding the Dashboard", "Account & Billing Setup"],
  },
  {
    icon: Bot, title: "AI Trading Bots", color: "text-primary bg-primary/10",
    articles: ["Bot Types Overview", "Creating a Custom Bot", "Bot Parameters Explained", "Start / Stop / Pause Bots", "Bot Performance Analytics", "Risk Limits per Bot"],
  },
  {
    icon: TrendingUp, title: "Strategy Builder", color: "text-violet-400 bg-violet-400/10",
    articles: ["Visual Node Editor", "Technical Indicators Library", "Entry & Exit Conditions", "Position Sizing Rules", "Backtesting Your Strategy", "Exporting to Live"],
  },
  {
    icon: Shield, title: "Risk Management", color: "text-amber-400 bg-amber-400/10",
    articles: ["Portfolio-level Risk Limits", "Per-bot Drawdown Settings", "Real-time Margin Monitoring", "Auto-pause on Loss Threshold", "Cross-broker Risk Aggregation"],
  },
  {
    icon: BarChart2, title: "Analytics", color: "text-cyan-400 bg-cyan-400/10",
    articles: ["Equity Curve Analysis", "Trade Attribution", "Sharpe & Sortino Ratios", "Correlation Matrix", "Exporting Reports (CSV/PDF)"],
  },
  {
    icon: Globe, title: "Broker Connections", color: "text-rose-400 bg-rose-400/10",
    articles: ["Supported Brokers List", "MT4 Integration Guide", "MT5 Integration Guide", "Crypto Exchange Setup", "Multi-account Management"],
  },
];

const API_ENDPOINTS = [
  { method: "GET",    path: "/api/bots",                   desc: "List all trading bots" },
  { method: "POST",   path: "/api/bots",                   desc: "Create a new bot" },
  { method: "PUT",    path: "/api/bots/:id/start",         desc: "Start a bot" },
  { method: "PUT",    path: "/api/bots/:id/stop",          desc: "Stop a bot" },
  { method: "GET",    path: "/api/portfolio/summary",      desc: "Portfolio overview" },
  { method: "GET",    path: "/api/portfolio/equity-curve", desc: "Equity curve data" },
  { method: "GET",    path: "/api/strategies",             desc: "List all strategies" },
  { method: "POST",   path: "/api/strategies",             desc: "Create a strategy" },
  { method: "GET",    path: "/api/signals/latest",         desc: "Latest AI signals" },
  { method: "GET",    path: "/api/risk/exposure",          desc: "Current risk exposure" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  POST: "text-primary bg-primary/10 border-primary/20",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DELETE: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function Docs() {
  const [location] = useLocation();
  const isApi = location === "/api-docs";
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const EXAMPLE = `curl -X GET https://api.tradevision.ai/v1/bots \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

  function copyCode() {
    navigator.clipboard.writeText(EXAMPLE).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-16 text-center bg-accent/10 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isApi ? <Code2 className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-primary" />}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4">
            {isApi ? "API Reference" : "Documentation"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isApi
              ? "Full REST API reference for TradeVision AI. Automate anything, integrate everything."
              : "Everything you need to get the most out of TradeVision AI."}
          </p>
          {!isApi && (
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          )}
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/docs" className={`text-sm px-4 py-2 rounded-lg font-semibold transition-colors ${!isApi ? "bg-primary text-white" : "border border-border/60 text-muted-foreground hover:text-foreground"}`}>Platform Docs</Link>
            <Link href="/api-docs" className={`text-sm px-4 py-2 rounded-lg font-semibold transition-colors ${isApi ? "bg-primary text-white" : "border border-border/60 text-muted-foreground hover:text-foreground"}`}>API Reference</Link>
          </div>
        </div>
      </section>

      {!isApi ? (
        /* Platform Docs */
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM_SECTIONS
              .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.articles.some(a => a.toLowerCase().includes(search.toLowerCase())))
              .map(s => (
              <div key={s.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-black mb-4">{s.title}</h3>
                <ul className="space-y-2">
                  {s.articles.map(a => (
                    <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                      <ChevronRight className="w-3 h-3 shrink-0 group-hover:text-primary transition-colors" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "5-minute quickstart", desc: "From signup to your first live bot in under 5 minutes.", href: "/signup" },
              { icon: Terminal, title: "API Playground", desc: "Test API endpoints in your browser with live data.", href: "/api-docs" },
              { icon: Shield, title: "Security Guide", desc: "Best practices for securing your API keys and bot config.", href: "/help" },
            ].map(q => (
              <Link key={q.title} href={q.href} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-3 hover:border-primary/30 transition-colors group">
                <q.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">{q.title} <ArrowRight className="w-3 h-3 inline" /></p>
                  <p className="text-xs text-muted-foreground mt-1">{q.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        /* API Reference */
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Auth */}
          <div className="mb-10">
            <h2 className="text-xl font-black mb-4">Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">All API requests require a Bearer token in the Authorization header. Generate your API key in Settings → API.</p>
            <div className="relative bg-[#0d1117] border border-border/60 rounded-xl p-4 font-mono text-sm text-emerald-400">
              <button onClick={copyCode} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-accent border border-border/50 hover:bg-primary/10 transition-colors">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {copied && <span className="absolute top-2 right-12 text-[10px] text-emerald-400 bg-card px-2 py-1 rounded border border-border">Copied!</span>}
              <pre className="whitespace-pre-wrap text-xs leading-relaxed">{EXAMPLE}</pre>
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <h2 className="text-xl font-black mb-4">Endpoints</h2>
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="border-b border-border/50 bg-accent/30 px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Base URL: https://api.tradevision.ai/v1</div>
              {API_ENDPOINTS.map((e, i) => (
                <div key={e.path} className={`flex items-center gap-4 px-5 py-4 ${i < API_ENDPOINTS.length - 1 ? "border-b border-border/30" : ""} hover:bg-accent/10 transition-colors`}>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border ${METHOD_COLORS[e.method]} shrink-0 w-14 text-center`}>{e.method}</span>
                  <code className="text-sm font-mono text-foreground flex-1">{e.path}</code>
                  <span className="text-xs text-muted-foreground hidden sm:block">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SDKs */}
          <div className="mt-10">
            <h2 className="text-xl font-black mb-4">SDKs & Libraries</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { lang: "Node.js",  badge: "Official", color: "text-emerald-400", pkg: "npm i @tradevision/sdk" },
                { lang: "Python",   badge: "Official", color: "text-primary",     pkg: "pip install tradevision" },
                { lang: "Go",       badge: "Community", color: "text-cyan-400",   pkg: "go get tradevision/go-sdk" },
                { lang: "Rust",     badge: "Community", color: "text-amber-400",  pkg: "cargo add tradevision" },
              ].map(s => (
                <div key={s.lang} className="bg-card border border-border/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-black ${s.color}`}>{s.lang}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${s.badge === "Official" ? "bg-primary/10 text-primary border-primary/20" : "bg-accent text-muted-foreground border-border/50"}`}>{s.badge}</span>
                  </div>
                  <code className="text-[11px] text-muted-foreground">{s.pkg}</code>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
