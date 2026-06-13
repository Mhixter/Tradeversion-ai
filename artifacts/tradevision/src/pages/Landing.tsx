import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  Diamond, TrendingUp, Bot, Shield, Zap, BarChart2, Users,
  ArrowRight, Check, Star, ChevronRight, Globe, Lock, Award,
  Play, CheckCircle2, LineChart, Cpu, Activity, Menu, X,
  ChevronDown, Twitter, Linkedin, MessageCircle, Youtube,
  BookOpen, Code2, HelpCircle, FileText, Briefcase, Building2,
  LayoutDashboard, Layers, GitBranch, FlaskConical, PieChart,
  Wifi, ShieldCheck, Rocket, AlertTriangle,
} from "lucide-react";

/* ── Announcement bar ──────────────────────────────────────────────────────── */
function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="relative bg-gradient-to-r from-primary via-violet-600 to-primary text-white text-xs font-semibold py-2.5 text-center px-8">
      <span className="flex items-center justify-center gap-2">
        <Rocket className="w-3.5 h-3.5 shrink-0" />
        New: Gold Hunter AI achieved <strong>+18.4% ROI</strong> this quarter · Connect your MT5 account in minutes.
        <a href="#" className="underline underline-offset-2 hover:opacity-80 ml-1">Learn more →</a>
      </span>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Dropdown menu ─────────────────────────────────────────────────────────── */
const NAV_MENUS = {
  Products: {
    cols: 2,
    items: [
      { icon: Bot,            label: "AI Trading Bots",     desc: "Automated 24/7 strategies",   href: "#" },
      { icon: Layers,         label: "Strategy Builder",    desc: "Visual node-based builder",    href: "#" },
      { icon: Users,          label: "Copy Trading",        desc: "Mirror top performers",        href: "#" },
      { icon: PieChart,       label: "Portfolio Analytics", desc: "Sharpe, Sortino & more",       href: "#" },
      { icon: ShieldCheck,    label: "Risk Center",         desc: "Real-time risk management",    href: "#" },
      { icon: FlaskConical,   label: "Backtesting",         desc: "Test on 10+ years of data",    href: "#" },
      { icon: Wifi,           label: "Broker Integrations", desc: "MT4, MT5 & 47+ brokers",       href: "#" },
      { icon: Cpu,            label: "Execution Engine",    desc: "Low-latency order routing",    href: "#" },
    ],
  },
  Solutions: {
    cols: 1,
    items: [
      { icon: TrendingUp,  label: "Retail Traders",    desc: "Start with $100, scale up", href: "#" },
      { icon: Briefcase,   label: "Pro Traders",       desc: "Advanced tools & APIs",     href: "#" },
      { icon: Building2,   label: "Prop Firms",        desc: "Manage funded accounts",    href: "#" },
      { icon: BarChart2,   label: "Fund Managers",     desc: "Multi-account & reporting", href: "#" },
      { icon: Users,       label: "Trading Teams",     desc: "Collaborate & share bots",  href: "#" },
      { icon: Globe,       label: "Institutions",      desc: "Enterprise & white-label",  href: "#" },
    ],
  },
  Marketplace: {
    cols: 1,
    items: [
      { icon: LayoutDashboard, label: "Browse Bots",       desc: "500+ bots to choose from", href: "#" },
      { icon: Award,           label: "Top Performers",    desc: "Best win-rate this month", href: "#" },
      { icon: TrendingUp,      label: "Forex Bots",        desc: "Major & exotic pairs",     href: "#" },
      { icon: Diamond,         label: "Gold Bots",         desc: "XAU/USD specialists",      href: "#" },
      { icon: Zap,             label: "Crypto Bots",       desc: "BTC, ETH & altcoins",      href: "#" },
      { icon: Rocket,          label: "Become a Creator",  desc: "Sell your strategies",     href: "#" },
    ],
  },
  Resources: {
    cols: 1,
    items: [
      { icon: FileText,    label: "Documentation",    desc: "Guides & references",      href: "#" },
      { icon: Code2,       label: "API Docs",         desc: "REST & WebSocket API",     href: "#" },
      { icon: HelpCircle,  label: "Help Center",      desc: "Browse FAQs & answers",    href: "/faq" },
      { icon: BookOpen,    label: "Trading Academy",  desc: "Free courses & tutorials", href: "#" },
      { icon: LineChart,   label: "Blog",             desc: "Market insights & news",   href: "/blog" },
      { icon: AlertTriangle, label: "FAQ",            desc: "Common questions",          href: "/faq" },
    ],
  },
};

