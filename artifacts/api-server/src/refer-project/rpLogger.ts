/**
 * Refer Project — Event Logger
 * Writes structured events to rp_logs table. Isolated from rest of app.
 */
import { db } from "@workspace/db";
import { rpLogsTable } from "@workspace/db/schema";

export type RPEvent =
  | "LOGIN" | "LOGOUT" | "CONNECTION" | "DISCONNECTION"
  | "TRADE_OPEN" | "TRADE_CLOSE" | "AI_DECISION" | "REJECTED_TRADE"
  | "MARGIN_ERROR" | "SPREAD_TOO_HIGH" | "SKIPPED_TRADE" | "TIMER_CLOSE"
  | "SYSTEM_RESTART" | "ACCOUNT_ADDED" | "ACCOUNT_REMOVED" | "WORKER_START" | "WORKER_STOP"
  | "SETTINGS_UPDATED" | "ERROR";

export async function rpLog(opts: {
  event:     RPEvent;
  message:   string;
  accountId?: number;
  level?:    "info" | "warn" | "error";
  details?:  Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(rpLogsTable).values({
      accountId: opts.accountId ?? null,
      event:     opts.event,
      message:   opts.message,
      level:     opts.level ?? "info",
      details:   opts.details ?? null,
    });
  } catch {
    // Never let logging crash the worker
  }
}
