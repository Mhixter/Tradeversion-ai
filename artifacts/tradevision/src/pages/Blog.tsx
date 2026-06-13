import React, { useState } from "react";
import { Link } from "wouter";
import { Diamond, ArrowRight, Clock, Tag, TrendingUp, Bot, Shield, BookOpen, Cpu, Users, Globe, ChevronRight, Search } from "lucide-react";

const CATEGORIES = ["All","AI Trading","Strategy","Risk Management","Brokers","Market Analysis","Platform Updates"];

const POSTS = [
  {
    id:1, cat:"AI Trading", featured:true,
    title:"How Gold Hunter AI Achieved +18.4% ROI in Q1 2026",
    excerpt:"A deep dive into the signal logic, risk parameters, and execution strategy behind our top-performing XAUUSD bot this quarter.",
    author:"TradeVision Research",  avatar:"https://api.dicebear.com/8.x/initials/svg?seed=TR&backgroundColor=6366f1",
    date:"Jun 10, 2026", read:"8 min read", img:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    tags:["Gold","AI Bots","Performance"],
  },
  {
    id:2, cat:"Strategy",
    title:"Mastering the MACD Momentum Strategy: A Complete Guide",
    excerpt:"Learn how to configure, backtest, and deploy the MACD Momentum Surge strategy across Forex and Index markets.",
    author:"Alex Chen",           avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=alex",
    date:"Jun 7, 2026", read:"12 min read", img:"https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
    tags:["MACD","Forex","Strategy Builder"],
  },
  {
    id:3, cat:"Risk Management",
    title:"The 5 Risk Rules Every Automated Trader Must Set",
    excerpt:"DrawDdown limits, position sizing, VaR caps, kill-switch configuration, and exposure limits — a practical checklist.",
    author:"Priya Sharma",         avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=priya",
    date:"Jun 4, 2026", read:"6 min read", img:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    tags:["Risk","Kill-Switch","Drawdown"],
  },
  {
    id:4, cat:"Brokers",
    title:"IC Markets vs Exness: Which Is Best for Automated Trading?",
    excerpt:"We compared spreads, execution speed, MT5 compatibility, and slippage across 6 months of live bot data.",
    author:"Marcus Wei",           avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=marcus",
    date:"Jun 1, 2026", read:"10 min read", img:"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    tags:["Brokers","MT5","Review"],
  },
  {
    id:5, cat:"AI Trading",
    title:"GPT-4 vs Traditional Indicators: Who Wins at Signal Generation?",
    excerpt:"We ran a 90-day live test comparing pure AI signals against RSI+MACD combinations. The results were surprising.",
    author:"TradeVision Research",  avatar:"https://api.dicebear.com/8.x/initials/svg?seed=TR&backgroundColor=6366f1",
    date:"May 28, 2026", read:"15 min read", img:"https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    tags:["GPT-4","Signals","AI"],
  },
  {
    id:6, cat:"Market Analysis",
    title:"Gold Market Outlook: Key Levels to Watch in Q3 2026",
    excerpt:"Our quant team's technical analysis of XAUUSD for Q3, including support/resistance zones, macro catalysts, and positioning.",
    author:"Sofia Andrade",        avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=sofia",
    date:"May 25, 2026", read:"7 min read", img:"https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
    tags:["Gold","XAUUSD","Analysis"],
  },
  {
    id:7, cat:"Platform Updates",
    title:"TradeVision v3.2: Node Properties Panel & MT5 Latency Improvements",
    excerpt:"This month's release brings configurable node parameters in the Strategy Builder and 40% faster MT5 order execution.",
    author:"TradeVision Team",     avatar:"https://api.dicebear.com/8.x/initials/svg?seed=TV&backgroundColor=6366f1",
    date:"May 20, 2026", read:"4 min read", img:"https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    tags:["Product","Updates","MT5"],
  },
  {
    id:8, cat:"Strategy",
    title:"Building a Fibonacci Retracement Bot Without Code",
    excerpt:"Step-by-step walkthrough of building a Fibonacci + RSI confluence strategy in the visual Strategy Builder and deploying it live.",
    author:"Daniel Park",          avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=daniel",
    date:"May 15, 2026", read:"9 min read", img:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    tags:["Fibonacci","Strategy Builder","Tutorial"],
  },
  {
    id:9, cat:"Risk Management",
    title:"Copy Trading Risk: How to Protect Yourself When Mirroring Others",
    excerpt:"Not all copy trading is safe. Here's how to evaluate trader profiles, set maximum drawdown stops, and size positions correctly.",
    author:"Emma Rossi",           avatar:"https://api.dicebear.com/8.x/avataaars/svg?seed=emma",
    date:"May 12, 2026", read:"8 min read", img:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    tags:["Copy Trading","Risk","Safety"],
  },
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
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          <Link href="/landing" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = POSTS.find(p => p.featured);
  const filtered = POSTS.filter(p => {
    if (p.featured) return false;
    const matchCat = activeCategory === "All" || p.cat === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-semibold mb-6">
            <BookOpen className="w-3 h-3" />Insights, tutorials & market analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">TradeVision <span className="text-primary">Blog</span></h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto mb-8">Trading strategies, AI insights, platform updates, and market analysis from our team of quants and traders.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-md"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Featured post */}
        {featured && !search && activeCategory === "All" && (
          <div className="mb-12">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Featured</p>
            <div className="group rounded-3xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-all hover:shadow-2xl cursor-pointer">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img src={featured.img} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent hidden lg:block" />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-[11px] font-bold">{featured.cat}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="w-3 h-3" />{featured.read}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={featured.avatar} alt={featured.author} className="w-8 h-8 rounded-full border border-border bg-accent" />
                      <div>
                        <p className="text-xs font-semibold">{featured.author}</p>
                        <p className="text-[11px] text-muted-foreground">{featured.date}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeCategory === c ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-card border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No articles found</p>
            <p className="text-sm mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <article key={post.id} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur text-[11px] font-bold text-foreground border border-border/50">{post.cat}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{post.read}</span>
                    <span className="text-muted-foreground/40 text-[11px]">·</span>
                    <span className="text-[11px] text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-accent text-[10px] font-medium text-muted-foreground border border-border/40">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-border/30">
                    <img src={post.avatar} alt={post.author} className="w-7 h-7 rounded-full border border-border bg-accent" />
                    <p className="text-xs font-semibold text-muted-foreground">{post.author}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        {!search && (
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-primary/10 to-violet-600/10 border border-primary/20 p-8 sm:p-12 text-center">
            <h3 className="text-2xl font-black mb-2">Stay Ahead of the Markets</h3>
            <p className="text-muted-foreground text-sm mb-6">Weekly AI trading insights, strategy breakdowns, and platform updates delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center">
              <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50" />
              <button className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all whitespace-nowrap">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Diamond className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold">TradeVision AI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 TradeVision AI</p>
        </div>
      </footer>
    </div>
  );
}
