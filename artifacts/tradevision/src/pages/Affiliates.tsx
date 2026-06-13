import React from "react";
import { Link } from "wouter";
import { Diamond, ArrowRight, DollarSign, TrendingUp, Users, Zap, CheckCircle, Share2, BarChart2, Clock } from "lucide-react";

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
          <Link href="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partners</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}

const COMMISSIONS = [
  { tier: "Starter",     referrals: "1–10",    rate: "20%",  cookie: "30 days",  payout: "Monthly" },
  { tier: "Growth",      referrals: "11–50",   rate: "25%",  cookie: "60 days",  payout: "Monthly" },
  { tier: "Pro",         referrals: "51–200",  rate: "30%",  cookie: "90 days",  payout: "Bi-weekly" },
  { tier: "Elite",       referrals: "200+",    rate: "35%",  cookie: "180 days", payout: "Weekly" },
];

const HOW_IT_WORKS = [
  { icon: Share2,    step: "01", title: "Sign up free",          desc: "Create your affiliate account in 60 seconds. Instant approval for most applicants." },
  { icon: ArrowRight, step: "02", title: "Share your link",      desc: "Get your unique referral link and embed it in your content, newsletter, or social profiles." },
  { icon: Users,     step: "03", title: "Refer traders",         desc: "When a referred user signs up and becomes a paying subscriber, the sale is tracked to you." },
  { icon: DollarSign, step: "04", title: "Earn commissions",     desc: "Earn 20–35% recurring commission for every month your referred users stay subscribed." },
];

const TOOLS = [
  "Custom referral links with UTM tracking",
  "Banners, badges, and landing page templates",
  "Email swipe copy for newsletters",
  "Social media content calendar",
  "Real-time dashboard with click, sign-up & revenue stats",
  "API for programmatic affiliate integration",
  "Sub-affiliate program (earn 5% on your sub-affiliates)",
];

export default function Affiliates() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-20 sm:py-28 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-emerald-400 text-xs font-semibold mb-6">
          <DollarSign className="w-3 h-3" />Avg. affiliate earns $1,800/month
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
          Earn recurring income<br /><span className="text-primary">promoting TradeVision</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          Join 1,200+ affiliates earning 20–35% recurring commissions on every subscription. Share your link, refer traders, and earn every month they stay subscribed.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="mailto:affiliates@tradevision.ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            Join the Program <ArrowRight className="w-4 h-4" />
          </a>
          <Link href="/contact" className="px-6 py-3 rounded-xl border border-border/60 font-semibold text-sm hover:border-primary/40 transition-colors">Ask a Question</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-accent/10 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "1,200+",  label: "Active Affiliates" },
            { value: "35%",     label: "Max Commission" },
            { value: "$4.2M",   label: "Paid Out (2025)" },
            { value: "180 days", label: "Max Cookie Window" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black text-primary mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-black text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-sm font-black text-primary">{s.step}</span>
              </div>
              <h3 className="font-bold mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission table */}
      <section className="py-16 bg-accent/10 border-y border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-center mb-3">Commission Structure</h2>
          <p className="text-muted-foreground text-center mb-10">Recurring monthly commissions. Automatically tier up as you refer more users.</p>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Tier</th>
                  <th className="text-left px-5 py-3">Active Referrals</th>
                  <th className="text-center px-5 py-3">Commission</th>
                  <th className="text-center px-5 py-3">Cookie</th>
                  <th className="text-center px-5 py-3">Payout</th>
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS.map((c, i) => (
                  <tr key={c.tier} className={`border-b border-border/30 last:border-0 ${i === 2 ? "bg-primary/5" : ""}`}>
                    <td className="px-5 py-4 text-sm font-bold">{c.tier}{i === 2 && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black">POPULAR</span>}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{c.referrals}</td>
                    <td className="px-5 py-4 text-sm text-center font-black text-emerald-400">{c.rate}</td>
                    <td className="px-5 py-4 text-sm text-center text-muted-foreground">{c.cookie}</td>
                    <td className="px-5 py-4 text-sm text-center text-muted-foreground">{c.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">Commissions apply to the monthly subscription value of referred users on Starter and Professional plans.</p>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-black mb-4">Everything you need to promote</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">We give you a full marketing kit, real-time analytics, and dedicated affiliate support so you can focus on creating content, not chasing reports.</p>
            <ul className="space-y-3">
              {TOOLS.map(t => (
                <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-lg">Example Monthly Earnings</h3>
            {[
              { referrals: 10,  plan: "Starter ($49/mo)",       earn: "$98" },
              { referrals: 10,  plan: "Professional ($149/mo)", earn: "$298" },
              { referrals: 50,  plan: "Mix of plans",           earn: "$1,350" },
              { referrals: 200, plan: "Mix of plans",           earn: "$6,400+" },
            ].map(e => (
              <div key={e.referrals + e.plan} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-semibold">{e.referrals} referrals</p>
                  <p className="text-[11px] text-muted-foreground">{e.plan}</p>
                </div>
                <span className="text-lg font-black text-emerald-400">{e.earn}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground">Estimates based on average subscription values and tier commission rates.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/40 bg-accent/10 text-center">
        <DollarSign className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-3">Start earning today</h2>
        <p className="text-muted-foreground mb-8">Apply for the affiliate program. Approval in under 24 hours.</p>
        <a href="mailto:affiliates@tradevision.ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          affiliates@tradevision.ai <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
