import { Router } from "express";
import { db, companiesTable, departmentsTable, companyMembersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

/* ── Helper: find the company this user belongs to (owner or member) ──── */
async function getUserCompany(userId: string) {
  // Check if user owns a company
  const [owned] = await db.select().from(companiesTable)
    .where(eq(companiesTable.ownerId, userId));
  if (owned) return { company: owned, role: "owner" as const, status: "active" as const, memberId: null };

  // Check if user is a member of any company
  const [membership] = await db
    .select({
      company: companiesTable,
      role: companyMembersTable.role,
      status: companyMembersTable.status,
      memberId: companyMembersTable.id,
    })
    .from(companyMembersTable)
    .innerJoin(companiesTable, eq(companyMembersTable.companyId, companiesTable.id))
    .where(eq(companyMembersTable.userId, userId));

  if (membership) return {
    company: membership.company,
    role: membership.role,
    status: membership.status,
    memberId: membership.memberId,
  };

  return null;
}

function canManage(role: string) {
  return ["owner", "admin"].includes(role);
}

/* ── GET /api/company/my-role ─────────────────────────────────────────── */
router.get("/company/my-role", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.json({ role: null, status: null, companyId: null, companyName: null }); return; }
    res.json({
      role: ctx.role,
      status: ctx.status,
      companyId: ctx.company.id,
      companyName: ctx.company.name,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch role" });
  }
});

/* ── GET /api/company/overview ───────────────────────────────────────── */
router.get("/company/overview", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.json({ exists: false }); return; }

    const { company } = ctx;
    const members = await db.select().from(companyMembersTable)
      .where(eq(companyMembersTable.companyId, company.id));
    const departments = await db.select().from(departmentsTable)
      .where(eq(departmentsTable.companyId, company.id));

    res.json({
      exists: true,
      company,
      memberCount: members.length,
      activeCount: members.filter(m => m.status === "active").length,
      departmentCount: departments.length,
      myRole: ctx.role,
      myStatus: ctx.status,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch company overview" });
  }
});

/* ── GET /api/company/departments ────────────────────────────────────── */
router.get("/company/departments", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.json([]); return; }
    const departments = await db.select().from(departmentsTable)
      .where(eq(departmentsTable.companyId, ctx.company.id));
    res.json(departments);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

/* ── POST /api/company/departments ──────────────────────────────────── */
router.post("/company/departments", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.status(404).json({ error: "Company not found" }); return; }
    if (!canManage(ctx.role)) { res.status(403).json({ error: "Insufficient permissions" }); return; }

    const [dept] = await db.insert(departmentsTable).values({
      companyId: ctx.company.id,
      name: req.body.name,
      headUserId: req.body.headUserId,
      budget: req.body.budget,
    }).returning();
    res.json(dept);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create department" });
  }
});

/* ── GET /api/company/members ────────────────────────────────────────── */
router.get("/company/members", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.json([]); return; }

    const members = await db
      .select({
        id: companyMembersTable.id,
        userId: companyMembersTable.userId,
        role: companyMembersTable.role,
        status: companyMembersTable.status,
        departmentId: companyMembersTable.departmentId,
        joinedAt: companyMembersTable.joinedAt,
        createdAt: companyMembersTable.createdAt,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        profileImageUrl: usersTable.profileImageUrl,
      })
      .from(companyMembersTable)
      .innerJoin(usersTable, eq(companyMembersTable.userId, usersTable.id))
      .where(eq(companyMembersTable.companyId, ctx.company.id));
    res.json(members);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

