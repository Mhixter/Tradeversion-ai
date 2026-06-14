import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, MapPin, Clock, Briefcase, Code2, TrendingUp, Shield, Users, Zap, Globe, Coffee } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <span className="font-black text-sm">TradeVision AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}

const DEPTS = ["All", "Engineering", "Product", "Research", "Marketing", "Operations", "Sales"];

const JOBS = [
  { title: "Senior ML Engineer — Signal Engine",     dept: "Engineering", location: "London / Remote", type: "Full-time", level: "Senior",     desc: "Build and improve our GPT-4 powered trading signal engine. You'll work on time-series forecasting models that serve 50k+ traders." },
  { title: "Full-Stack Engineer (React + Node)",      dept: "Engineering", location: "Remote",          type: "Full-time", level: "Mid–Senior",  desc: "Own features end-to-end across our React frontend and Node/TypeScript API. Strong focus on real-time data and low-latency UX." },
  { title: "Quantitative Researcher",                 dept: "Research",    location: "London / NY",     type: "Full-time", level: "Senior",     desc: "Develop and backtest new trading strategies. Collaborate with the AI team to productize your research into live signals." },
  { title: "Product Manager — Bot Marketplace",       dept: "Product",     location: "Remote",          type: "Full-time", level: "Mid",        desc: "Drive the roadmap for our AI bot marketplace. Define features that help 10,000+ traders discover and deploy strategies." },
  { title: "Risk Systems Engineer",                   dept: "Engineering", location: "London",          type: "Full-time", level: "Senior",     desc: "Build real-time risk aggregation systems. Own portfolio-level VaR, drawdown limits, and cross-broker risk exposure." },
  { title: "DevOps / Infrastructure Engineer",        dept: "Engineering", location: "Remote",          type: "Full-time", level: "Mid–Senior",  desc: "Manage our Kubernetes infrastructure across AWS and co-location facilities. 99.9% uptime is not optional." },
  { title: "Growth Marketing Manager",                dept: "Marketing",   location: "Remote",          type: "Full-time", level: "Mid",        desc: "Run paid and organic growth campaigns targeting traders. Own our SEO, content marketing, and influencer partnerships." },
  { title: "Enterprise Sales Executive",              dept: "Sales",       location: "New York / Dubai", type: "Full-time", level: "Senior",    desc: "Close enterprise deals with prop trading firms, family offices, and asset managers. Strong fintech network is a plus." },
  { title: "Customer Success Manager",                dept: "Operations",  location: "Remote",          type: "Full-time", level: "Mid",        desc: "Onboard and retain enterprise accounts. Be the expert that helps institutional clients get maximum value from TradeVision." },
  { title: "Data Scientist — Copy Trading",           dept: "Research",    location: "Remote",          type: "Full-time", level: "Mid",        desc: "Build the ranking algorithms and performance attribution models that power our Copy Trading leaderboards." },
];

const PERKS = [
  { icon: Globe,    title: "Remote-first",         desc: "Work from anywhere. We have hubs in London, New York, Singapore, and Dubai." },
  { icon: TrendingUp, title: "Equity for all",     desc: "Every employee receives meaningful equity. We grow together." },
  { icon: Shield,   title: "Healthcare",            desc: "Full private health, dental, and vision coverage for you and your family." },
  { icon: Zap,      title: "Learning budget",       desc: "$3,000/year for courses, conferences, books, and certifications." },
  { icon: Coffee,   title: "Unlimited PTO",         desc: "We trust our team. Take the time you need to do your best work." },
  { icon: Code2,    title: "Hardware allowance",    desc: "$2,500 to set up your ideal home office. Mac, standing desk, monitors." },
  { icon: Users,    title: "Team retreats",         desc: "Twice-yearly company offsites in locations like Lisbon, Bali, and Tokyo." },
  { icon: Briefcase, title: "Trading account",      desc: "All employees get a funded TradeVision Pro account. Use the product you build." },
];

export default function Careers() {
  const [dept, setDept] = useState("All");
  const filtered = dept === "All" ? JOBS : JOBS.filter(j => j.dept === dept);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-20 sm:py-28 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-emerald-400 text-xs font-semibold mb-6">
          <Zap className="w-3 h-3" />We're hiring · {JOBS.length} open roles
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
          Build the future<br /><span className="text-primary">of AI trading</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Join a team of former Goldman Sachs quants, Google engineers, and fintech builders who are democratizing algorithmic trading for 50,000+ traders worldwide.
        </p>
      </section>

      {/* Perks */}
      <section className="py-16 bg-accent/10 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-center mb-10">Why TradeVision</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {PERKS.map(p => (
              <div key={p.title} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <p.icon className="w-5 h-5 text-primary mb-3" />
                <p className="font-bold text-sm mb-1">{p.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-black mb-8">Open Positions</h2>
        {/* Dept filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DEPTS.map(d => (
            <button key={d} onClick={() => setDept(d)}
              className={`text-xs px-4 py-2 rounded-full border font-semibold transition-colors ${dept === d ? "bg-primary text-white border-primary" : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(j => (
            <div key={j.title} className="group bg-card border border-border/50 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{j.dept}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent border border-border/50 text-muted-foreground">{j.level}</span>
                </div>
                <h3 className="font-black text-base mb-2">{j.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{j.desc}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.type}</span>
                </div>
              </div>
              <Link href="/contact" className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 sm:opacity-100">
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No open roles in this department right now.</p>
            <p className="text-sm mt-1">Send your CV to <a href="mailto:careers@tradevision.ai" className="text-primary hover:underline">careers@tradevision.ai</a></p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/40 bg-accent/10 text-center">
        <h2 className="text-2xl font-black mb-3">Don't see a perfect fit?</h2>
        <p className="text-muted-foreground mb-6">Send us your CV and a short note. We're always looking for exceptional people.</p>
        <a href="mailto:careers@tradevision.ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          careers@tradevision.ai <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
