import React, { useState } from "react";
import { Link } from "wouter";
import { LogoIcon } from "@/components/Logo";
import {
  ArrowRight, Check, Eye, EyeOff,
  Mail, Lock, User, ChevronLeft, Zap, Shield, Bot, Users,
  CheckCircle2, ArrowLeft,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

type Step = 1 | 2 | 3;

const PLANS = [
  { id:"starter", name:"Starter", price:"$49/mo", features:["3 Bots","5 Strategies","Copy 3 Traders"], color:"border-border" },
  { id:"pro",     name:"Pro",     price:"$149/mo", features:["Unlimited Bots","Copy 20 Traders","GPT-4 Signals"], color:"border-primary ring-2 ring-primary/20", popular:true },
  { id:"free",    name:"Free",    price:"$0/mo",   features:["1 Bot","1 Strategy","Paper Trading"], color:"border-border" },
];

const BROKERS = [
  { id:"alpaca",  name:"Alpaca",              logo:"🦙" },
  { id:"oanda",   name:"OANDA",               logo:"🔵" },
  { id:"ib",      name:"Interactive Brokers", logo:"🏦" },
  { id:"binance", name:"Binance",             logo:"🟡" },
  { id:"paper",   name:"Paper Trading",       logo:"📄" },
  { id:"skip",    name:"Skip for now",        logo:"⏭️" },
];

export default function Signup() {
  const [step, setStep] = useState<Step>(1);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [plan, setPlan] = useState("pro");
  const [broker, setBroker] = useState("");
  const [done, setDone] = useState(false);

  const canStep1 = form.name.length > 1 && form.email.includes("@") && form.password.length >= 8;

  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success/20">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-black mb-2">You're all set! 🎉</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Welcome to TradeVision AI. Your account is ready and your <strong>{PLANS.find(p=>p.id===plan)?.name}</strong> plan is active.
        </p>
        <Link href="/">
          <button className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40">
        <Link href="/landing">
          <div className="flex items-center gap-2 cursor-pointer">
            <LogoIcon size={28} />
            <span className="text-sm font-bold">TradeVision AI</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Already have an account?
          <Link href="/"><span className="text-primary font-semibold cursor-pointer hover:underline">Log in</span></Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {([1,2,3] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step === s ? "opacity-100" : step > s ? "opacity-80" : "opacity-40"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s ? "bg-success text-white" : step === s ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-accent text-muted-foreground border border-border"
                  }`}>
                    {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{["Create Account","Choose Plan","Connect Broker"][i]}</span>
                </div>
                {i < 2 && <div className={`flex-1 max-w-12 h-px transition-colors ${step > s ? "bg-success" : "bg-border"}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1: Account ── */}
          {step === 1 && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black mb-1">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start your 14-day free trial. No credit card needed.</p>
              </div>

              {/* Social logins */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => { window.location.href = "/api/login"; }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-colors text-sm font-semibold"
                >
                  <GoogleIcon />Continue with Google
                </button>
                <button
                  onClick={() => { window.location.href = "/api/login"; }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-colors text-sm font-semibold"
                >
                  <AppleIcon />Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text" placeholder="John Trader" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-accent border border-border rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="email" placeholder="john@example.com" value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-accent border border-border rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full bg-accent border border-border rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${form.password.length >= i * 2 ? i <= 1 ? "bg-destructive" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-primary" : "bg-success" : "bg-border"}`} />
                    ))}
                  </div>
                </div>

                <button
                  disabled={!canStep1}
                  onClick={() => setStep(2)}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                By signing up, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}

          {/* ── Step 2: Plan ── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3" />Back
              </button>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black mb-1">Choose your plan</h1>
                <p className="text-sm text-muted-foreground">14 days free, then billed monthly. Cancel anytime.</p>
              </div>

              <div className="space-y-3 mb-6">
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`w-full relative bg-card border rounded-2xl p-4 text-left transition-all ${plan === p.id ? `${p.color} shadow-lg` : "border-border hover:border-primary/30"}`}
                  >
                    {p.popular && plan !== p.id && (
                      <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black">POPULAR</span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${plan === p.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                          {plan === p.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <div className="flex gap-1 flex-wrap mt-0.5">
                            {p.features.map(f => <span key={f} className="text-[9px] text-muted-foreground">{f} ·</span>)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-right">{p.price}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
              >
                Continue with {PLANS.find(p=>p.id===plan)?.name} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 3: Broker ── */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3" />Back
              </button>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black mb-1">Connect your broker</h1>
                <p className="text-sm text-muted-foreground">Connect your trading account or start with paper trading.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {BROKERS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBroker(b.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${broker === b.id ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:border-primary/30 hover:bg-accent"}`}
                  >
                    <span className="text-2xl">{b.logo}</span>
                    <div>
                      <p className="text-xs font-bold leading-tight">{b.name}</p>
                      {broker === b.id && <p className="text-[9px] text-primary mt-0.5">Selected</p>}
                    </div>
                    {broker === b.id && <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="bg-accent/40 rounded-xl p-3 mb-5 flex items-start gap-2">
                <Shield className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">Your broker credentials are encrypted and never stored on our servers. We use read-only API access where possible.</p>
              </div>

              <button
                disabled={!broker}
                onClick={() => setDone(true)}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />Start Trading — 14 Days Free
              </button>
            </div>
          )}

          {/* Value props below form */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            {[
              { icon: Shield, text: "Bank-level encryption" },
              { icon: Bot,    text: "AI bots in minutes"    },
              { icon: Users,  text: "50,000+ traders"       },
            ].map(p => (
              <div key={p.text} className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center">
                <p.icon className="w-3 h-3 text-primary" />{p.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
