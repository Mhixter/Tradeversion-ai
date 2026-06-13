import React from "react";
import { Link } from "wouter";
import { Diamond, Globe, Users, TrendingUp, Shield, Zap, ArrowRight, Award, BarChart2, Clock } from "lucide-react";

function Nav({ onLogin }: { onLogin?: () => void }) {
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
          <Link href="/landing" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {onLogin && <button onClick={onLogin} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</button>}
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}

const STATS = [
  { value: "50,000+", label: "Active Traders", icon: Users },
  { value: "$2.1B+",  label: "Volume Managed", icon: TrendingUp },
  { value: "36",      label: "Broker Integrations", icon: Globe },
  { value: "99.9%",   label: "Platform Uptime", icon: Shield },
];

const TEAM = [
  { name: "Alex Mercer",    title: "CEO & Co-Founder",      img: "https://i.pravatar.cc/200?img=8",  bio: "Former quantitative analyst at Goldman Sachs with 15 years in algorithmic trading." },
  { name: "Priya Sharma",   title: "CTO & Co-Founder",      img: "https://i.pravatar.cc/200?img=44", bio: "Ex-Google engineer who built trading infrastructure for hedge funds across Asia." },
  { name: "Marcus Cole",    title: "Chief Risk Officer",    img: "https://i.pravatar.cc/200?img=13", bio: "20 years of risk management experience at leading European investment banks." },
  { name: "Elena Vasquez",  title: "Head of Product",       img: "https://i.pravatar.cc/200?img=48", bio: "Previously led product at Robinhood and Interactive Brokers platform division." },
  { name: "James Okafor",   title: "VP Engineering",        img: "https://i.pravatar.cc/200?img=18", bio: "Distributed systems expert, built real-time data pipelines processing 10M events/sec." },
  { name: "Yuki Tanaka",    title: "Head of AI Research",   img: "https://i.pravatar.cc/200?img=53", bio: "PhD in Machine Learning (MIT), specialized in financial time-series forecasting." },
];

const TIMELINE = [
  { year: "2019", title: "Founded in London", desc: "TradeVision was started by two quants frustrated with the lack of accessible institutional-grade tools." },
  { year: "2020", title: "First 1,000 traders", desc: "Beta launch attracted early adopters from the MT4/MT5 community. Seed round closed at $2.5M." },
  { year: "2021", title: "Series A — $18M", desc: "Expanded broker integrations to 20+, launched AI Signal Engine, and opened Singapore office." },
  { year: "2022", title: "50 broker connections", desc: "Became the largest multi-broker AI platform. Crossed $500M in monthly trading volume." },
  { year: "2023", title: "Copy Trading launch", desc: "Introduced performance rankings and copy trading, attracting retail investors at scale." },
  { year: "2024", title: "Enterprise & GPT-4", desc: "Launched company admin portal, GPT-4 signal engine, and institutional API. Crossed 40,000 users." },
  { year: "2025", title: "50,000 traders worldwide", desc: "Now supporting traders in 80+ countries with 36 live broker integrations and $2B+ monthly volume." },
];

const VALUES = [
  { icon: Shield,    title: "Transparency First",    desc: "Every trade, signal, and fee is fully visible. No hidden logic, no black boxes." },
  { icon: Zap,       title: "Speed & Reliability",   desc: "Sub-millisecond execution on co-located servers. 99.9% uptime SLA." },
  { icon: Users,     title: "Trader-Led Design",     desc: "Every feature is built with active traders, for active traders. We use our own platform." },
  { icon: Award,     title: "Institutional Quality", desc: "Bloomberg-grade analytics accessible to every retail trader, not just quant desks." },
];

export default function About({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onLogin={onLogin} />

      {/* Hero */}
      <section className="py-20 sm:py-28 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-6">
          <Globe className="w-3 h-3" />Serving traders in 80+ countries
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
          Built by traders,<br /><span className="text-primary">for traders</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          TradeVision AI was born from a simple frustration: institutional-grade trading tools were locked behind million-dollar quant desks. We changed that.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          Start Trading Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-accent/10 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-3xl font-black mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-6">Our Mission</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-6">
          To democratize algorithmic trading by giving every trader — from retail to institutional — access to the same AI-powered tools that move markets.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We believe that better tools create better traders. When a prop trader in London, a retail investor in New York, and a fund manager in Hong Kong all have access to the same institutional infrastructure, markets become fairer and more efficient for everyone.
        </p>
      </section>

      {/* Values */}
      <section className="py-16 bg-accent/10 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-border/60" />
          <div className="space-y-8">
            {TIMELINE.map(e => (
              <div key={e.year} className="flex gap-6">
                <div className="shrink-0 w-[72px] text-right">
                  <span className="text-xs font-black text-primary">{e.year}</span>
                </div>
                <div className="relative pl-6 pb-2">
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background -translate-x-[calc(50%+0.5px)]" />
                  <h3 className="font-bold text-sm mb-1">{e.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-accent/10 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">Leadership Team</h2>
          <p className="text-muted-foreground text-center mb-12">Experienced leaders from Goldman Sachs, Google, Robinhood, and top hedge funds.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-card border border-border/50 rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
                <img src={m.img} alt={m.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border-2 border-border" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div>
                  <p className="font-black text-sm">{m.name}</p>
                  <p className="text-[11px] text-primary mb-2">{m.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-black mb-3">Global Offices</h2>
        <p className="text-muted-foreground mb-10">We operate across major financial hubs to serve traders in every timezone.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { city:"London",     country:"United Kingdom", flag:"🇬🇧", note:"HQ" },
            { city:"New York",   country:"United States",  flag:"🇺🇸", note:"Americas" },
            { city:"Singapore",  country:"Singapore",      flag:"🇸🇬", note:"Asia-Pacific" },
            { city:"Dubai",      country:"UAE",            flag:"🇦🇪", note:"MENA" },
          ].map(o => (
            <div key={o.city} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors">
              <div className="text-3xl mb-3">{o.flag}</div>
              <p className="font-bold text-sm">{o.city}</p>
              <p className="text-[11px] text-muted-foreground">{o.country}</p>
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">{o.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-border/40 bg-accent/10">
        <h2 className="text-3xl font-black mb-4">Ready to join 50,000+ traders?</h2>
        <p className="text-muted-foreground mb-8">Start your free 14-day trial. No credit card required.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/signup" className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">Start Free Trial</Link>
          <Link href="/contact" className="px-6 py-3 rounded-xl border border-border/60 font-semibold text-sm hover:border-primary/40 transition-colors">Contact Sales</Link>
        </div>
      </section>

      {/* Mini footer */}
      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