/* ── POST /api/company/members/invite ───────────────────────────────── */
router.post("/company/members/invite", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx) { res.status(404).json({ error: "Company not found" }); return; }
    if (!canManage(ctx.role)) {
      res.status(403).json({ error: "Only owners and admins can invite members" }); return;
    }

    const { email, role } = req.body;
    if (!email || !role) { res.status(400).json({ error: "Email and role are required" }); return; }

    // Look up user by email — they must have signed into TradeVision at least once
    const [targetUser] = await db.select().from(usersTable)
      .where(eq(usersTable.email, email));

    if (!targetUser) {
      res.status(404).json({
        error: "User not found",
        message: `No account found for ${email}. They need to sign in with Replit once to create their account, then you can invite them.`,
      });
      return;
    }

    // Prevent self-invite
    if (targetUser.id === req.user.id) {
      res.status(400).json({ error: "You cannot invite yourself" }); return;
    }

    // Check if already a member of this company
    const [existing] = await db.select().from(companyMembersTable)
      .where(and(
        eq(companyMembersTable.companyId, ctx.company.id),
        eq(companyMembersTable.userId, targetUser.id),
      ));

    if (existing) {
      res.status(409).json({ error: "Already a member", message: `${email} is already part of this company.` });
      return;
    }

    // Check if user already owns or belongs to a different company
    const alreadyInCompany = await getUserCompany(targetUser.id);
    if (alreadyInCompany && alreadyInCompany.company.id !== ctx.company.id) {
      res.status(409).json({ error: "User is in another company", message: `${email} already belongs to another company.` });
      return;
    }

    // Add as active member immediately
    await db.insert(companyMembersTable).values({
      companyId: ctx.company.id,
      userId: targetUser.id,
      role: role.toLowerCase(),
      status: "active",
      invitedBy: req.user.id,
      joinedAt: new Date(),
    });

    const name = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ") || email;
    res.json({
      success: true,
      message: `${name} has been added to your team as ${role}.`,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to invite member" });
  }
});

/* ── PATCH /api/company/members/:id/role ────────────────────────────── */
router.patch("/company/members/:id/role", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx || !canManage(ctx.role)) { res.status(403).json({ error: "Insufficient permissions" }); return; }

    await db
      .update(companyMembersTable)
      .set({ role: req.body.role, updatedAt: new Date() })
      .where(and(
        eq(companyMembersTable.id, req.params.id),
        eq(companyMembersTable.companyId, ctx.company.id),
      ));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

/* ── PATCH /api/company/members/:id/status ──────────────────────────── */
router.patch("/company/members/:id/status", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx || !canManage(ctx.role)) { res.status(403).json({ error: "Insufficient permissions" }); return; }

    await db
      .update(companyMembersTable)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(and(
        eq(companyMembersTable.id, req.params.id),
        eq(companyMembersTable.companyId, ctx.company.id),
      ));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* ── DELETE /api/company/members/:id ────────────────────────────────── */
router.delete("/company/members/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const ctx = await getUserCompany(req.user.id);
    if (!ctx || !canManage(ctx.role)) { res.status(403).json({ error: "Insufficient permissions" }); return; }

    await db.delete(companyMembersTable)
      .where(and(
        eq(companyMembersTable.id, req.params.id),
        eq(companyMembersTable.companyId, ctx.company.id),
      ));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

/* ── POST /api/company/setup ────────────────────────────────────────── */
router.post("/company/setup", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [existing] = await db.select({ id: companiesTable.id }).from(companiesTable)
      .where(eq(companiesTable.ownerId, req.user.id));
    if (existing) { res.json({ company: existing }); return; }

    const [company] = await db.insert(companiesTable).values({
      name: req.body.name || `${req.user.firstName ?? "My"}'s Company`,
      ownerId: req.user.id,
      country: req.body.country,
      industry: req.body.industry || "Proprietary Trading",
    }).returning();

    // Auto-add owner as member
    await db.insert(companyMembersTable).values({
      companyId: company.id,
      userId: req.user.id,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });

    // Default departments
    for (const name of ["Trading", "Risk Management", "Research & Analytics"]) {
      await db.insert(departmentsTable).values({ companyId: company.id, name, headUserId: req.user.id });
    }

    res.json({ company });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to setup company" });
  }
});

export default router;
