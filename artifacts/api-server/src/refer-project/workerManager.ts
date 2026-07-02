/**
 * Refer Project — Worker Manager (singleton)
 * Manages the lifecycle of all account workers.
 * Started once at API server boot; recovers after restarts.
 */
import { db } from "@workspace/db";
import { rpAccountsTable, rpSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AccountWorker } from "./accountWorker.js";
import { rpLog } from "./rpLogger.js";

class WorkerManager {
  private workers = new Map<number, AccountWorker>();
  private started = false;

  /** Called once at server start. Restores all previously-active workers. */
  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    await rpLog({ event: "SYSTEM_RESTART", message: "Refer Project worker manager started" });

    try {
      // Ensure singleton settings row exists
      const [settings] = await db.select().from(rpSettingsTable).where(eq(rpSettingsTable.id, 1)).limit(1);
      if (!settings) {
        await db.insert(rpSettingsTable).values({ id: 1 }).onConflictDoNothing();
      }

      const accounts = await db.select()
        .from(rpAccountsTable)
        .where(eq(rpAccountsTable.status, "active"));

      for (const account of accounts) {
        await this.startAccount(account.id);
      }
    } catch (err) {
      await rpLog({ event: "ERROR", message: `Worker manager startup error: ${String(err)}`, level: "error" });
    }
  }

  async startAccount(accountId: number): Promise<void> {
    if (this.workers.get(accountId)?.isRunning()) return; // already running
    const worker = new AccountWorker(accountId);
    this.workers.set(accountId, worker);
    await worker.start(); // start is non-blocking (schedules its own loop)
  }

  async stopAccount(accountId: number): Promise<void> {
    const worker = this.workers.get(accountId);
    if (worker) {
      await worker.stop();
      this.workers.delete(accountId);
    }
  }

  isRunning(accountId: number): boolean {
    return this.workers.get(accountId)?.isRunning() ?? false;
  }

  runningAccountIds(): number[] {
    return [...this.workers.entries()]
      .filter(([, w]) => w.isRunning())
      .map(([id]) => id);
  }

  async stopAll(): Promise<void> {
    await Promise.allSettled([...this.workers.values()].map(w => w.stop()));
    this.workers.clear();
  }
}

// Exported singleton
export const workerManager = new WorkerManager();
