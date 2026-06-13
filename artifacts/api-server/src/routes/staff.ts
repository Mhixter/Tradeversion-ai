import { Router } from "express";
import { db, staffMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const mapStaff = (s: typeof staffMembersTable.$inferSelect) => ({
  id: s.id,
  name: s.name,
  email: s.email,
  role: s.role,
  department: s.department,
  status: s.status,
  phone: s.phone,
  bio: s.bio,
  invitedAt: s.invitedAt,
  joinedAt: s.joinedAt,
  createdAt: s.createdAt,
});

router.get("/staff", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const members = await db.select().from(staffMembersTable).orderBy(staffMembersTable.createdAt);
    res.json(members.map(mapStaff));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/staff", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { name, email, role, department, phone, bio } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required" });
      return;
    }
    const [inserted] = await db.insert(staffMembersTable).values({
      name, email,
      role: role || "support",
      department: department || "Support",
      status: "invited",
      phone: phone || null,
      bio: bio || null,
    }).returning();
    res.status(201).json(mapStaff(inserted));
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "A staff member with this email already exists" });
      return;
    }
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/staff/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { name, email, role, department, status, phone, bio } = req.body;
    const update: Partial<typeof staffMembersTable.$inferInsert> = {};
    if (name)       update.name = name;
    if (email)      update.email = email;
    if (role)       update.role = role;
    if (department) update.department = department;
    if (status)     update.status = status;
    if (phone !== undefined) update.phone = phone;
    if (bio   !== undefined) update.bio   = bio;
    if (status === "active" && !update.joinedAt) update.joinedAt = new Date();

    const [updated] = await db.update(staffMembersTable)
      .set(update)
      .where(eq(staffMembersTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Staff member not found" }); return; }
    res.json(mapStaff(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/staff/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    await db.delete(staffMembersTable).where(eq(staffMembersTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
