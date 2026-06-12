import { Router } from "express";
import { db, companiesTable, departmentsTable, companyMembersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/company/overview
router.get("/company/overview", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (!company) {
      res.json({ exists: false });
      return;
    }
    const members = await db.select().from(companyMembersTable).where(eq(companyMembersTable.companyId, company.id));
    const departments = await db.select().from(departmentsTable).where(eq(departmentsTable.companyId, company.id));
    res.json({
      exists: true,
      company,
      memberCount: members.length,
      activeCount: members.filter(m => m.status === "active").length,
      departmentCount: departments.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch company overview" });
  }
});

// GET /api/company/departments
router.get("/company/departments", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [company] = await db.select({ id: companiesTable.id }).from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (!company) { res.json([]); return; }
    const departments = await db.select().from(departmentsTable).where(eq(departmentsTable.companyId, company.id));
    res.json(departments);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// POST /api/company/departments
router.post("/company/departments", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [company] = await db.select({ id: companiesTable.id }).from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (!company) { res.status(404).json({ error: "Company not found" }); return; }
    const [dept] = await db.insert(departmentsTable).values({
      companyId: company.id,
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

// GET /api/company/members
router.get("/company/members", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [company] = await db.select({ id: companiesTable.id }).from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (!company) { res.json([]); return; }
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
      .where(eq(companyMembersTable.companyId, company.id));
    res.json(members);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// POST /api/company/members/invite
router.post("/company/members/invite", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [company] = await db.select({ id: companiesTable.id }).from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (!company) { res.status(404).json({ error: "Company not found" }); return; }
    // In production this would send an email invitation
    res.json({ success: true, message: `Invitation sent to ${req.body.email} as ${req.body.role}` });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

// PATCH /api/company/members/:id/role
router.patch("/company/members/:id/role", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    await db
      .update(companyMembersTable)
      .set({ role: req.body.role, updatedAt: new Date() })
      .where(eq(companyMembersTable.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

// POST /api/company/setup
router.post("/company/setup", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [existing] = await db.select({ id: companiesTable.id }).from(companiesTable).where(eq(companiesTable.ownerId, req.user.id));
    if (existing) { res.json({ company: existing }); return; }

    const [company] = await db.insert(companiesTable).values({
      name: req.body.name || `${req.user.firstName}'s Company`,
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

    // Create default departments
    const defaultDepts = ["Trading", "Risk Management", "Research & Analytics"];
    for (const name of defaultDepts) {
      await db.insert(departmentsTable).values({
        companyId: company.id,
        name,
        headUserId: req.user.id,
      });
    }

    res.json({ company });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to setup company" });
  }
});

export default router;
