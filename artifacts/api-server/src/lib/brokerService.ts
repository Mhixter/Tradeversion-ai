/**
 * BrokerConnectionService — MetaApi wrapper (simulated for dev/paper).
 * Implements all spec-required functions. Production swap: replace
 * simulated* methods with real MetaApi SDK calls.
 */

export interface BrokerAccount {
  id:            number;
  broker:        string;
  platform:      "MT4" | "MT5";
  accountNumber: string;
  server:        string;
  equity:        number;
  balance:       number;
  margin:        number;
  freeMargin:    number;
  marginLevel:   number;
  profit:        number;
  leverage:      number;
  currency:      string;
  status:        "LIVE" | "DEMO" | "DISCONNECTED";
  isConnected:   boolean;
  lastSyncAt:    string | null;
}

export interface BrokerPosition {
  ticket:    string;
  symbol:    string;
  type:      "BUY" | "SELL";
  volume:    number;
  openPrice: number;
  currentPrice: number;
  sl:        number;
  tp:        number;
  profit:    number;
  openTime:  string;
}

export interface BrokerOrder {
  ticket:    string;
  symbol:    string;
  type:      string;
  volume:    number;
  price:     number;
  sl:        number;
  tp:        number;
  status:    string;
  time:      string;
}

export interface PlaceOrderRequest {
  symbol:    string;
  side:      "BUY" | "SELL";
  volume:    number;
  price?:    number;
  sl?:       number;
  tp?:       number;
  comment?:  string;
  magic?:    number;
}

export interface OrderResult {
  success:       boolean;
  ticket?:       string;
  fillPrice?:    number;
  latencyMs?:    number;
  error?:        string;
}

/* In-memory broker state for simulated paper trading */
const connectedAccounts = new Map<number, BrokerAccount>();
const openPositions      = new Map<number, BrokerPosition[]>();
let ticketCounter = 100000;

function nextTicket(): string { return String(++ticketCounter); }

export class BrokerConnectionService {
  connectAccount(account: Omit<BrokerAccount, "equity" | "balance" | "margin" | "freeMargin" | "marginLevel" | "profit" | "leverage" | "currency" | "isConnected" | "lastSyncAt">): BrokerAccount {
    const connected: BrokerAccount = {
      ...account,
      equity:      250_000,
      balance:     245_000,
      margin:      18_500,
      freeMargin:  226_500,
      marginLevel: 13.51,
      profit:      5_000,
      leverage:    100,
      currency:    "USD",
      isConnected: true,
      lastSyncAt:  new Date().toISOString(),
    };
    connectedAccounts.set(account.id, connected);
    openPositions.set(account.id, []);
    return connected;
  }

  disconnectAccount(id: number): boolean {
    const acct = connectedAccounts.get(id);
    if (!acct) return false;
    acct.isConnected = false;
    acct.status = "DISCONNECTED";
    return true;
  }

  reconnectAccount(id: number): boolean {
    const acct = connectedAccounts.get(id);
    if (!acct) return false;
    acct.isConnected = true;
    acct.status = "LIVE";
    acct.lastSyncAt = new Date().toISOString();
    return true;
  }

  syncAccount(id: number): BrokerAccount | null {
    const acct = connectedAccounts.get(id);
    if (!acct) return null;
    const positions = openPositions.get(id) ?? [];
    const openProfit = positions.reduce((s, p) => s + p.profit, 0);
    acct.profit    = parseFloat(openProfit.toFixed(2));
    acct.equity    = parseFloat((acct.balance + openProfit).toFixed(2));
    acct.lastSyncAt = new Date().toISOString();
    return { ...acct };
  }

  getBalance(id: number): number | null {
    return connectedAccounts.get(id)?.balance ?? null;
  }

  getEquity(id: number): number | null {
    return connectedAccounts.get(id)?.equity ?? null;
  }

  getMargin(id: number): number | null {
    return connectedAccounts.get(id)?.margin ?? null;
  }

  getPositions(id: number): BrokerPosition[] {
    return openPositions.get(id) ?? [];
  }

  getOrders(_id: number): BrokerOrder[] { return []; }

  getTradeHistory(_id: number): BrokerPosition[] { return []; }

  placeBuyOrder(id: number, req: PlaceOrderRequest): OrderResult {
    return this._placeOrder(id, "BUY", req);
  }

  placeSellOrder(id: number, req: PlaceOrderRequest): OrderResult {
    return this._placeOrder(id, "SELL", req);
  }

  private _placeOrder(id: number, side: "BUY" | "SELL", req: PlaceOrderRequest): OrderResult {
    const acct = connectedAccounts.get(id);
    if (!acct || !acct.isConnected) return { success: false, error: "Account not connected" };
    const start = Date.now();
    const spread = 0.0002;
    const fillPrice = (req.price ?? 1.08500) + (side === "BUY" ? spread : -spread);
    const pos: BrokerPosition = {
      ticket:       nextTicket(),
      symbol:       req.symbol,
      type:         side,
      volume:       req.volume,
      openPrice:    parseFloat(fillPrice.toFixed(5)),
      currentPrice: parseFloat(fillPrice.toFixed(5)),
      sl:           req.sl ?? 0,
      tp:           req.tp ?? 0,
      profit:       0,
      openTime:     new Date().toISOString(),
    };
    const positions = openPositions.get(id) ?? [];
    positions.push(pos);
    openPositions.set(id, positions);
    const latencyMs = Date.now() - start + Math.floor(Math.random() * 80 + 10);
    return { success: true, ticket: pos.ticket, fillPrice: pos.openPrice, latencyMs };
  }

  modifyOrder(id: number, ticket: string, sl: number, tp: number): boolean {
    const positions = openPositions.get(id) ?? [];
    const pos = positions.find(p => p.ticket === ticket);
    if (!pos) return false;
    pos.sl = sl;
    pos.tp = tp;
    return true;
  }

  closeOrder(id: number, ticket: string): OrderResult {
    const positions = openPositions.get(id) ?? [];
    const idx = positions.findIndex(p => p.ticket === ticket);
    if (idx === -1) return { success: false, error: "Position not found" };
    const pos = positions[idx];
    positions.splice(idx, 1);
    openPositions.set(id, positions);
    return { success: true, ticket, fillPrice: pos.currentPrice, latencyMs: 12 };
  }

  closeAllOrders(id: number): { success: boolean; closed: number } {
    const positions = openPositions.get(id) ?? [];
    const count = positions.length;
    openPositions.set(id, []);
    return { success: true, closed: count };
  }

  getConnectedAccount(id: number): BrokerAccount | null {
    return connectedAccounts.get(id) ?? null;
  }
}

export const brokerService = new BrokerConnectionService();
