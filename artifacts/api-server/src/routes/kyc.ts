import { Router } from "express";
import { db, kycVerificationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/kyc/status
router.get("/kyc/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [kyc] = await db
      .select()
      .from(kycVerificationsTable)
      .where(eq(kycVerificationsTable.userId, req.user.id));

    if (!kyc) {
      res.json({ status: "not_started", userId: req.user.id });
      return;
    }
    res.json({
      status: kyc.status,
      userId: kyc.userId,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      rejectionReason: kyc.rejectionReason,
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      nationality: kyc.nationality,
      countryOfResidence: kyc.countryOfResidence,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch KYC status" });
  }
});

// POST /api/kyc/submit
router.post("/kyc/submit", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const {
      firstName, lastName, middleName, dateOfBirth,
      nationality, countryOfResidence, taxId,
      addressLine1, addressLine2, city, state, postalCode, country,
      docType, docNumber, docIssuingCountry, docExpiryDate,
      isPep, isUsCitizen, sourceOfFunds, employmentStatus, annualIncome,
      addressDocType,
    } = req.body;

    const [existing] = await db
      .select({ id: kycVerificationsTable.id })
      .from(kycVerificationsTable)
      .where(eq(kycVerificationsTable.userId, req.user.id));

    const data = {
      userId: req.user.id,
      status: "pending" as const,
      firstName, lastName, middleName, dateOfBirth,
      nationality, countryOfResidence, taxId,
      addressLine1, addressLine2, city, state, postalCode, country,
      docType, docNumber, docIssuingCountry, docExpiryDate,
      isPep, isUsCitizen, sourceOfFunds, employmentStatus, annualIncome,
      addressDocType,
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(kycVerificationsTable)
        .set(data)
        .where(eq(kycVerificationsTable.id, existing.id));
    } else {
      await db.insert(kycVerificationsTable).values(data);
    }

    res.json({ status: "pending", message: "KYC submitted successfully. Review takes 1-2 business days." });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to submit KYC" });
  }
});

export default router;
