import React, { useState } from "react";
import { Link } from "wouter";
import { Search, MessageCircle, BookOpen, Zap, Shield, Bot, TrendingUp, BarChart2, Globe, ChevronDown, ChevronRight, Mail, Clock, PhoneCall } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <span className="font-black text-sm">TradeVision AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
      </div>
    </header>
  );
}

const CATEGORIES = [
  { icon: Zap,       title: "Getting Started",    count: 12, color: "text-emerald-400 bg-emerald-400/10" },
  { icon: Bot,       title: "Trading Bots",       count: 18, color: "text-primary bg-primary/10" },
  { icon: TrendingUp, title: "Strategy Builder",  count: 15, color: "text-primary bg-primary/10" },
  { icon: Globe,     title: "Broker Connection",  count: 22, color: "text-cyan-400 bg-cyan-400/10" },
  { icon: Shield,    title: "Security & Account", count: 10, color: "text-amber-400 bg-amber-400/10" },
  { icon: BarChart2, title: "Analytics & Reports", count: 9, color: "text-rose-400 bg-rose-400/10" },
];

const FAQS = [
  {
    q: "How do I connect my broker account?",
    a: "Go to Settings → Broker Connections → Add Broker. Select your broker from the list, enter your MT4/MT5 account credentials or API key, and click Connect. Most connections complete in under 60 seconds.",
  },
  {
    q: "Can a bot lose more than my balance?",
    a: "No. TradeVision enforces hard stop-loss limits at the account level. You can also set per-bot drawdown limits, daily loss limits, and auto-pause rules in the Risk Center.",
  },
  {
    q: "Why is my bot not executing trades?",
    a: "Common causes: (1) Broker connection is offline — check Settings → Broker Status. (2) Bot is in pause mode. (3) Risk limits have been hit — check the Risk Center. (4) Market is closed. (5) Insufficient margin.",
  },
  {
    q: "How do I backtest a strategy?",
    a: "Open Strategy Builder → select or create a strategy → click 'Run Backtest'. Choose a date range, initial capital, and commission settings. Results include equity curve, Sharpe ratio, max drawdown, and trade log.",
  },
  {
    q: "Can I use TradeVision on multiple broker accounts simultaneously?",
    a: "Yes. Professional and Enterprise plans support multiple simultaneous broker connections. You can run different bots on different accounts and aggregate all risk and performance in one dashboard.",
  },
  {
    q: "How is my payment processed?",
    a: "Payments are processed via Stripe (PCI DSS Level 1 compliant). We accept all major credit/debit cards and bank transfers for Enterprise plans. Your card details are never stored on our servers.",
  },
  {
    q: "What happens if TradeVision has downtime?",
    a: "Active bots continue running on our co-located servers during frontend outages. However, during full platform outages, bots enter a safe-mode pause. We maintain a 99.9% uptime SLA and notify users of any incidents via status.tradevision.ai.",
  },
];

export default function Help() {
  const [search, setSearch]   = useState("");
  const [open, setOpen]       = useState<number | null>(null);

  const filtered = FAQS.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-16 text-center bg-accent/10 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl sm:text-5xl font-black mb-4">Help Center</h1>
          <p className="text-muted-foreground mb-8">Find answers, guides, and troubleshooting for everything in TradeVision AI.</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        </div>
      </section>

      {/* Categories */}
      {!search && (
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-black mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(c => (
              <button key={c.title} className="bg-card border border-border/50 rounded-2xl p-4 text-center hover:border-primary/30 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold leading-tight">{c.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{c.count} articles</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-8 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-xl font-black mb-6">{search ? `Results for "${search}"` : "Common Questions"}</h2>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No results for "<strong>{search}</strong>"</p>
            <p className="text-sm mt-1">Try different keywords or <Link href="/contact" className="text-primary hover:underline">contact support</Link></p>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
                <span className="font-semibold text-sm">{f.q}</span>
                {open === i ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact support */}
      <section className="border-t border-border/40 bg-accent/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-black text-center mb-8">Still need help?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Mail,     title: "Email Support",    desc: "For account, billing, and technical questions.", cta: "support@tradevision.ai", href: "mailto:support@tradevision.ai", time: "< 4 hours" },
              { icon: MessageCircle, title: "Live Chat",  desc: "Chat with our team directly in the platform.", cta: "Open Chat", href: "/signup", time: "< 2 minutes" },
              { icon: PhoneCall, title: "Priority Call",  desc: "Pro and Enterprise users can book a call.", cta: "Book a Call", href: "/contact", time: "Same day" },
            ].map(c => (
              <div key={c.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{c.desc}</p>
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 mb-4">
                  <Clock className="w-3 h-3" />{c.time}
                </div>
                <a href={c.href} className="text-sm font-semibold text-primary hover:underline">{c.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
