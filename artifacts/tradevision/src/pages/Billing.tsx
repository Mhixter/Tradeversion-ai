import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, Check, Zap, Building2, Users, Bot, Crown,
  ArrowRight, Shield, RefreshCw, ChevronDown, ChevronUp,
  BadgeCheck, AlertTriangle, Clock, Star,
} from "lucide-react";

type PlanId = "free" | "starter" | "pro" | "enterprise";
type BillingCycle = "monthly" | "annual";

interface Plan {
  id: PlanId;
  name: string;
  price: number | null;
  currency: string;
  interval: string;
  popular?: boolean;
  features: string[];
  limits: { bots: number; strategies: number; copyTraders: number };
}

interface Subscription {
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "paused";
  billingCycle: BillingCycle;
  amountCents: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const PLAN_ICONS: Record<PlanId, React.ElementType> = {
  free: Bot, starter: Zap, pro: Crown, enterprise: Building2,
};

const PLAN_COLORS: Record<PlanId, string> = {
  free: "from-slate-500 to-gray-600",
  starter: "from-blue-500 to-cyan-500",
  pro: "from-purple-500 to-violet-500",
  enterprise: "from-amber-500 to-orange-500",
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  active:    { icon: BadgeCheck,   color: "text-emerald-500", label: "Active" },
  trialing:  { icon: Clock,        color: "text-blue-500",    label: "Free Trial" },
  past_due:  { icon: AlertTriangle, color: "text-amber-500",  label: "Past Due" },
  canceled:  { icon: RefreshCw,    color: "text-red-500",     label: "Canceled" },
  paused:    { icon: Clock,        color: "text-gray-500",    label: "Paused" },
};

function PlanCard({ plan, current, cycle, onSelect, loading }: {
  plan: Plan; current: Subscription | null; cycle: BillingCycle;
  onSelect: (id: PlanId) => void; loading: boolean;
}) {
  const isCurrent = current?.plan === plan.id;
  const Icon = PLAN_ICONS[plan.id];
  const gradient = PLAN_COLORS[plan.id];
  const annualPrice = plan.price ? Math.round(plan.price * 10 * 0.8) : null;
  const displayPrice = cycle === "annual" ? annualPrice : plan.price;
  const monthlyCost = cycle === "annual" && annualPrice ? Math.round(annualPrice / 12) : plan.price;

  return (
    <div className={`relative rounded-2xl border transition-all ${plan.popular ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30" : "border-border hover:border-primary/30"} ${isCurrent ? "bg-primary/5" : "bg-card"}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />Most Popular
          </div>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />Current Plan
          </div>
        </div>
      )}
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{plan.interval} billing</p>
          </div>
        </div>

        <div>
          {plan.price === null ? (
            <p className="text-3xl font-black text-foreground">Custom</p>
          ) : plan.price === 0 ? (
            <p className="text-3xl font-black text-foreground">Free</p>
          ) : (
            <>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-foreground">${(monthlyCost! / 100).toFixed(0)}</span>
                <span className="text-muted-foreground text-sm mb-1">/mo</span>
              </div>
              {cycle === "annual" && (
                <p className="text-xs text-emerald-500 font-medium">
                  Billed ${(annualPrice! / 100).toFixed(0)}/year · Save 20%
                </p>
              )}
            </>
          )}
        </div>

        <ul className="space-y-2">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>

        {plan.id === "enterprise" ? (
          <Button variant="outline" className="w-full">Contact Sales <ArrowRight className="w-4 h-4 ml-1" /></Button>
        ) : isCurrent ? (
          <Button variant="outline" className="w-full" disabled>Current Plan</Button>
        ) : (
          <Button className={`w-full ${plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            onClick={() => onSelect(plan.id)} disabled={loading}>
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : plan.price === 0 ? "Downgrade" : "Upgrade Now"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Billing() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/billing/plans", { credentials: "include" }).then(r => r.json()),
      fetch("/api/billing/subscription", { credentials: "include" }).then(r => r.json()),
    ]).then(([plansData, subData]) => {
      setPlans(plansData);
      setSub(subData);
      if (subData?.billingCycle) setCycle(subData.billingCycle);
    }).catch(() => {
      toast({ title: "Failed to load billing data", variant: "destructive" });
    }).finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billingCycle: cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      setSub(prev => prev ? { ...prev, plan: planId, status: "active", billingCycle: cycle } : prev);
      toast({ title: "Plan Updated", description: `You're now on the ${planId} plan.` });
    } catch (e: any) {
      toast({ title: "Upgrade Failed", description: e.message, variant: "destructive" });
    } finally {
      setUpgrading(false);
    }
  };

