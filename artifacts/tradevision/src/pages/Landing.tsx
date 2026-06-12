import React, { useState } from "react";
import { Link } from "wouter";
import {
  Diamond, TrendingUp, Bot, Shield, Zap, BarChart2, Users,
  ArrowRight, Check, Star, ChevronRight, Globe, Lock, Award,
  Play, CheckCircle2, LineChart, Cpu, Activity, Menu, X,
} from "lucide-react";

/* ── Nav ─────────────────────────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Diamond className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold">TradeVision AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {["Features","Copy Trading","Pricing","About"].map(n => (
            <a key={n} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{n}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/"><button className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">Log in</button></Link>
          <Link href="/signup"><button className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">Get Started Free</button></Link>
        </div>

        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
          {["Features","Copy Trading","Pricing","About"].map(n => (
            <a key={n} href="#" className="text-sm text-muted-foreground hover:text-foreground py-1.5">{n}</a>
          ))}
          <Link href="/signup"><button className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-xl mt-2">Get Started Free</button></Link>
        </div>
      )}
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-purple-900/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6 shadow-lg">
          <Zap className="w-3 h-3" />
          AI-Powered Trading · Now with GPT-4 Signal Engine
          <ChevronRight className="w-3 h-3" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
          Trade Smarter<br />
          <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Not Harder
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          The enterprise AI trading platform that automates your strategies, copies top performers,
          and manages risk — all in real time. Join <strong className="text-foreground">50,000+</strong> traders already winning.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/signup">
            <button className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105">
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <Link href="/">
            <button className="inline-flex items-center gap-2 border border-border bg-card hover:bg-accent text-foreground text-base font-semibold px-8 py-4 rounded-2xl transition-all hover:border-primary/40">
              <Play className="w-4 h-4 text-primary" />
              Watch Demo
            </button>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs text-muted-foreground mb-16">
          {["No credit card required","Cancel anytime","14-day free trial","SOC2 compliant"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" />{t}</span>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" style={{ top: "60%" }} />
          <div className="relative border border-border/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 bg-card">
            {/* Fake browser chrome */}
            <div className="bg-accent/60 px-4 py-3 flex items-center gap-2 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-background/60 rounded-md h-5 mx-2 flex items-center px-3">
                <span className="text-[10px] text-muted-foreground">app.tradevision.ai/dashboard</span>
              </div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-6 bg-card">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { l:"Total Equity", v:"$215,743", c:"text-foreground" },
                  { l:"Net Profit",   v:"+$33,743", c:"text-success"    },
                  { l:"Daily P&L",    v:"+$1,245",  c:"text-success"    },
                  { l:"Win Rate",     v:"68.4%",    c:"text-primary"    },
                ].map(s => (
                  <div key={s.l} className="bg-accent/40 rounded-xl p-3 border border-border/30">
                    <p className="text-[9px] text-muted-foreground mb-1">{s.l}</p>
                    <p className={`text-base font-black ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart */}
              <div className="bg-accent/20 rounded-xl border border-border/30 h-40 flex items-end gap-0.5 p-3 overflow-hidden">
                {[65,72,68,80,76,85,79,88,82,91,87,95,89,97,93,99,94,100,96,98].map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${v}%`, background: i > 15 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Logos strip ─────────────────────────────────────────────────────────── */
function LogoStrip() {
  const brokers = ["Interactive Brokers","TD Ameritrade","OANDA","Binance","Alpaca","TradeStation","MetaTrader 5","Kraken"];
  return (
    <section className="py-12 border-y border-border/50 bg-accent/20">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-widest font-semibold">Trusted by traders at</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {brokers.map(b => (
            <div key={b} className="px-4 py-2 rounded-xl border border-border/40 bg-card/50 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">{b}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Cpu,      title: "AI Signal Engine",      desc: "GPT-4 powered signals with 94.7% accuracy, trained on 10 years of market data.", color: "from-violet-600/20 to-primary/5", ic: "text-primary"   },
  { icon: Users,    title: "1-Click Copy Trading",  desc: "Mirror verified top traders automatically with custom risk limits and stop rules.", color: "from-emerald-600/20 to-green-600/5", ic: "text-success" },
  { icon: Bot,      title: "Automated Bots",        desc: "24/7 trading bots across Forex, Crypto, and Commodities with no coding required.", color: "from-blue-600/20 to-cyan-600/5", ic: "text-blue-400"   },
  { icon: Shield,   title: "Risk Management",       desc: "Real-time drawdown limits, position sizing, and cross-account risk aggregation.", color: "from-red-600/20 to-orange-600/5",ic: "text-red-400"    },
  { icon: BarChart2,title: "Portfolio Analytics",   desc: "Candlestick charts, Sharpe ratio, correlation matrix, and allocation reports.", color: "from-amber-600/20 to-yellow-600/5",ic: "text-amber-400" },
  { icon: Globe,    title: "Multi-Broker Support",  desc: "Connect all your brokers in one place — IB, OANDA, Binance, Alpaca, and 40+ more.", color: "from-cyan-600/20 to-sky-600/5", ic: "text-cyan-400"  },
];

function Features() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
          <Zap className="w-3 h-3" />Everything you need
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Institutional Power,<br /><span className="text-primary">Trader-Friendly UX</span></h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-base">Everything hedge funds use — automated, simplified, and available for individual traders worldwide.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(f => (
          <div key={f.title} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${f.color} p-6 hover:border-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-xl`}>
            <div className={`w-12 h-12 rounded-2xl bg-card/80 flex items-center justify-center mb-4 shadow-sm ${f.ic}`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 ${f.ic.replace("text-","bg-")}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Stats ───────────────────────────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-violet-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-white text-center">
          {[
            { v:"50,000+", l:"Active Traders"    },
            { v:"$2.84B",  l:"Assets Under Mgmt" },
            { v:"94.7%",   l:"Signal Accuracy"   },
            { v:"150+",    l:"Supported Brokers"  },
          ].map(s => (
            <div key={s.l}>
              <p className="text-3xl sm:text-5xl font-black mb-1">{s.v}</p>
              <p className="text-sm text-white/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", icon: Globe,   title:"Connect Your Broker",    desc:"Link any broker in under 60 seconds using our secure OAuth integration. No API key required for most platforms." },
    { n:"02", icon: Cpu,     title:"Configure Your Strategy", desc:"Choose from 150+ pre-built strategies or build your own in the visual Strategy Builder — no coding needed." },
    { n:"03", icon: Activity, title:"Let AI Handle the Rest",  desc:"Your bots trade 24/7 while our AI monitors risk, adjusts positions, and sends you real-time alerts." },
  ];
  return (
    <section className="py-24 bg-accent/20 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Up and Running in <span className="text-primary">3 Steps</span></h2>
          <p className="text-muted-foreground text-base">From zero to fully automated in less than 10 minutes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {s.n.slice(-1)}
                </div>
              </div>
              <h3 className="text-base font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name:"James K.",   role:"Prop Trader, London",      avatar:"https://i.pravatar.cc/150?u=t1", rating:5, text:"TradeVision completely changed how I trade. My AI bot generated +32% in the first month while I focused on analysis." },
  { name:"Maria S.",   role:"Retail Investor, NY",      avatar:"https://i.pravatar.cc/150?u=t2", rating:5, text:"The Copy Trading feature is incredible — I've been mirroring top traders and averaging +18% monthly with zero effort." },
  { name:"David W.",   role:"Hedge Fund Manager, HK",   avatar:"https://i.pravatar.cc/150?u=t3", rating:5, text:"Finally an enterprise-grade platform that doesn't require a team of quants. The risk management tools alone are worth it." },
];

function Testimonials() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Loved by <span className="text-primary">50,000+ Traders</span></h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {TESTIMONIALS.map(t => (
          <div key={t.name} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors hover:shadow-xl">
            <div className="flex mb-3">
              {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────────────────────── */
const PLANS = [
  { name:"Starter", price:"$49", period:"/mo", desc:"Perfect for individual traders getting started.", color:"border-border",
    features:["3 Trading Bots","5 Active Strategies","Copy up to 3 Traders","Basic AI Signals","Email Support"] },
  { name:"Pro", price:"$149", period:"/mo", desc:"For serious traders who demand more power.", color:"border-primary ring-2 ring-primary/20", popular:true,
    features:["Unlimited Bots","Unlimited Strategies","Copy up to 20 Traders","Advanced AI Signals + GPT-4","Real-time Risk Dashboard","Priority Support","Backtesting Suite"] },
  { name:"Enterprise", price:"Custom", period:"", desc:"For firms, funds, and professional desks.", color:"border-border",
    features:["Everything in Pro","White-label Options","Company Role Management","Dedicated Account Manager","SLA Guarantee","Custom Integrations","On-premise Deployment"] },
];

function Pricing() {
  return (
    <section className="py-24 bg-accent/20 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Simple <span className="text-primary">Transparent</span> Pricing</h2>
          <p className="text-muted-foreground text-base">Start free, scale as you grow. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`relative bg-card rounded-2xl border p-6 flex flex-col ${p.color}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black tracking-wide shadow-lg">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-black">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">{p.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-muted-foreground mb-1 text-sm">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 ${p.popular ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90" : "border border-border hover:border-primary/40 hover:bg-accent"}`}>
                  {p.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer CTA ──────────────────────────────────────────────────────────── */
function FooterCTA() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-700 p-12 shadow-2xl shadow-primary/30">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Ready to Trade Smarter?</h2>
          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">Join 50,000+ traders automating their edge. Start your 14-day free trial — no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl text-base shadow-xl hover:scale-105 transition-all">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/">
              <button className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-8 py-4 rounded-2xl text-base border border-white/20 hover:bg-white/20 transition-all">
                <Play className="w-4 h-4" />Watch Demo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Diamond className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">TradeVision AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Enterprise AI trading automation for traders worldwide.</p>
          </div>
          {[
            { title:"Product",  links:["Features","Pricing","Changelog","Roadmap"]     },
            { title:"Platform", links:["Bots","Copy Trading","Strategy Builder","API"] },
            { title:"Company",  links:["About","Blog","Careers","Press"]              },
            { title:"Legal",    links:["Privacy","Terms","Security","Compliance"]     },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 TradeVision AI. All rights reserved.</span>
          <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" />SOC2 Type II · ISO 27001 · FCA Regulated</div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FooterCTA />
      <Footer />
    </div>
  );
}
