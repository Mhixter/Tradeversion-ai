import React, { useState } from "react";
import { Link } from "wouter";
import {
  Diamond, ChevronDown, Search, HelpCircle, Bot, Shield, CreditCard,
  Wifi, Code2, BookOpen, ArrowRight, MessageCircle, Mail, Phone, Zap,
} from "lucide-react";

const CATEGORIES = [
  { id:"all",       label:"All Questions",        icon: HelpCircle },
  { id:"start",     label:"Getting Started",       icon: Zap },
  { id:"trading",   label:"Trading & Bots",        icon: Bot },
  { id:"security",  label:"Security & Compliance", icon: Shield },
  { id:"billing",   label:"Billing & Plans",       icon: CreditCard },
  { id:"brokers",   label:"Broker Connections",    icon: Wifi },
  { id:"technical", label:"Technical",             icon: Code2 },
];

const FAQS = [
  { cat:"start", q:"What is TradeVision AI?", a:"TradeVision AI is an enterprise-grade AI trading automation platform that lets you automate your trading strategies, copy verified top traders, manage risk across multiple brokers, and analyze your portfolio — all from a single dashboard. We support MT4, MT5, and 47+ other brokers." },
  { cat:"start", q:"How do I get started?", a:"Sign up for a free 14-day trial (no credit card required), connect your broker account using your investor password, select a pre-built strategy or build your own in the Strategy Builder, and deploy your first bot in under 10 minutes." },
  { cat:"start", q:"Do I need to know how to code?", a:"Not at all. The visual Strategy Builder lets you drag, drop, and connect indicator nodes to build complete strategies without writing a single line of code. For advanced users, we also expose a REST API and Webhook system." },
  { cat:"start", q:"Is TradeVision available in my country?", a:"TradeVision AI is available globally. We serve traders in 85+ countries. However, certain features may be subject to local regulations. Please review our compliance page for details specific to your jurisdiction." },
  { cat:"trading", q:"What markets can I trade?", a:"TradeVision supports Forex (major, minor, exotic pairs), Cryptocurrencies (BTC, ETH, 200+ coins), Gold & Commodities (XAU, XAG, WTI), Stock Indices (S&P 500, NASDAQ, DAX, FTSE), and individual Stocks (via supported brokers like Interactive Brokers)." },
  { cat:"trading", q:"How many bots can I run simultaneously?", a:"Starter plan allows 3 bots. Professional plan offers unlimited bots with no concurrency restrictions. Enterprise plans can be customized to any scale including multi-account management." },
  { cat:"trading", q:"What is Copy Trading?", a:"Copy Trading lets you mirror verified traders on the platform with one click. When a followed trader opens or closes a position, the same trade is automatically replicated in your account with a risk multiplier you control. Pro users can copy up to 20 traders simultaneously." },
  { cat:"trading", q:"Can I backtest strategies before going live?", a:"Yes. The Backtesting Engine runs your strategy on 10+ years of historical tick data with walk-forward testing and Monte Carlo simulations. You can view the full equity curve, drawdown analysis, and Sharpe ratio before deploying live." },
  { cat:"trading", q:"What happens if my internet goes down?", a:"All bots run on our cloud servers, not your local machine. Your strategies continue executing 24/7 regardless of your internet connection or whether your computer is on." },
  { cat:"security", q:"Is my money safe?", a:"Your funds remain with your connected third-party broker at all times. TradeVision AI never holds, moves, touches, or has custody of your funds. We only require your investor (read-only) password which cannot place or withdraw funds." },
  { cat:"security", q:"How do you protect my broker credentials?", a:"Investor passwords are encrypted with AES-256 at rest and in transit. We never store master passwords. Our infrastructure is SOC 2 Type II certified and undergoes regular third-party penetration testing." },
  { cat:"security", q:"Is TradeVision regulated?", a:"TradeVision AI is a technology company and is not a regulated financial institution, broker, or investment advisor. We are a SaaS platform. You are responsible for ensuring your trading activities comply with applicable laws in your jurisdiction." },
  { cat:"security", q:"Can I enable two-factor authentication?", a:"Yes. 2FA is available and highly recommended. We support authenticator apps (Google Authenticator, Authy) and hardware security keys (YubiKey). You can enable this in Settings → Security." },
  { cat:"billing", q:"How does the free trial work?", a:"All new accounts get 14 days of full Professional plan access — including unlimited bots, GPT-4 signals, and all premium features. No credit card is required to start. After the trial, you can choose a plan or downgrade to the free Starter tier." },
  { cat:"billing", q:"What payment methods do you accept?", a:"We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, bank wire transfers, and cryptocurrency payments (USDT, BTC) for annual plans." },
  { cat:"billing", q:"Can I change my plan at any time?", a:"Yes. You can upgrade, downgrade, or cancel your subscription at any time from Settings → Billing. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period." },
  { cat:"billing", q:"Do you offer refunds?", a:"We offer a 7-day money-back guarantee for all new paid subscriptions. If you are not satisfied within the first 7 days, contact support for a full refund. Subsequent charges are non-refundable unless required by law." },
  { cat:"brokers", q:"Which brokers are supported?", a:"We support 47+ brokers including: IC Markets, Exness, Deriv, Pepperstone, XM, OANDA, Alpaca, Interactive Brokers, Binance, Kraken, FxPro, IG Group, Tickmill, Axiory, and any MetaTrader 4 or MetaTrader 5 compatible broker." },
  { cat:"brokers", q:"How do I connect my broker?", a:"Go to Settings → Connections → Add Connection. Select your broker, choose MT4 or MT5, enter your account number and investor password (NOT your master password). Click Test Connection, then Connect. The process takes under 60 seconds." },
  { cat:"brokers", q:"Can I connect multiple broker accounts?", a:"Yes. The Professional plan supports up to 5 broker connections simultaneously. Enterprise plans support unlimited connections with unified cross-account risk management." },
  { cat:"brokers", q:"What is the difference between MT4 and MT5?", a:"MetaTrader 4 (MT4) is the older platform focused on Forex. MetaTrader 5 (MT5) supports more asset classes including stocks, futures, and options. TradeVision fully supports both. MT5 is recommended for new setups." },
  { cat:"technical", q:"Does TradeVision have an API?", a:"Yes. We provide a full REST API and real-time WebSocket API for developers. You can programmatically manage bots, read portfolio data, receive signals, and trigger trades. Full API documentation is available in our developer portal." },
  { cat:"technical", q:"What programming languages are supported for custom strategies?", a:"Custom strategies can be built in the visual node editor (no code), or via our API using any language that supports HTTP/WebSocket (Python, JavaScript, Node.js, C#, Java). We also accept MQL4/MQL5 script uploads." },
  { cat:"technical", q:"What is the uptime SLA?", a:"We guarantee 99.9% uptime SLA for all Professional and Enterprise accounts, backed by our multi-region cloud infrastructure. Historical uptime is publicly available on our status page." },
  { cat:"technical", q:"What data feeds do you use?", a:"We use institutional-grade real-time price feeds from primary exchanges and ECN aggregators. Portfolio analytics is powered by live broker account data pulled directly from your connected accounts." },
];

