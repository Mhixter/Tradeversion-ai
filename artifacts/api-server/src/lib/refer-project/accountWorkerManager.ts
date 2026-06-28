import { logger } from "../logger";

interface WorkerTimers {
  reconnectInterval?: NodeJS.Timeout;
  tradeTimers: Map<string, NodeJS.Timeout>;
}

export class ReferProjectWorkerManager {
  private workers = new Map<string, WorkerTimers>();

  private ensureWorker(accountId: string): WorkerTimers {
    const existing = this.workers.get(accountId);
    if (existing) return existing;
    const worker: WorkerTimers = { tradeTimers: new Map() };
    this.workers.set(accountId, worker);
    return worker;
  }

  hasWorker(accountId: string) {
    return this.workers.has(accountId);
  }

  startAccountWorker(accountId: string, onReconnect: (accountId: string) => Promise<void>) {
    const worker = this.ensureWorker(accountId);
    if (worker.reconnectInterval) return;

    worker.reconnectInterval = setInterval(async () => {
      try {
        await onReconnect(accountId);
      } catch (error) {
        logger.warn({ err: error, accountId }, "Refer Project reconnect attempt failed");
      }
    }, 30_000);
  }

  stopAccountWorker(accountId: string) {
    const worker = this.workers.get(accountId);
    if (!worker) return;

    if (worker.reconnectInterval) clearInterval(worker.reconnectInterval);
    for (const timer of worker.tradeTimers.values()) {
      clearTimeout(timer);
    }
    this.workers.delete(accountId);
  }

  scheduleTimerClose(
    accountId: string,
    tradeId: string,
    closeAt: Date,
    onTimerClose: (tradeId: string, accountId: string) => Promise<void>,
  ) {
    const worker = this.ensureWorker(accountId);

    const msUntilClose = Math.max(0, closeAt.getTime() - Date.now());
    const existing = worker.tradeTimers.get(tradeId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      worker.tradeTimers.delete(tradeId);
      await onTimerClose(tradeId, accountId);
    }, msUntilClose);

    worker.tradeTimers.set(tradeId, timer);
  }

  clearTradeTimer(accountId: string, tradeId: string) {
    const worker = this.workers.get(accountId);
    const timer = worker?.tradeTimers.get(tradeId);
    if (timer) {
      clearTimeout(timer);
      worker?.tradeTimers.delete(tradeId);
    }
  }

  recover(
    accountIds: string[],
    trades: Array<{ accountId: string; tradeId: string; closeAt: Date }>,
    onReconnect: (accountId: string) => Promise<void>,
    onTimerClose: (tradeId: string, accountId: string) => Promise<void>,
  ) {
    for (const accountId of accountIds) {
      this.startAccountWorker(accountId, onReconnect);
    }

    for (const trade of trades) {
      this.scheduleTimerClose(trade.accountId, trade.tradeId, trade.closeAt, onTimerClose);
    }
  }
}
