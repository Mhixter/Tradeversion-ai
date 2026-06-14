/**
 * MetaApi Service — wraps real MetaApi REST API when METAAPI_TOKEN is set,
 * falls back to the simulation brokerService otherwise.
 *
 * MetaApi docs: https://metaapi.cloud/docs/client/
 */

import { brokerService, BrokerAccount, BrokerPosition, PlaceOrderRequest, OrderResult } from "./brokerService.js";

const METAAPI_BASE = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

function getToken(): string | null {
  return process.env.METAAPI_TOKEN ?? null;
}

function hasRealToken(): boolean {
  const t = getToken();
  return !!t && t.length > 10;
}

async function metaApiGet(path: string): Promise<any> {
  const token = getToken()!;
  const res = await fetch(`${METAAPI_BASE}${path}`, {
    headers: { "auth-token": token },
  });
  if (!res.ok) throw new Error(`MetaApi ${res.status}: ${await res.text()}`);
  return res.json();
}

async function metaApiPost(path: string, body: unknown): Promise<any> {
  const token = getToken()!;
  const res = await fetch(`${METAAPI_BASE}${path}`, {
    method: "POST",
    headers: { "auth-token": token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MetaApi ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getAccountInfo(metaApiAccountId: string): Promise<Partial<BrokerAccount> | null> {
  if (!hasRealToken()) return null;
  try {
    const info = await metaApiGet(`/users/current/accounts/${metaApiAccountId}/account-information`);
    return {
      balance:     info.balance ?? 0,
      equity:      info.equity ?? 0,
      margin:      info.margin ?? 0,
      freeMargin:  info.freeMargin ?? 0,
      marginLevel: info.marginLevel ?? 0,
      profit:      info.profit ?? 0,
      leverage:    info.leverage ?? 100,
      currency:    info.currency ?? "USD",
      isConnected: true,
      lastSyncAt:  new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getOpenPositions(metaApiAccountId: string): Promise<BrokerPosition[]> {
  if (!hasRealToken()) return [];
  try {
    const positions = await metaApiGet(`/users/current/accounts/${metaApiAccountId}/positions`);
    return (positions ?? []).map((p: any) => ({
      ticket:       String(p.id),
      symbol:       p.symbol,
      type:         p.type === "POSITION_TYPE_BUY" ? "BUY" : "SELL",
      volume:       p.volume,
      openPrice:    p.openPrice,
      currentPrice: p.currentPrice,
      sl:           p.stopLoss ?? 0,
      tp:           p.takeProfit ?? 0,
      profit:       p.profit,
      openTime:     p.time,
    }));
  } catch {
    return [];
  }
}

export async function placeOrder(
  metaApiAccountId: string,
  req: PlaceOrderRequest,
): Promise<OrderResult> {
  if (!hasRealToken()) {
    return { success: false, error: "MetaApi token not configured — paper trading only" };
  }
  try {
    const result = await metaApiPost(
      `/users/current/accounts/${metaApiAccountId}/trade`,
      {
        actionType: req.side === "BUY" ? "ORDER_TYPE_BUY" : "ORDER_TYPE_SELL",
        symbol:     req.symbol,
        volume:     req.volume,
        stopLoss:   req.sl,
        takeProfit: req.tp,
        comment:    req.comment ?? "TradeVision AI",
        magic:      req.magic ?? 0,
      },
    );
    return {
      success:    true,
      ticket:     String(result.orderId ?? result.positionId ?? ""),
      fillPrice:  result.openPrice,
      latencyMs:  result.serverTime ? Date.now() - new Date(result.serverTime).getTime() : 0,
    };
  } catch (err: any) {
    return { success: false, error: err.message ?? "MetaApi trade failed" };
  }
}

export async function listAccounts(): Promise<{ id: string; name: string; server: string; platform: string }[]> {
  if (!hasRealToken()) return [];
  try {
    const accounts = await metaApiGet("/users/current/accounts");
    return (accounts ?? []).map((a: any) => ({
      id:       a.id,
      name:     a.name,
      server:   a.server,
      platform: a.platform,
    }));
  } catch {
    return [];
  }
}

export { brokerService, hasRealToken };