function NavBar() {
  return (
    <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Diamond className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm">TradeVision AI</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          <Link href="/landing" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItem, setOpenItem] = useState<number | null>(null);

  const filtered = FAQS.filter(f => {
    const matchCat = activeCategory === "all" || f.cat === activeCategory;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-semibold mb-6">
            <HelpCircle className="w-3 h-3" />Help Center & FAQ
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">How can we <span className="text-primary">help you?</span></h1>
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">Browse 25+ answers or search for anything. Can't find what you need? <Link href="/contact" className="text-primary hover:underline">Contact us directly.</Link></p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions, topics, keywords…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* Sidebar categories */}
          <aside className="lg:col-span-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
            <div className="flex lg:flex-col gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCategory(c.id); setOpenItem(null); }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${activeCategory === c.id ? "bg-primary/10 text-primary border border-primary/25" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  <c.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{c.label}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground/60 shrink-0">
                    {c.id === "all" ? FAQS.length : FAQS.filter(f => f.cat === c.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Support channels */}
            <div className="mt-8 space-y-3 hidden lg:block">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Still need help?</p>
              {[
                { icon: MessageCircle, label:"Live Chat", desc:"Usually replies in 2min",  href:"/contact" },
                { icon: Mail,          label:"Email",     desc:"support@tradevision.ai",    href:"/contact" },
              ].map(ch => (
                <Link key={ch.label} href={ch.href} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ch.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{ch.label}</p>
                      <p className="text-[11px] text-muted-foreground">{ch.desc}</p>
                    </div>
                </Link>
              ))}
            </div>
          </aside>

          {/* FAQ list */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "question" : "questions"}
                {search && ` matching "${search}"`}
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Clear search</button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No questions found</p>
                <p className="text-sm mt-1">Try a different search term or <Link href="/contact" className="text-primary hover:underline">contact us</Link></p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((f, i) => (
                  <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${openItem === i ? "border-primary/30 shadow-lg bg-card" : "border-border/50 bg-card/60 hover:border-border"}`}>
                    <button className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenItem(openItem === i ? null : i)}>
                      <span className="font-semibold text-sm leading-snug">{f.q}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${openItem === i ? "rotate-180 text-primary" : ""}`} />
                    </button>
                    {openItem === i && (
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">{f.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-border/40 bg-accent/10 py-12 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h3 className="text-xl font-black mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-6">Our support team typically responds within 2 hours during business hours.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Contact Support <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/landing" className="inline-flex items-center gap-2 border border-border bg-card px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent transition-all">Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
