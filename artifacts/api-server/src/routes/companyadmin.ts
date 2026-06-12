import { Router } from "express";
import { db, companiesTable, departmentsTable, companyMembersTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
      admin: { email: ADMIN_EMAIL, name: "Company Administrator", role: "Super Admin" },
    });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
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
          memberCount: members.length,
          activeCount: members.filter(m => m.status === "active").length,
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

/* ── GET /api/company-admin/stats ─────────────────────────────────────────── */
router.get("/company-admin/stats", async (req, res) => {
  try {
    const companies   = await db.select({ id: companiesTable.id }).from(companiesTable);
    const members     = await db.select({ id: companyMembersTable.id, status: companyMembersTable.status }).from(companyMembersTable);
    const departments = await db.select({ id: departmentsTable.id }).from(departmentsTable);
    const users       = await db.select({ id: usersTable.id }).from(usersTable);
    res.json({
      totalCompanies:  companies.length,
      totalMembers:    members.length,
      activeMembers:   members.filter(m => m.status === "active").length,
      totalDepartments: departments.length,
      totalUsers:      users.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
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

export default router;
