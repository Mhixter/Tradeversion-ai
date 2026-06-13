import React, { useState } from "react";
import { Link } from "wouter";
import { Diamond, Download, TrendingUp, BarChart2, Globe, Search, Calendar, FileText, ArrowRight, Mail } from "lucide-react";

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
        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}

const REPORTS = [
  {
    tag: "QUARTERLY",    tagColor: "text-primary bg-primary/10 border-primary/20",
    title: "AI Trading Trends Q1 2026",
    summary: "Comprehensive analysis of AI-driven trading volumes, top-performing strategy types, and emerging algorithmic patterns across forex, crypto, and equities in Q1 2026.",
    date: "April 10, 2026", pages: 48, icon: TrendingUp, featured: true,
    topics: ["Strategy performance breakdown", "AI signal accuracy by asset class", "Volatility regime analysis", "Top 10 most-copied strategies"],
  },
  {
    tag: "SPECIAL REPORT", tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    title: "The State of Algorithmic Trading 2026",
    summary: "Annual industry survey covering 3,200 algorithmic traders on tools, capital allocation, risk tolerance, and the impact of AI on trading outcomes.",
    date: "March 5, 2026", pages: 64, icon: BarChart2,
    topics: ["Adoption of AI tools by trader type", "Capital allocation shifts", "Risk management practices", "Technology spending trends"],
  },
  {
    tag: "BROKER REPORT", tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    title: "Multi-Broker Execution Quality 2026",
    summary: "Independent analysis of execution quality, slippage, and spread costs across 20 major brokers integrated with TradeVision AI platforms.",
    date: "February 18, 2026", pages: 32, icon: Globe,
    topics: ["Slippage by broker and asset", "Execution latency benchmarks", "Overnight financing costs", "Broker reliability scores"],
  },
  {
    tag: "QUARTERLY",    tagColor: "text-primary bg-primary/10 border-primary/20",
    title: "AI Trading Trends Q4 2025",
    summary: "Year-end analysis covering the best-performing bot strategies, copy trading returns, and market regime analysis across volatile Q4 2025 conditions.",
    date: "January 15, 2026", pages: 52, icon: TrendingUp,
    topics: ["Year-end strategy rankings", "Crypto vs Forex bot comparison", "Risk-adjusted returns by strategy type", "2026 outlook"],
  },
  {
    tag: "DEEP DIVE",    tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    title: "Gold & Commodity AI Strategies",
    summary: "A deep dive into algorithmic approaches for gold, oil, and commodity CFD trading. Includes backtest data from 2022–2025 across multiple market regimes.",
    date: "December 8, 2025", pages: 40, icon: FileText,
    topics: ["Gold bot performance (2022–2025)", "Oil price regime analysis", "Cross-commodity correlation", "Optimal entry/exit strategies"],
  },
  {
    tag: "SPECIAL REPORT", tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    title: "Copy Trading: The Data Behind Social Trading",
    summary: "Analysis of 12 months of copy trading data from 50,000 traders. Who are the top performers? What separates profitable copiers from unprofitable ones?",
    date: "November 20, 2025", pages: 36, icon: BarChart2,
    topics: ["Top trader attributes", "Optimal number of traders to copy", "Risk of over-correlation", "Performance decay analysis"],
  },
];

const CATEGORIES = ["All", "Quarterly", "Special Report", "Broker Report", "Deep Dive"];

export default function MarketReports() {
  const [cat, setCat]         = useState("All");
  const [search, setSearch]   = useState("");
  const [email, setEmail]     = useState("");
  const [subscribed, setSub]  = useState(false);

  const filtered = REPORTS.filter(r => {
    const matchCat = cat === "All" || r.tag.toLowerCase().includes(cat.toLowerCase());
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = REPORTS.find(r => r.featured);
  const rest = filtered.filter(r => !r.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-16 text-center bg-accent/10 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4">Market Reports</h1>
          <p className="text-muted-foreground mb-8">Research, analysis, and insights from the TradeVision AI data team. Published quarterly and on special topics.</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        </div>
      </section>

      {/* Featured report */}
      {featured && !search && cat === "All" && (
        <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-violet-600/5 p-8 sm:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <featured.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${featured.tagColor}`}>{featured.tag}</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black">LATEST</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />{featured.date}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />{featured.pages} pages
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-3">{featured.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{featured.summary}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-6">
                  {featured.topics.map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />{t}
                    </li>
                  ))}
                </ul>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  <Download className="w-4 h-4" />Download Free Report
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter + grid */}
      <section className="pb-20 max-w-6xl mx-auto px-4 sm:px-6">
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-xs px-4 py-2 rounded-full border font-semibold transition-colors ${cat === c ? "bg-primary text-white border-primary" : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(search ? filtered : rest).map(r => (
            <div key={r.title} className="group bg-card border border-border/50 rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${r.tagColor}`}>{r.tag}</span>
              </div>
              <h3 className="font-black mb-2 leading-snug">{r.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{r.summary}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date.split(",")[0]}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{r.pages}pp</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-3.5 h-3.5" />Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border/40 bg-accent/10 py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Get reports in your inbox</h2>
          <p className="text-muted-foreground mb-8 text-sm">New reports published monthly. No spam. Unsubscribe anytime.</p>
          {subscribed ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
              ✓ You're subscribed! Watch your inbox for the next report.
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              <button onClick={() => { if (email) setSub(true); }}
                className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
