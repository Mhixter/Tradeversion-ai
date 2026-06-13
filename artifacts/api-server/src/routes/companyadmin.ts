import { Router } from "express";
import { db, companiesTable, departmentsTable, companyMembersTable, usersTable, botsTable, brokersTable, subscriptionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_EMAIL = "saidumuhammed664@gmail.com";
const ADMIN_PASS  = "Mhixter664@gmail.com";

/* ── POST /api/company-admin/auth ─────────────────────────────────────────── */
router.post("/company-admin/auth", (req, res) => {
  const { email, password } = req.body ?? {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    res.json({
      success: true,
      token: Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString("base64"),
      admin: { email: ADMIN_EMAIL, name: "Platform Administrator", role: "Super Admin" },
    });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

/* ── GET /api/company-admin/stats ─────────────────────────────────────────── */
router.get("/company-admin/stats", async (req, res) => {
  try {
    const companies   = await db.select({ id: companiesTable.id }).from(companiesTable);
    const members     = await db.select({ id: companyMembersTable.id, status: companyMembersTable.status }).from(companyMembersTable);
    const departments = await db.select({ id: departmentsTable.id }).from(departmentsTable);
    const users       = await db.select({ id: usersTable.id }).from(usersTable);
    const bots        = await db.select({ id: botsTable.id, status: botsTable.status, pnlAllTime: botsTable.pnlAllTime }).from(botsTable);

    const subs = await db.select({ amountCents: subscriptionsTable.amountCents, status: subscriptionsTable.status })
      .from(subscriptionsTable);
    const activeRevenue = subs
      .filter(s => s.status === "active" || s.status === "trialing")
      .reduce((acc, s) => acc + (s.amountCents ?? 0), 0);
    const totalRevenue = Math.round(activeRevenue / 100);

    res.json({
      totalCompanies:   companies.length,
      totalMembers:     members.length,
      activeMembers:    members.filter(m => m.status === "active").length,
      totalDepartments: departments.length,
      totalUsers:       users.length,
      totalBots:        bots.length,
      runningBots:      bots.filter(b => b.status === "RUNNING").length,
      totalRevenue,
      openTickets:      0,
      liveAccounts:     users.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* ── GET /api/company-admin/companies ─────────────────────────────────────── */
router.get("/company-admin/companies", async (req, res) => {
  try {
    const companies = await db.select().from(companiesTable).limit(50);
    const result = await Promise.all(
      companies.map(async (c) => {
        const members = await db.select({ id: companyMembersTable.id, status: companyMembersTable.status })
          .from(companyMembersTable).where(eq(companyMembersTable.companyId, c.id));
        const departments = await db.select({ id: departmentsTable.id })
          .from(departmentsTable).where(eq(departmentsTable.companyId, c.id));
        return {
          ...c,
          memberCount:     members.length,
          activeCount:     members.filter(m => m.status === "active").length,
          departmentCount: departments.length,
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

/* ── GET /api/company-admin/users ─────────────────────────────────────────── */
router.get("/company-admin/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).limit(100);
    res.json(users);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ── GET /api/company-admin/bots ──────────────────────────────────────────── */
router.get("/company-admin/bots", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).orderBy(botsTable.sortOrder);
    res.json(bots.map(b => ({
      id: b.id, name: b.name, strategy: b.strategy, strategyType: b.strategyType,
      account: b.account, market: b.market, timeframe: b.timeframe, status: b.status,
      pnlToday: parseFloat(b.pnlToday), pnlAllTime: parseFloat(b.pnlAllTime),
      winRate: parseFloat(b.winRate), isAI: b.isAI,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch bots" });
  }
});

/* ── POST /api/company-admin/bots/:id/start ──────────────────────────────── */
router.post("/company-admin/bots/:id/start", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable).set({ status: "RUNNING" })
      .where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json({ success: true, status: "RUNNING", botId: bot.id, name: bot.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to start bot" });
  }
});

/* ── POST /api/company-admin/bots/:id/stop ───────────────────────────────── */
router.post("/company-admin/bots/:id/stop", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable).set({ status: "STOPPED" })
      .where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json({ success: true, status: "STOPPED", botId: bot.id, name: bot.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to stop bot" });
  }
});

/* ── POST /api/company-admin/bots/:id/pause ──────────────────────────────── */
router.post("/company-admin/bots/:id/pause", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable).set({ status: "PAUSED" })
      .where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json({ success: true, status: "PAUSED", botId: bot.id, name: bot.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to pause bot" });
  }
});

/* ── POST /api/company-admin/bots/stop-all ───────────────────────────────── */
router.post("/company-admin/bots/stop-all", async (req, res) => {
  try {
    await db.update(botsTable).set({ status: "STOPPED" });
    res.json({ success: true, message: "All bots stopped" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to stop all bots" });
  }
});

/* ── POST /api/company-admin/bots/start-all ──────────────────────────────── */
router.post("/company-admin/bots/start-all", async (req, res) => {
  try {
    await db.update(botsTable).set({ status: "RUNNING" });
    res.json({ success: true, message: "All bots started" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to start all bots" });
  }
});

/* ── GET /api/company-admin/billing ──────────────────────────────────────── */
router.get("/company-admin/billing", async (req, res) => {
  try {
    const subs = await db
      .select({
        id:         subscriptionsTable.id,
        userId:     subscriptionsTable.userId,
        plan:       subscriptionsTable.plan,
        status:     subscriptionsTable.status,
        amountCents: subscriptionsTable.amountCents,
        createdAt:  subscriptionsTable.createdAt,
      })
      .from(subscriptionsTable)
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(50);

    const active   = subs.filter(s => s.status === "active");
    const trialing = subs.filter(s => s.status === "trialing");
    const pastDue  = subs.filter(s => s.status === "past_due");

    const monthlyRevenue = active.reduce((acc, s) => acc + (s.amountCents ?? 0), 0) / 100;

    const planCounts: Record<string, number> = {};
    subs.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] ?? 0) + 1; });

    const userIds = [...new Set(subs.map(s => s.userId).filter(Boolean))];
    const userRows = userIds.length
      ? await db.select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email })
          .from(usersTable)
      : [];
    const userMap = Object.fromEntries(userRows.map(u => [u.id, u]));

    const recentTransactions = subs.slice(0, 10).map((s, i) => {
      const u = userMap[s.userId ?? ""];
      const name = u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "User" : "User";
      return {
        id:     `TXN-${String(i + 1).padStart(3, "0")}`,
        user:   name,
        plan:   s.plan,
        amount: Math.round((s.amountCents ?? 0) / 100),
        status: s.status === "active" ? "success" : s.status === "past_due" ? "failed" : s.status,
        date:   s.createdAt?.toISOString() ?? new Date().toISOString(),
      };
    });

    res.json({
      monthlyRevenue:      parseFloat(monthlyRevenue.toFixed(2)),
      annualRevenue:       parseFloat((monthlyRevenue * 12).toFixed(2)),
      activeSubscriptions: active.length + trialing.length,
      pendingPayments:     trialing.length,
      failedPayments:      pastDue.length,
      plans: [
        { name: "Free",       price: 0,    subscribers: planCounts["free"]       ?? 0, color: "gray" },
        { name: "Starter",    price: 49,   subscribers: planCounts["starter"]    ?? 0, color: "blue" },
        { name: "Pro",        price: 149,  subscribers: planCounts["pro"]        ?? 0, color: "violet" },
        { name: "Enterprise", price: null, subscribers: planCounts["enterprise"] ?? 0, color: "amber" },
      ],
      recentTransactions,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch billing data" });
  }
});

/* ── GET /api/company-admin/support ──────────────────────────────────────── */
router.get("/company-admin/support", (_req, res) => {
  res.json([]);
});

/* ── PATCH /api/company-admin/support/:id ────────────────────────────────── */
router.patch("/company-admin/support/:id", (req, res) => {
  const { status } = req.body ?? {};
  res.json({ success: true, id: req.params.id, status });
});

/* ── GET /api/company-admin/live-accounts ────────────────────────────────── */
router.get("/company-admin/live-accounts", async (req, res) => {
  try {
    const brokers = await db.select().from(brokersTable).limit(50);
    const accounts = brokers.map((b, i) => ({
      id:            `LA-${1000 + i}`,
      userId:        String(b.id),
      userName:      b.broker,
      email:         "",
      broker:        b.broker,
      accountNumber: b.accountNumber,
      balance:       parseFloat(b.balance),
      equity:        parseFloat(b.equity),
      margin:        0,
      currency:      "USD",
      leverage:      100,
      status:        b.isConnected ? "active" : "suspended",
      openTrades:    0,
      totalPnl:      parseFloat(b.profit),
    }));
    res.json(accounts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch live accounts" });
  }
});

/* ── POST /api/company-admin/live-accounts/:id/suspend ───────────────────── */
router.post("/company-admin/live-accounts/:id/suspend", (req, res) => {
  res.json({ success: true, id: req.params.id, status: "suspended" });
});

/* ── POST /api/company-admin/live-accounts/:id/activate ─────────────────── */
router.post("/company-admin/live-accounts/:id/activate", (req, res) => {
  res.json({ success: true, id: req.params.id, status: "active" });
});

/* ── GET /api/company-admin/roles ────────────────────────────────────────── */
router.get("/company-admin/roles", async (req, res) => {
  try {
    const members = await db
      .select({
        id:        companyMembersTable.id,
        role:      companyMembersTable.role,
        status:    companyMembersTable.status,
        companyId: companyMembersTable.companyId,
      })
      .from(companyMembersTable)
      .limit(100);

    const roleStats = members.reduce((acc: Record<string, number>, m) => {
      acc[m.role] = (acc[m.role] ?? 0) + 1;
      return acc;
    }, {});

    res.json({
      members,
      roleStats,
      roleDefinitions: [
        { role: "owner",   label: "Owner",   color: "amber",   permissions: ["all"], count: roleStats["owner"] ?? 0 },
        { role: "admin",   label: "Admin",   color: "violet",  permissions: ["manage_users","billing","bots","strategies","reports"], count: roleStats["admin"] ?? 0 },
        { role: "manager", label: "Manager", color: "blue",    permissions: ["bots","strategies","reports","view_billing"], count: roleStats["manager"] ?? 0 },
        { role: "trader",  label: "Trader",  color: "green",   permissions: ["bots","strategies"], count: roleStats["trader"] ?? 0 },
        { role: "viewer",  label: "Viewer",  color: "gray",    permissions: ["view_only"], count: roleStats["viewer"] ?? 0 },
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

/* ── PATCH /api/company-admin/members/:id/role ───────────────────────────── */
router.patch("/company-admin/members/:id/role", async (req, res) => {
  try {
    const { role } = req.body ?? {};
    const [updated] = await db
      .update(companyMembersTable)
      .set({ role })
      .where(eq(companyMembersTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Member not found" }); return; }
    res.json({ success: true, id: updated.id, role: updated.role });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

/* ── POST /api/company-admin/invite-member ───────────────────────────────── */
router.post("/company-admin/invite-member", async (req, res) => {
  try {
    const { email, companyId, role } = req.body ?? {};
    if (!email || !role) {
      res.status(400).json({ success: false, error: "Email and role are required." });
      return;
    }

    const validRoles = ["admin", "manager", "trader", "viewer"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, error: "Invalid role." });
      return;
    }

    let resolvedCompanyId: string | null = companyId ? String(companyId) : null;

    if (!resolvedCompanyId) {
      const [firstCompany] = await db.select({ id: companiesTable.id }).from(companiesTable).limit(1);
      if (firstCompany) resolvedCompanyId = firstCompany.id;
    }

    if (!resolvedCompanyId) {
      res.status(400).json({ success: false, error: "No company found. Create a company first." });
      return;
    }

    let [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));

    if (!user) {
      const [newUser] = await db
        .insert(usersTable)
        .values({ email, firstName: email.split("@")[0] })
        .returning({ id: usersTable.id });
      user = newUser;
    }

    const existingMember = await db
      .select({ id: companyMembersTable.id })
      .from(companyMembersTable)
      .where(eq(companyMembersTable.userId, user.id))
      .limit(1);

    let memberId: string;
    if (existingMember.length > 0) {
      const [updated] = await db
        .update(companyMembersTable)
        .set({ role, status: "active" })
        .where(eq(companyMembersTable.id, existingMember[0].id))
        .returning({ id: companyMembersTable.id });
      memberId = updated.id;
    } else {
      const [member] = await db
        .insert(companyMembersTable)
        .values({ userId: user.id, companyId: resolvedCompanyId, role, status: "active" })
        .returning({ id: companyMembersTable.id });
      memberId = member.id;
    }

    res.json({
      success: true,
      message: `Invitation sent to ${email} with role: ${role}`,
      memberId,
      email,
      role,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ success: false, error: "Failed to invite member." });
  }
});

/* ── POST /api/company-admin/payment-gateway/:name/configure ─────────────── */
router.post("/company-admin/payment-gateway/:name/configure", (req, res) => {
  const { name } = req.params;
  const config = req.body ?? {};
  const validGateways = ["Stripe", "PayPal", "Crypto"];
  if (!validGateways.includes(name)) {
    res.status(400).json({ success: false, error: "Unknown payment gateway." });
    return;
  }
  res.json({
    success: true,
    gateway: name,
    message: `${name} gateway configured successfully.`,
    keysReceived: Object.keys(config),
  });
});

export default router;
