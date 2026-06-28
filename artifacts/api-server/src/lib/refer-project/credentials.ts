import crypto from "node:crypto";

const DEFAULT_SECRET = "refer-project-default-key-change-me";

function getKey() {
  const seed = process.env.REFER_PROJECT_CREDENTIAL_KEY || process.env.SESSION_SECRET || DEFAULT_SECRET;
  return crypto.createHash("sha256").update(seed).digest();
}

export function encryptCredential(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptCredential(ciphertext: string): string {
  const [ivText, tagText, encryptedText] = ciphertext.split(".");
  if (!ivText || !tagText || !encryptedText) return "";
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(tagText, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