function NavDropdown({ label, menu }: { label: string; menu: typeof NAV_MENUS.Products }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-1 group"
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className={`absolute top-full left-0 mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/30 p-4 z-50 ${menu.cols === 2 ? "grid grid-cols-2 gap-1 w-[480px]" : "flex flex-col gap-1 w-64"}`}
        >
          {menu.items.map(item => (
            <Link key={item.label} href={item.href}>
              <a className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Nav ───────────────────────────────────────────────────────────────────── */
function Nav({ onLogin }: { onLogin?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-background/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/landing">
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Diamond className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight">TradeVision AI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {(Object.entries(NAV_MENUS) as [string, typeof NAV_MENUS.Products][]).map(([key, menu]) => (
            <div key={key} className="px-2.5">
              <NavDropdown label={key} menu={menu} />
            </div>
          ))}
          <a href="#pricing" className="px-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <Link href="/contact" className="px-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </nav>

        {/* CTA buttons */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button onClick={onLogin} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors hover:bg-accent">
            Sign In
          </button>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 border border-border/60 rounded-xl transition-colors hover:border-primary/40">
            Book Demo
          </a>
          <button onClick={onLogin} className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-105">
            Start Free Trial
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/98 backdrop-blur-2xl px-4 py-5 flex flex-col gap-2 shadow-2xl">
          {["Features", "Pricing", "Blog", "FAQ", "Contact"].map(n => (
            <a key={n} href="#" className="text-sm text-muted-foreground hover:text-foreground py-2 border-b border-border/30">{n}</a>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            <button onClick={onLogin} className="w-full border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-accent transition-colors">Sign In</button>
            <button onClick={onLogin} className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Start Free Trial</button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
function Hero({ onLogin }: { onLogin?: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-bold mb-8 shadow-sm shadow-primary/10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Now with GPT-4 Signal Engine · 50,000+ active traders
          <ChevronRight className="w-3 h-3 opacity-60" />
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-black tracking-tight mb-6 leading-[0.93] text-balance">
          The AI Trading<br />
          <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">Platform for Pros</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
          Automate strategies, copy top traders, manage risk in real time, and connect all your brokers — with institutional-grade AI that works 24/7.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={onLogin} className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 border border-border bg-card/80 hover:bg-accent text-foreground text-base font-semibold px-8 py-4 rounded-2xl transition-all hover:border-primary/40">
            <Play className="w-4 h-4 text-primary fill-primary" />
            Watch Demo
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground mb-16">
          {["No credit card required", "Cancel anytime", "14-day free trial", "SOC2 compliant"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" />{t}</span>
          ))}
        </div>

        {/* Dashboard preview card */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/8 to-transparent rounded-3xl blur-2xl pointer-events-none" />
          <div className="relative border border-border/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-card/95 backdrop-blur">
            <div className="bg-accent/70 px-4 py-3 flex items-center gap-2 border-b border-border/50">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80" /><div className="w-3 h-3 rounded-full bg-amber-400/80" /><div className="w-3 h-3 rounded-full bg-green-400/80" /></div>
              <div className="flex-1 bg-background/50 rounded-md h-6 mx-4 flex items-center px-3 gap-2">
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="text-[11px] text-muted-foreground font-mono">app.tradevision.ai/dashboard</span>
              </div>
              <div className="flex gap-1.5">
                {["Live","Secure"].map(b => <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded bg-success/15 text-success border border-success/20">{b}</span>)}
              </div>
            </div>
            <div className="p-5 bg-card">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { l:"Total Equity", v:"$215,743", c:"text-foreground", ch:"+18.4%" },
                  { l:"Net Profit",   v:"+$29,344", c:"text-success",    ch:"+12.3%" },
                  { l:"Daily P&L",    v:"+$1,932",  c:"text-success",    ch:"+0.9%"  },
                  { l:"Avg Win Rate", v:"72.0%",    c:"text-primary",    ch:"+5.6%"  },
                ].map(s => (
                  <div key={s.l} className="bg-accent/40 rounded-xl p-3 border border-border/30">
                    <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wider">{s.l}</p>
                    <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                    <p className="text-[10px] text-success mt-0.5">{s.ch} ↑</p>
                  </div>
                ))}
              </div>
              <div className="bg-accent/20 rounded-xl border border-border/30 h-36 flex items-end gap-px p-3 overflow-hidden relative">
                <div className="absolute top-3 left-3 text-[9px] text-muted-foreground font-semibold">Equity Curve — Last 30d</div>
                {[52,55,51,58,63,60,67,65,71,69,75,72,78,74,80,77,83,80,86,84,89,86,91,88,93,90,95,92,97,100].map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${v}%`, background: i >= 25 ? "hsl(var(--primary))" : i >= 15 ? "hsl(var(--primary)/0.6)" : "hsl(var(--primary)/0.35)" }} />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { n:"Gold Hunter AI", p:"+$342", s:"RUNNING", c:"bg-success/15 text-success" },
                  { n:"AI Scalper Pro",  p:"+$128", s:"RUNNING", c:"bg-success/15 text-success" },
                  { n:"Oil Range Bot",   p:"-$85",  s:"ERROR",   c:"bg-destructive/15 text-destructive" },
                ].map(b => (
                  <div key={b.n} className="flex items-center justify-between bg-accent/30 rounded-lg px-3 py-2 border border-border/20">
                    <div><p className="text-[10px] font-bold">{b.n}</p><p className="text-[9px] text-muted-foreground">{b.s}</p></div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${b.c}`}>{b.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" style={{ top: "65%" }} />
        </div>
      </div>
    </section>
  );
}

/* ── Broker logos strip ─────────────────────────────────────────────────────── */
function BrokerPill({ name, domain, dot }: { name: string; domain: string; dot: string }) {
  const [imgOk, setImgOk] = React.useState(true);
  return (
    <div className="flex-shrink-0 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur mx-2 select-none" style={{ boxShadow:"0 1px 8px rgba(0,0,0,.18)" }}>
      {imgOk ? (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={name}
          onError={() => setImgOk(false)}
          className="w-5 h-5 rounded object-contain flex-shrink-0"
        />
      ) : (
        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: dot }} />
      )}
      <span className="text-xs font-bold whitespace-nowrap text-foreground">{name}</span>
    </div>
  );
}

const ROW1: { name: string; domain: string; dot: string }[] = [
  { name:"IC Markets",          domain:"icmarkets.com",          dot:"#e8372c" },
  { name:"Exness",              domain:"exness.com",             dot:"#ff6b00" },
  { name:"Binance",             domain:"binance.com",            dot:"#f0b90b" },
  { name:"Interactive Brokers", domain:"interactivebrokers.com", dot:"#e31837" },
  { name:"OANDA",               domain:"oanda.com",              dot:"#0073cf" },
  { name:"Pepperstone",         domain:"pepperstone.com",        dot:"#00a651" },
  { name:"XM",                  domain:"xm.com",                 dot:"#f5a623" },
  { name:"Deriv",               domain:"deriv.com",              dot:"#ff444f" },
  { name:"Alpaca",              domain:"alpaca.markets",         dot:"#ffb347" },
  { name:"Kraken",              domain:"kraken.com",             dot:"#5741d9" },
  { name:"IG Group",            domain:"ig.com",                 dot:"#0099cc" },
  { name:"FxPro",               domain:"fxpro.com",              dot:"#ff6600" },
  { name:"AvaTrade",            domain:"avatrade.com",           dot:"#4a90e2" },
  { name:"ThinkMarkets",        domain:"thinkmarkets.com",       dot:"#00b0f0" },
  { name:"Tickmill",            domain:"tickmill.com",           dot:"#d40000" },
  { name:"RoboForex",           domain:"roboforex.com",          dot:"#f4a21a" },
  { name:"OctaFX",              domain:"octafx.com",             dot:"#ff6600" },
  { name:"HotForex",            domain:"hotforex.com",           dot:"#f5a623" },
];

const ROW2: { name: string; domain: string; dot: string }[] = [
  { name:"Coinbase",            domain:"coinbase.com",           dot:"#0052ff" },
  { name:"ByBit",               domain:"bybit.com",              dot:"#f7a600" },
  { name:"OKX",                 domain:"okx.com",                dot:"#888888" },
  { name:"KuCoin",              domain:"kucoin.com",             dot:"#23af91" },
  { name:"Bitfinex",            domain:"bitfinex.com",           dot:"#16b157" },
  { name:"Huobi",               domain:"huobi.com",              dot:"#00a4c0" },
  { name:"Gate.io",             domain:"gate.io",                dot:"#e74c3c" },
  { name:"TradeStation",        domain:"tradestation.com",       dot:"#1a73e8" },
  { name:"TD Ameritrade",       domain:"tdameritrade.com",       dot:"#006b3f" },
  { name:"Charles Schwab",      domain:"schwab.com",             dot:"#00a0df" },
  { name:"Webull",              domain:"webull.com",             dot:"#48c4e6" },
  { name:"Vantage",             domain:"vantagemarkets.com",     dot:"#005bac" },
  { name:"Admirals",            domain:"admirals.com",           dot:"#e30613" },
  { name:"FXTM",                domain:"forextime.com",          dot:"#ff6d00" },
  { name:"FP Markets",          domain:"fpmarkets.com",          dot:"#00529b" },
  { name:"Eightcap",            domain:"eightcap.com",           dot:"#4a90e2" },
  { name:"TMGM",                domain:"tmgm.com",               dot:"#4a90e2" },
  { name:"Dukascopy",           domain:"dukascopy.com",          dot:"#e8372c" },
];

/* Keyframe injected once at module level */
const MARQUEE_CSS = `
@keyframes marquee-left  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
.marquee-left  { animation: marquee-left  28s linear infinite; }
.marquee-right { animation: marquee-right 32s linear infinite; }
.marquee-left:hover, .marquee-right:hover { animation-play-state: paused; }
`;

function BrokerStrip() {
  return (
    <section className="py-14 border-y border-border/40 bg-accent/10 overflow-hidden">
      <style>{MARQUEE_CSS}</style>
      <p className="text-center text-[11px] text-muted-foreground mb-8 uppercase tracking-[0.2em] font-semibold">
        Connected to 47+ leading brokers &amp; exchanges
      </p>

      {/* Row 1 — slides left */}
      <div className="relative mb-3" style={{ maskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)", WebkitMaskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)" }}>
        <div className="marquee-left flex w-max">
          {[...ROW1, ...ROW1].map((b, i) => <BrokerPill key={i} {...b} />)}
        </div>
      </div>

      {/* Row 2 — slides right */}
      <div className="relative" style={{ maskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)", WebkitMaskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)" }}>
        <div className="marquee-right flex w-max">
          {[...ROW2, ...ROW2].map((b, i) => <BrokerPill key={i} {...b} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Live performance ─────────────────────────────────────────────────────── */
function LivePerformance() {
  const bots = [
    { name:"Gold Hunter AI",    market:"XAUUSD · H1",  pnl:"+$6,840",  wr:"76.8%", status:"RUNNING", roi:"+22.1%" },
    { name:"AI Scalper Pro",    market:"EURUSD · M5",  pnl:"+$4,250",  wr:"82.4%", status:"RUNNING", roi:"+18.4%" },
    { name:"Crypto Wave AI",    market:"BTCUSD · H4",  pnl:"+$3,120",  wr:"79.3%", status:"RUNNING", roi:"+15.2%" },
    { name:"S&P 500 Scalper",   market:"SPX500 · M1",  pnl:"+$4,920",  wr:"69.4%", status:"RUNNING", roi:"+21.3%" },
    { name:"AI Momentum",       market:"NAS100 · H1",  pnl:"+$2,150",  wr:"81.1%", status:"RUNNING", roi:"+17.4%" },
  ];
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/30 bg-success/8 text-success text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live Bot Performance
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Real Results,<br /><span className="text-primary">Real Traders</span></h2>
        <p className="text-muted-foreground max-w-lg mx-auto">All P&L shown is from actual live accounts. No demo, no back-tests presented as live.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-accent/40 border-b border-border/40">
          {["Bot Name","Market","All-Time P&L","Win Rate","ROI"].map(h => <span key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>)}
        </div>
        {bots.map((b, i) => (
          <div key={i} className={`grid grid-cols-5 gap-4 px-5 py-4 items-center border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors ${i % 2 === 0 ? "" : "bg-accent/10"}`}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-bold">{b.name}</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{b.market}</span>
            <span className="text-sm font-black text-success">{b.pnl}</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden max-w-[80px]">
                <div className="h-full rounded-full bg-primary" style={{ width: b.wr }} />
              </div>
              <span className="text-sm font-bold">{b.wr}</span>
            </div>
            <span className="text-sm font-black text-primary">{b.roi}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features ──────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Cpu,        title:"AI Signal Engine",       desc:"GPT-4 powered signals with 94.7% accuracy, trained on 10+ years of market data across Forex, Crypto, and Commodities.",         color:"from-violet-500/15 to-primary/5",    ic:"text-violet-400" },
  { icon: Layers,     title:"Visual Strategy Builder",desc:"Drag-and-drop node editor to build, backtest and deploy strategies — no coding needed. 25+ technical indicator blocks included.", color:"from-blue-500/15 to-cyan-500/5",     ic:"text-blue-400"   },
  { icon: Users,      title:"1-Click Copy Trading",   desc:"Mirror verified top traders automatically with custom risk multipliers, stop-rules, and full position transparency.",            color:"from-emerald-500/15 to-green-500/5", ic:"text-emerald-400"},
  { icon: Shield,     title:"Risk Management",        desc:"Real-time drawdown limits, per-position VaR, exposure caps, and kill-switch across all connected broker accounts.",              color:"from-red-500/15 to-orange-500/5",    ic:"text-red-400"    },
  { icon: FlaskConical,title:"Backtesting Engine",    desc:"Walk-forward & Monte Carlo simulations on tick-level data. Optimize parameters across any date range with one click.",            color:"from-amber-500/15 to-yellow-500/5",  ic:"text-amber-400"  },
  { icon: Globe,      title:"Multi-Broker Connect",   desc:"Unified dashboard for all your accounts. MT4, MT5, Binance, Interactive Brokers, Alpaca, and 40+ more — live synced.",          color:"from-cyan-500/15 to-sky-500/5",      ic:"text-cyan-400"   },
];

function Features() {
  return (
    <section className="py-24 bg-accent/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
            <Zap className="w-3 h-3" />Everything you need
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Institutional Power,<br /><span className="text-primary">Zero Complexity</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">Everything hedge funds use — automated, simplified, and available worldwide from day one.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${f.color} p-7 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 cursor-default`}>
              <div className={`w-12 h-12 rounded-2xl bg-card/80 flex items-center justify-center mb-5 shadow-sm ${f.ic} group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className={`absolute -bottom-4 -right-4 w-28 h-28 rounded-full blur-3xl opacity-15 ${f.ic.replace("text-","bg-")}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats bar ─────────────────────────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-violet-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"28px 28px" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-white text-center">
          {[
            { v:"50,000+", l:"Active Traders",       sub:"worldwide" },
            { v:"$2.84B",  l:"Assets Under Management",sub:"live accounts" },
            { v:"94.7%",   l:"Signal Accuracy",      sub:"last 90 days" },
            { v:"47+",     l:"Supported Brokers",     sub:"MT4, MT5 & more" },
          ].map(s => (
            <div key={s.l}>
              <p className="text-3xl sm:text-5xl font-black mb-1">{s.v}</p>
              <p className="text-sm text-white/80 font-semibold">{s.l}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", icon: Globe,    title:"Connect Your Broker",    desc:"Link any MT4, MT5 or crypto exchange in under 60 seconds. Investor password only — we never touch your master password." },
    { n:"02", icon: Cpu,      title:"Configure Your Strategy",desc:"Choose from 150+ pre-built strategies or build your own with the visual drag-and-drop editor. No coding needed." },
    { n:"03", icon: Activity, title:"Let AI Handle the Rest", desc:"Your bots trade 24/7, our AI manages risk and sends real-time alerts. Full control, zero manual intervention required." },
  ];
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Up and Running in <span className="text-primary">3 Steps</span></h2>
          <p className="text-muted-foreground text-base">From zero to fully automated in under 10 minutes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/25 flex items-center justify-center shadow-xl shadow-primary/8 group-hover:bg-primary/15 group-hover:border-primary/40 transition-all">
                  <s.icon className="w-9 h-9 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-md">
                  {s.n.slice(-1)}
                </div>
              </div>
              <h3 className="text-base font-black mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ──────────────────────────────────────────────────────────── */
const DEFAULT_TESTIMONIALS = [
  { id:"1", name:"James K.",   role:"Prop Trader · London",       avatar:"https://i.pravatar.cc/200?img=11", rating:5, text:"TradeVision changed how I operate. My Gold Hunter bot hit +32% in the first quarter while I focused on strategy development. The risk management alone is worth the subscription." },
  { id:"2", name:"Maria S.",   role:"Retail Investor · New York",  avatar:"https://i.pravatar.cc/200?img=47", rating:5, text:"Copy Trading is unlike anything I've used. I've been mirroring the top-3 performers and averaging +18% monthly. The transparency of each trade is exceptional." },
  { id:"3", name:"David W.",   role:"Fund Manager · Hong Kong",    avatar:"https://i.pravatar.cc/200?img=12", rating:5, text:"Finally enterprise-grade tools that don't require a 10-person quant team. The multi-broker risk aggregation and portfolio analytics are on par with Bloomberg-level tools." },
  { id:"4", name:"Aisha R.",   role:"Algorithmic Trader · Dubai",  avatar:"https://i.pravatar.cc/200?img=45", rating:5, text:"The Strategy Builder is remarkable. I built, backtested, and deployed a complete MACD + Bollinger Band system in one afternoon — no code, just nodes." },
  { id:"5", name:"Lucas M.",   role:"Forex Trader · São Paulo",    avatar:"https://i.pravatar.cc/200?img=15", rating:5, text:"The MT5 integration is seamless. Connected my IC Markets account in 60 seconds. Bots have been running 24/7 for 3 months with zero intervention needed." },
  { id:"6", name:"Sophie L.",  role:"Investment Director · Paris", avatar:"https://i.pravatar.cc/200?img=49", rating:5, text:"We deployed TradeVision across our entire prop desk. The company admin portal and role management is exactly what institutional teams need." },
];

export const TV_TESTIMONIALS_KEY = "tv_testimonials";

function loadTestimonials() {
  try {
    const raw = localStorage.getItem(TV_TESTIMONIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TESTIMONIALS;
}

function Testimonials() {
  const [items, setItems] = React.useState(loadTestimonials);

  /* Re-sync if admin updated them while the tab was open */
  React.useEffect(() => {
    const handler = () => setItems(loadTestimonials());
    window.addEventListener("tv_testimonials_updated", handler);
    return () => window.removeEventListener("tv_testimonials_updated", handler);
  }, []);

  const featured = items[0];
  const rest     = items.slice(1);

  return (
    <section className="py-24 bg-accent/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 text-amber-400 text-xs font-semibold mb-4">
            <Star className="w-3 h-3 fill-amber-400" />Rated 4.9/5 across 2,400+ reviews
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Trusted by <span className="text-primary">50,000+ Traders</span></h2>
        </div>

        {/* Featured testimonial — horizontal, full-width */}
        {featured && (
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-violet-600/5 p-8 sm:p-10 mb-6 flex flex-col sm:flex-row items-center gap-8 shadow-2xl shadow-primary/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            {/* Large avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-primary/30 shadow-2xl shadow-primary/20 ring-4 ring-primary/10">
                <img src={featured.avatar} alt={featured.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/initials/svg?seed=${featured.name}`; }} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-5xl text-primary/30 font-serif leading-none mb-2 select-none">"</div>
              <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed mb-5 italic">
                {featured.text}
              </p>
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <div>
                  <p className="text-base font-black">{featured.name}</p>
                  <p className="text-xs text-muted-foreground">{featured.role}</p>
                </div>
                <div className="flex gap-0.5 ml-1">
                  {Array(featured.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of testimonials — grid with large avatars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(t => (
            <div key={t.id} className="group bg-card border border-border/50 rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
              {/* Large avatar at top */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-border group-hover:border-primary/40 transition-colors shadow-xl">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/initials/svg?seed=${t.name}`; }} />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                    <span className="text-[9px]">✓</span>
                  </div>
                </div>
                <p className="text-sm font-black">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
                <div className="flex gap-0.5 mt-2">
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
              </div>
              <div className="text-3xl text-primary/20 font-serif leading-none mb-2 select-none">"</div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────────────────────── */
const PLANS = [
  { name:"Starter",    price:"$49",  period:"/mo", badge:"",           desc:"For individual traders getting started with automation.",   popular:false, cta:"Start Free Trial",
    features:["3 Trading Bots","5 Active Strategies","Copy up to 3 Traders","Basic AI Signals","Email Support","1 Broker Connection"] },
  { name:"Professional",price:"$149", period:"/mo", badge:"Most Popular",desc:"For serious traders who demand institutional-grade tools.", popular:true,  cta:"Start Free Trial",
    features:["Unlimited Bots","Unlimited Strategies","Copy up to 20 Traders","GPT-4 AI Signals","Real-time Risk Dashboard","Priority 24/7 Support","Backtesting Suite","5 Broker Connections","Portfolio Analytics"] },
  { name:"Enterprise",  price:"Custom",period:"",   badge:"",           desc:"For firms, funds, and professional trading desks.",          popular:false, cta:"Contact Sales",
    features:["Everything in Pro","White-label Options","Company Role Management","Dedicated Account Manager","SLA Guarantee","Custom Integrations","Unlimited Brokers","On-premise Option","API Access"] },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
            <Shield className="w-3 h-3" />No hidden fees · Cancel anytime
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Simple, <span className="text-primary">Transparent</span> Pricing</h2>
          <p className="text-muted-foreground text-base">Start with a 14-day free trial on any plan. No credit card required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {PLANS.map(p => (
            <div key={p.name} className={`relative bg-card rounded-2xl border p-7 flex flex-col transition-all ${p.popular ? "border-primary shadow-2xl shadow-primary/15 ring-1 ring-primary/20 scale-[1.02]" : "border-border/60 hover:border-border hover:shadow-lg"}`}>
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-black tracking-wide shadow-lg shadow-primary/30">
                  {p.badge.toUpperCase()}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-black mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-muted-foreground mb-1 text-sm">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 ${p.popular ? "bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90" : "border border-border hover:border-primary/40 hover:bg-accent"}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ section ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q:"What brokers are supported?", a:"TradeVision connects to 47+ brokers including IC Markets, Exness, Deriv, Pepperstone, XM, OANDA, Interactive Brokers, Binance, Alpaca, and all MetaTrader 4/5 compatible platforms." },
  { q:"Is my money safe?", a:"Your funds remain with your connected third-party broker at all times. TradeVision never holds, moves, or has custody of your funds. We only use your investor (read-only) password for monitoring." },
  { q:"Do I need to code?", a:"No. The visual Strategy Builder lets you design, backtest, and deploy strategies using drag-and-drop nodes. For advanced users, we offer a full REST API and webhook system." },
  { q:"How does the free trial work?", a:"You get 14 days of full Professional plan access — no credit card required. After the trial, you can choose any plan or continue on the free Starter tier with limited bots." },
  { q:"Can I copy multiple traders at once?", a:"Yes. On the Pro plan you can copy up to 20 traders simultaneously with independent risk multipliers and stop-rules per trader." },
  { q:"What if a bot underperforms?", a:"You retain full control at all times. You can pause, stop, or close any bot position instantly from the dashboard. Our kill-switch can halt all activity across all brokers in one click." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 bg-accent/15 border-t border-border/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Frequently Asked <span className="text-primary">Questions</span></h2>
          <p className="text-muted-foreground">Can't find an answer? <Link href="/contact" className="text-primary hover:underline">Contact our team →</Link></p>
        </div>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className={`border border-border/50 rounded-2xl overflow-hidden transition-all ${open === i ? "bg-card border-primary/30 shadow-lg" : "bg-card/50 hover:border-border"}`}>
              <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm leading-snug">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? "rotate-180 text-primary" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">{f.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/faq" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold">View all FAQs <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer CTA ────────────────────────────────────────────────────────────── */
function FooterCTA({ onLogin }: { onLogin?: () => void }) {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-700 to-primary p-12 sm:p-16 text-center shadow-2xl shadow-primary/25">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"20px 20px" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-semibold mb-6">
            <Rocket className="w-3 h-3" />Ready to Automate Your Trading?
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Connect. Deploy.<br />Trade on Autopilot.</h2>
          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Join 50,000+ traders using TradeVision to automate their edge.<br />Start your 14-day free trial — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onLogin} className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl text-base shadow-xl hover:scale-105 transition-all">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/12 text-white font-semibold px-8 py-4 rounded-2xl text-base border border-white/20 hover:bg-white/20 transition-all">Book a Demo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  const SOCIAL = [
    { icon: Twitter,       label:"Twitter",  href:"#" },
    { icon: Linkedin,      label:"LinkedIn", href:"#" },
    { icon: MessageCircle, label:"Telegram", href:"#" },
    { icon: Youtube,       label:"YouTube",  href:"#" },
  ];
  const COLS = [
    { title:"Platform",    links:[{l:"Dashboard",href:"#"},{l:"AI Bots",href:"#"},{l:"Strategy Builder",href:"#"},{l:"Backtesting",href:"#"},{l:"Risk Center",href:"#"},{l:"Analytics",href:"#"}] },
    { title:"Marketplace", links:[{l:"Browse Bots",href:"#"},{l:"Top Strategies",href:"#"},{l:"Become a Creator",href:"#"},{l:"Copy Trading",href:"#"},{l:"Performance Rankings",href:"#"}] },
    { title:"Resources",   links:[{l:"Documentation",href:"#"},{l:"API Documentation",href:"#"},{l:"Help Center",href:"#"},{l:"FAQ",href:"/faq"},{l:"Blog",href:"/blog"},{l:"Market Reports",href:"#"}] },
    { title:"Company",     links:[{l:"About",href:"#"},{l:"Careers",href:"#"},{l:"Contact",href:"/contact"},{l:"Partners",href:"#"},{l:"Affiliates",href:"#"}] },
    { title:"Legal",       links:[{l:"Terms of Service",href:"#"},{l:"Privacy Policy",href:"#"},{l:"Cookie Policy",href:"#"},{l:"Risk Disclosure",href:"#"},{l:"Compliance",href:"#"}] },
  ];
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/25">
                <Diamond className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-sm">TradeVision AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">Institutional-grade AI trading automation for MT4 and MT5 traders worldwide.</p>
            <div className="flex gap-2">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} className="w-8 h-8 rounded-lg bg-accent border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors" title={s.label}>
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.l}>
                    <Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors leading-snug">{l.l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 TradeVision AI. All rights reserved.</p>
            <div className="flex gap-4">
              {["Privacy","Terms","Cookies"].map(l => <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>)}
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-accent/30 border border-border/30">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Risk Disclosure:</strong> TradeVision AI is a technology platform and is not a broker, investment advisor, or financial institution. Trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Funds remain with your connected third-party broker at all times. Please read our full Risk Disclosure before trading.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Main export ────────────────────────────────────────────────────────────── */
export default function Landing({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Nav onLogin={onLogin} />
      <main>
        <Hero onLogin={onLogin} />
        <BrokerStrip />
        <LivePerformance />
        <Features />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FooterCTA onLogin={onLogin} />
      </main>
      <Footer />
    </div>
  );
}