  const StatusIcon = sub ? STATUS_CONFIG[sub.status]?.icon : null;

  // Invoice mock history
  const invoices = [
    { id: "INV-2026-006", date: "Jun 1, 2026", amount: 149, status: "paid", plan: "Pro" },
    { id: "INV-2026-005", date: "May 1, 2026", amount: 149, status: "paid", plan: "Pro" },
    { id: "INV-2026-004", date: "Apr 1, 2026", amount: 149, status: "paid", plan: "Pro" },
    { id: "INV-2026-003", date: "Mar 1, 2026", amount: 49,  status: "paid", plan: "Starter" },
    { id: "INV-2026-002", date: "Feb 1, 2026", amount: 49,  status: "paid", plan: "Starter" },
    { id: "INV-2026-001", date: "Jan 1, 2026", amount: 49,  status: "paid", plan: "Starter" },
  ];

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground">Manage your plan, payment methods, and invoices</p>
          </div>
        </div>

        {/* Current subscription status */}
        {sub && (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PLAN_COLORS[sub.plan]} flex items-center justify-center shadow-lg`}>
                    {React.createElement(PLAN_ICONS[sub.plan], { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground capitalize">{sub.plan} Plan</p>
                      {StatusIcon && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${STATUS_CONFIG[sub.status]?.color}`}>
                          {React.createElement(StatusIcon, { className: "w-3 h-3" })}
                          {STATUS_CONFIG[sub.status]?.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.status === "trialing"
                        ? `Free trial · Renews ${sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : "soon"}`
                        : sub.amountCents > 0
                        ? `$${(sub.amountCents / 100).toFixed(0)}/${sub.billingCycle === "annual" ? "yr" : "mo"} · Next billing ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "N/A"}`
                        : "Free plan"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />Manage Payment
                  </Button>
                  {sub.status !== "canceled" && sub.plan !== "free" && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                      Cancel Plan
                    </Button>
                  )}
                </div>
              </div>

              {sub.status === "trialing" && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">14-day free trial</span> — All Pro features unlocked.
                    Trial ends {sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "soon"}.
                    Choose a plan below to continue after your trial.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-muted rounded-xl p-1 flex items-center">
            <button
              onClick={() => setCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("annual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${cycle === "annual" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual
              <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} current={sub} cycle={cycle} onSelect={handleUpgrade} loading={upgrading} />
            ))}
          </div>
        )}

        {/* Feature comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              What's Included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Feature</th>
                    {["Free", "Starter", "Pro", "Enterprise"].map(p => (
                      <th key={p} className="text-center py-2 px-2 font-semibold text-foreground">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Trading Bots",         "1",      "3",      "Unlimited",  "Unlimited"],
                    ["Strategies",          "1",      "5",      "Unlimited",  "Unlimited"],
                    ["Copy Traders",         "0",      "3",      "20",         "Unlimited"],
                    ["AI Signals (GPT-4)",   "✗",     "Basic",  "✓",          "✓"],
                    ["Backtesting",         "✗",      "30 days","Full suite", "Full suite"],
                    ["Risk Dashboard",       "Basic",  "Basic",  "Advanced",   "Custom"],
                    ["API Access",           "✗",      "✗",      "✓",          "✓"],
                    ["Company Management",   "✗",      "✗",      "✓",          "✓"],
                    ["SLA Guarantee",        "✗",      "✗",      "✗",          "99.9%"],
                    ["Dedicated Support",    "✗",      "Email",  "Priority",   "Dedicated"],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 text-foreground font-medium">{feature}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="py-2.5 px-2 text-center">
                          {v === "✓" ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> :
                           v === "✗" ? <span className="text-muted-foreground/40">—</span> :
                           <span className="text-xs text-muted-foreground">{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/28</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Payments are secured by Stripe. We never store your card details.
            </p>
          </CardContent>
        </Card>

        {/* Invoice history */}
        <Card>
          <CardHeader>
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowHistory(!showHistory)}
            >
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />Invoice History
              </CardTitle>
              {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.date} · {inv.plan} Plan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">${inv.amount}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-7">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}
