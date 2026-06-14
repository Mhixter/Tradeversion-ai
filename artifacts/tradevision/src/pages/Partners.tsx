import React from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Globe, TrendingUp, Users, Zap, Award, BarChart2, Building2 } from "lucide-react";
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
          <Link href="/affiliates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Affiliates</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}

const TIERS = [
  {
    name: "Silver Partner",
    color: "border-slate-400/30 bg-slate-400/5",
    badge: "text-slate-300",
    req: "25+ referred active accounts",
    perks: ["15% revenue share", "Co-marketing materials", "Partner badge & listing", "Dedicated Slack channel", "Quarterly business reviews"],
  },
  {
    name: "Gold Partner",
    color: "border-amber-500/30 bg-amber-500/5",
    badge: "text-amber-400",
    popular: true,
    req: "100+ referred active accounts",
    perks: ["25% revenue share", "White-label options", "Joint PR opportunities", "Priority onboarding support", "Dedicated account manager", "Co-branded landing pages"],
  },
  {
    name: "Platinum Partner",
    color: "border-primary/30 bg-primary/5",
    badge: "text-primary",
    req: "500+ referred active accounts",
    perks: ["35% revenue share", "Full white-label platform", "Equity consideration", "Engineering resources", "Custom integrations", "C-suite access", "Joint GTM strategy"],
  },
];

const PARTNER_TYPES = [
  { icon: Building2,  title: "Brokers & Prop Firms",       desc: "Integrate TradeVision directly into your brokerage offering. Provide your clients with AI-powered automation tools under your brand." },
  { icon: Globe,      title: "Fintech Platforms",           desc: "Embed our strategy engine, risk analytics, or copy trading into your existing platform via API. Revenue share on activated users." },
  { icon: Users,      title: "Trading Educators & Gurus",  desc: "Monetize your strategies by listing them in our marketplace. Earn ongoing royalties when traders deploy your bots." },
  { icon: BarChart2,  title: "Signal Providers",            desc: "Connect your signal service to TradeVision. Your subscribers can auto-execute your signals across any connected broker instantly." },
  { icon: Award,      title: "Technology Integrators",      desc: "Build on top of our API. Create specialized tools, analytics layers, or vertical solutions for specific trading niches." },
  { icon: TrendingUp, title: "Institutional Resellers",     desc: "Resell TradeVision Enterprise to prop desks, family offices, and fund managers. Highest tier commissions and full support." },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="py-20 sm:py-28 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-6">
          <Globe className="w-3 h-3" />200+ active partners in 60 countries
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
          Grow together with<br /><span className="text-primary">TradeVision</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          Partner with the fastest-growing AI trading platform. Access revenue shares, co-marketing opportunities, and the infrastructure of a platform trusted by 50,000+ traders.
        </p>
        <a href="mailto:partners@tradevision.ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          Apply to Partner <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Partner types */}
      <section className="py-16 bg-accent/10 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-center mb-3">Who we partner with</h2>
          <p className="text-muted-foreground text-center mb-10">Different partner types. Same commitment to mutual growth.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTNER_TYPES.map(p => (
              <div key={p.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-black text-center mb-3">Partner Tiers</h2>
        <p className="text-muted-foreground text-center mb-12">Scale your benefits as you grow your referred user base.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIERS.map(t => (
            <div key={t.name} className={`relative border rounded-2xl p-6 ${t.color} ${t.popular ? "ring-1 ring-amber-500/40" : ""}`}>
              {t.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full bg-amber-500 text-black">MOST POPULAR</div>}
              <h3 className={`font-black text-lg mb-1 ${t.badge}`}>{t.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-5">{t.req}</p>
              <ul className="space-y-2.5">
                {t.perks.map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-accent/10 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black mb-12">How to become a partner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step:"01", title:"Apply", desc:"Fill out the partner application form with your business details and how you plan to drive value." },
              { step:"02", title:"Review", desc:"Our partnerships team reviews your application within 5 business days and schedules a discovery call." },
              { step:"03", title:"Onboard", desc:"Sign the partnership agreement, get access to the partner portal, and receive your referral links and co-marketing kit." },
              { step:"04", title:"Earn", desc:"Start referring users and earning revenue share. Dashboard updated in real-time." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xs font-black text-primary">{s.step}</span>
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center max-w-2xl mx-auto px-4 sm:px-6">
        <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-3">Ready to partner?</h2>
        <p className="text-muted-foreground mb-8">Email our partnerships team or book a 30-minute discovery call.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="mailto:partners@tradevision.ai" className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">partners@tradevision.ai</a>
          <Link href="/contact" className="px-6 py-3 rounded-xl border border-border/60 font-semibold text-sm hover:border-primary/40 transition-colors">Book a Call</Link>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground">Terms</Link> · <Link href="/privacy" className="hover:text-foreground">Privacy</Link> · <Link href="/contact" className="hover:text-foreground">Contact</Link></p>
      </footer>
    </div>
  );
}
