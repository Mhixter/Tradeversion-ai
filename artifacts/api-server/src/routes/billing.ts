import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "monthly",
    features: ["1 trading bot","1 strategy","Paper trading only","Community support"],
    limits: { bots: 1, strategies: 1, copyTraders: 0 },
  },
  {
    id: "starter",
    name: "Starter",
    price: 4900,
    currency: "USD",
    interval: "monthly",
    features: ["3 trading bots","5 strategies","Copy up to 3 traders","Basic AI signals","Email support","Backtesting (30 days)"],
    limits: { bots: 3, strategies: 5, copyTraders: 3 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 14900,
    currency: "USD",
    interval: "monthly",
    popular: true,
    features: ["Unlimited bots","Unlimited strategies","Copy up to 20 traders","Advanced AI signals (GPT-4)","Real-time risk dashboard","Priority support","Full backtesting suite","API access","Company management"],
    limits: { bots: -1, strategies: -1, copyTraders: 20 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    currency: "USD",
    interval: "custom",
    features: ["Everything in Pro","White-label options","Unlimited company members","Dedicated account manager","SLA guarantee","Custom integrations","On-premise deployment","Compliance reporting"],
    limits: { bots: -1, strategies: -1, copyTraders: -1 },
  },
];

// GET /api/billing/plans
router.get("/billing/plans", (_req, res) => {
  res.json(PLANS);
});

// GET /api/billing/subscription
router.get("/billing/subscription", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, req.user.id));

    if (!sub) {
      // Create free trial subscription for new users
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const [newSub] = await db
        .insert(subscriptionsTable)
        .values({
          userId: req.user.id,
          plan: "pro",
          status: "trialing",
          billingCycle: "monthly",
          amountCents: 14900,
          trialEndsAt: trialEnd,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        })
        .returning();

      res.json({
        plan: newSub.plan,
        status: newSub.status,
        billingCycle: newSub.billingCycle,
        amountCents: newSub.amountCents,
        trialEndsAt: newSub.trialEndsAt,
        currentPeriodEnd: newSub.currentPeriodEnd,
        cancelAtPeriodEnd: newSub.cancelAtPeriodEnd,
      });
      return;
    }

    res.json({
      plan: sub.plan,
      status: sub.status,
      billingCycle: sub.billingCycle,
      amountCents: sub.amountCents,
      trialEndsAt: sub.trialEndsAt,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      stripeCustomerId: sub.stripeCustomerId,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// POST /api/billing/upgrade
router.post("/billing/upgrade", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { plan, billingCycle } = req.body;
  const validPlans = ["free", "starter", "pro", "enterprise"];
  if (!validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  try {
    const planData = PLANS.find(p => p.id === plan);
    const amountCents = billingCycle === "annual" && planData?.price
      ? Math.round(planData.price * 10 * 0.8) // 20% annual discount
      : (planData?.price ?? 0);

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1));

    const [existing] = await db
      .select({ id: subscriptionsTable.id })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, req.user.id));

    if (existing) {
      await db
        .update(subscriptionsTable)
        .set({
          plan: plan as any,
          status: "active",
          billingCycle: (billingCycle || "monthly") as any,
          amountCents,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.id, existing.id));
    } else {
      await db.insert(subscriptionsTable).values({
        userId: req.user.id,
        plan: plan as any,
        status: "active",
        billingCycle: (billingCycle || "monthly") as any,
        amountCents,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      });
    }

    res.json({ success: true, plan, status: "active" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

// POST /api/billing/checkout — create Stripe checkout session
router.post("/billing/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: "Payment gateway not yet configured. Please set STRIPE_SECRET_KEY." });
    return;
  }
  const { plan, billingCycle } = req.body;
  const planData = PLANS.find(p => p.id === plan);
  if (!planData || !planData.price) {
    res.status(400).json({ error: "Invalid plan or contact sales required" });
    return;
  }
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const isAnnual = billingCycle === "annual";
    const unitAmount = isAnnual ? Math.round(planData.price * 10 * 0.8) : planData.price;
    const origin = req.headers.origin ?? "https://tradevision.ai";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `TradeVision ${planData.name} Plan` },
          unit_amount: unitAmount,
          recurring: { interval: isAnnual ? "year" : "month" },
        },
        quantity: 1,
      }],
      success_url: `${origin}/billing?success=true&plan=${plan}`,
      cancel_url:  `${origin}/billing`,
      metadata:    { userId: req.user.id, plan, billingCycle: billingCycle ?? "monthly" },
    });
    res.json({ url: session.url });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/billing/cancel — cancel subscription at period end
router.post("/billing/cancel", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    await db
      .update(subscriptionsTable)
      .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptionsTable.userId, req.user.id));
    res.json({ success: true, cancelAtPeriodEnd: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export default router;
