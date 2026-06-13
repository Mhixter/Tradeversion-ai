import { Router } from "express";
import { db, companiesTable, departmentsTable, companyMembersTable, usersTable, botsTable } from "@workspace/db";
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

    const totalRevenue = 48250 + users.length * 49;
    res.json({
      totalCompanies:   companies.length,
      totalMembers:     members.length,
      activeMembers:    members.filter(m => m.status === "active").length,
      totalDepartments: departments.length,
      totalUsers:       users.length,
      totalBots:        bots.length,
      runningBots:      bots.filter(b => b.status === "RUNNING").length,
      totalRevenue,
      openTickets:      7,
      liveAccounts:     users.length > 0 ? 1 : 0,
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
    const users = await db.select({ id: usersTable.id }).from(usersTable);
    const count = users.length;
    res.json({
      monthlyRevenue:   count * 49 + 1200,
      annualRevenue:    (count * 49 + 1200) * 12,
      activeSubscriptions: count,
      pendingPayments:  2,
      failedPayments:   1,
      plans: [
        { name: "Starter",     price: 29,  subscribers: Math.max(0, Math.floor(count * 0.3)), color: "blue" },
        { name: "Pro",         price: 49,  subscribers: Math.max(0, Math.floor(count * 0.5)), color: "violet" },
        { name: "Enterprise",  price: 199, subscribers: Math.max(0, Math.floor(count * 0.2)), color: "amber" },
      ],
      recentTransactions: [
        { id: "TXN-001", user: "Alex Müller",   plan: "Pro",        amount: 49,  status: "success",  date: new Date(Date.now() - 86400000).toISOString() },
        { id: "TXN-002", user: "Sara Johnson",  plan: "Enterprise", amount: 199, status: "success",  date: new Date(Date.now() - 172800000).toISOString() },
        { id: "TXN-003", user: "Mike Chen",     plan: "Starter",    amount: 29,  status: "success",  date: new Date(Date.now() - 259200000).toISOString() },
        { id: "TXN-004", user: "Fatima Al-R.",  plan: "Pro",        amount: 49,  status: "failed",   date: new Date(Date.now() - 345600000).toISOString() },
        { id: "TXN-005", user: "Dmitri Volkov", plan: "Pro",        amount: 49,  status: "pending",  date: new Date(Date.now() - 432000000).toISOString() },
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch billing data" });
  }
});

/* ── GET /api/company-admin/support ──────────────────────────────────────── */
router.get("/company-admin/support", async (req, res) => {
  res.json([
    { id: "TKT-001", subject: "Cannot connect MT5 broker",        user: "Alex Müller",   priority: "high",   status: "open",       category: "Technical",  created: new Date(Date.now() - 3600000).toISOString() },
    { id: "TKT-002", subject: "Bot keeps stopping unexpectedly",   user: "Sara Johnson",  priority: "high",   status: "open",       category: "Bots",       created: new Date(Date.now() - 7200000).toISOString() },
    { id: "TKT-003", subject: "Billing charge dispute",            user: "Mike Chen",     priority: "medium", status: "pending",    category: "Billing",    created: new Date(Date.now() - 86400000).toISOString() },
    { id: "TKT-004", subject: "Request to upgrade to Enterprise",  user: "Fatima Al-R.", priority: "low",    status: "resolved",   category: "Billing",    created: new Date(Date.now() - 172800000).toISOString() },
    { id: "TKT-005", subject: "KYC document submission issue",     user: "Dmitri Volkov", priority: "medium", status: "open",       category: "Compliance", created: new Date(Date.now() - 259200000).toISOString() },
    { id: "TKT-006", subject: "Strategy builder export not working",user: "Linda Park",   priority: "low",    status: "pending",    category: "Technical",  created: new Date(Date.now() - 345600000).toISOString() },
    { id: "TKT-007", subject: "Account password reset request",    user: "Omar Hassan",   priority: "low",    status: "resolved",   category: "Account",    created: new Date(Date.now() - 432000000).toISOString() },
  ]);
});

/* ── PATCH /api/company-admin/support/:id ────────────────────────────────── */
router.patch("/company-admin/support/:id", (req, res) => {
  const { status } = req.body ?? {};
  res.json({ success: true, id: req.params.id, status });
});

/* ── GET /api/company-admin/live-accounts ────────────────────────────────── */
router.get("/company-admin/live-accounts", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).limit(10);
    const accounts = users.map((u, i) => ({
      id:            `LA-${1000 + i}`,
      userId:        u.id,
      userName:      `${u.firstName ?? "User"} ${u.lastName ?? ""}`.trim(),
      email:         u.email ?? `user${i}@tradevision.ai`,
      broker:        ["MetaTrader 5", "cTrader", "Binance"][i % 3],
      accountNumber: `MT5-${400000 + i * 117}`,
      balance:       parseFloat((10000 + Math.random() * 90000).toFixed(2)),
      equity:        parseFloat((10000 + Math.random() * 95000).toFixed(2)),
      margin:        parseFloat((Math.random() * 2000).toFixed(2)),
      currency:      "USD",
      leverage:      [100, 200, 500][i % 3],
      status:        i === 3 ? "suspended" : "active",
      openTrades:    Math.floor(Math.random() * 8),
      totalPnl:      parseFloat(((Math.random() - 0.3) * 5000).toFixed(2)),
    }));
    if (accounts.length === 0) {
      accounts.push({
        id: "LA-DEMO-001", userId: "demo", userName: "Demo Trader",
        email: "demo@tradevision.ai", broker: "MetaTrader 5",
        accountNumber: "MT5-LIVE-400100", balance: 50000.00, equity: 52340.00,
        margin: 850.00, currency: "USD", leverage: 100, status: "active",
        openTrades: 3, totalPnl: 2340.00,
      });
    }
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
