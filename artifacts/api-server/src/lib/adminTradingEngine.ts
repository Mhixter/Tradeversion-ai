/* In-memory admin test trading account — single live instance */

export interface AdminPosition {
  id:          string;
  symbol:      string;
  action:      "BUY" | "SELL";
  size:        number;
  openPrice:   number;
  currentPrice:number;
  sl:          number;
  tp:          number;
  pnl:         number;
  pips:        number;
  openedAt:    string;
  botId:       number | null;
  botName:     string;
  comment:     string;
}

export interface AdminTradeHistory {
  id:        string;
  symbol:    string;
  action:    "BUY" | "SELL";
  size:      number;
  openPrice: number;
  closePrice:number;
  pnl:       number;
  pips:      number;
  openedAt:  string;
  closedAt:  string;
  botName:   string;
}

export interface AdminAccount {
  balance:     number;
  equity:      number;
  margin:      number;
  freeMargin:  number;
  marginLevel: number;
  openPnl:     number;
  positions:   AdminPosition[];
  history:     AdminTradeHistory[];
  totalTrades: number;
  winTrades:   number;
  currency:    string;
  leverage:    number;
  accountNo:   string;
}

/* Base prices (updated per tick) */
const basePrices: Record<string, number> = {
  EURUSD: 1.08500, GBPUSD: 1.27430, USDJPY: 149.500, USDCHF: 0.90200,
  AUDUSD: 0.65810, USDCAD: 1.36420, NZDUSD: 0.60940, EURGBP: 0.85120,
  EURJPY: 162.200, GBPJPY: 190.250, XAUUSD: 2338.00, XAGUSD: 27.340,
  BTCUSD: 67800.0, ETHUSD: 3810.00, XRPUSD: 0.58200, NAS100: 19480.0,
  US30:   43220.0, SPX500: 5840.00, USOIL: 81.540,  BRENT: 85.120,
};

const volatility: Record<string, number> = {
  EURUSD: 0.00015, GBPUSD: 0.00018, USDJPY: 0.003, USDCHF: 0.00014,
  AUDUSD: 0.00016, USDCAD: 0.00017, NZDUSD: 0.00018, EURGBP: 0.00013,
  EURJPY: 0.003,   GBPJPY: 0.004,   XAUUSD: 0.20, XAGUSD: 0.015,
  BTCUSD: 50.0,    ETHUSD: 4.0,     XRPUSD: 0.0004, NAS100: 8.0,
  US30:   10.0,    SPX500: 2.5,     USOIL: 0.08, BRENT: 0.09,
};

const pipValue: Record<string, number> = {
  EURUSD: 10, GBPUSD: 10, USDJPY: 6.7, USDCHF: 11, AUDUSD: 10,
  USDCAD: 7.3, NZDUSD: 10, EURGBP: 12.7, EURJPY: 6.7, GBPJPY: 6.7,
  XAUUSD: 1, XAGUSD: 50, BTCUSD: 1, ETHUSD: 1, XRPUSD: 10,
  NAS100: 1, US30: 1, SPX500: 1, USOIL: 1000, BRENT: 1000,
};

const pipSize: Record<string, number> = {
  EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, USDCHF: 0.0001,
  AUDUSD: 0.0001, USDCAD: 0.0001, NZDUSD: 0.0001, EURGBP: 0.0001,
  EURJPY: 0.01,   GBPJPY: 0.01,   XAUUSD: 0.01, XAGUSD: 0.001,
  BTCUSD: 1.0,    ETHUSD: 0.01,   XRPUSD: 0.0001, NAS100: 0.1,
  US30:   1.0,    SPX500: 0.1,    USOIL: 0.01, BRENT: 0.01,
};

/* Tick the simulated market */
function tickPrices() {
  for (const sym of Object.keys(basePrices)) {
    const v    = volatility[sym] ?? 0.0001;
    const open = basePrices[sym];
    const drift = (open - basePrices[sym]) * 0.00005; /* tiny mean reversion */
    const noise = (Math.random() - 0.5) * 2 * v;
    basePrices[sym] = parseFloat((basePrices[sym] + drift + noise).toFixed(6));
  }
}

export function getLivePrice(symbol: string): number {
  return basePrices[symbol] ?? 0;
}

export function getAllPrices(): Record<string, number> {
  return { ...basePrices };
}

/* Admin account singleton */
const account: AdminAccount = {
  balance:    100_000,
  equity:     100_000,
  margin:     0,
  freeMargin: 100_000,
  marginLevel: 0,
  openPnl:    0,
  positions:  [],
  history:    [],
  totalTrades: 0,
  winTrades:   0,
  currency:   "USD",
  leverage:   100,
  accountNo:  "ADMIN-TEST-88001",
};

let posCounter = 1;

function calcPnl(pos: AdminPosition): { pnl: number; pips: number } {
  const cur   = basePrices[pos.symbol] ?? pos.openPrice;
  const ps    = pipSize[pos.symbol] ?? 0.0001;
  const pv    = pipValue[pos.symbol] ?? 10;
  const pips  = pos.action === "BUY"
    ? (cur - pos.openPrice) / ps
    : (pos.openPrice - cur) / ps;
  const pnl   = pips * pv * pos.size;
  return { pnl: parseFloat(pnl.toFixed(2)), pips: parseFloat(pips.toFixed(1)) };
}

function refreshAccount() {
  let openPnl = 0;
  let margin  = 0;
  account.positions.forEach(pos => {
    const cur = basePrices[pos.symbol] ?? pos.openPrice;
    pos.currentPrice = parseFloat(cur.toFixed(6));
    const { pnl, pips } = calcPnl(pos);
    pos.pnl  = pnl;
    pos.pips = pips;
    openPnl += pnl;
    margin  += (pos.openPrice * pos.size * 100_000) / account.leverage;

    /* Auto SL/TP */
    const ps = pipSize[pos.symbol] ?? 0.0001;
    if (pos.sl > 0) {
      if ((pos.action === "BUY"  && cur <= pos.sl) ||
          (pos.action === "SELL" && cur >= pos.sl)) {
        closePosition(pos.id, "SL hit");
      }
    }
    if (pos.tp > 0) {
      if ((pos.action === "BUY"  && cur >= pos.tp) ||
          (pos.action === "SELL" && cur <= pos.tp)) {
        closePosition(pos.id, "TP hit");
      }
    }
  });
  account.openPnl     = parseFloat(openPnl.toFixed(2));
  account.equity      = parseFloat((account.balance + openPnl).toFixed(2));
  account.margin      = parseFloat(margin.toFixed(2));
  account.freeMargin  = parseFloat((account.equity - margin).toFixed(2));
  account.marginLevel = margin > 0 ? parseFloat(((account.equity / margin) * 100).toFixed(1)) : 0;
}

export function openPosition(
  symbol: string, action: "BUY" | "SELL", size: number,
  sl: number, tp: number, botId: number | null, botName: string, comment: string,
): AdminPosition | { error: string } {
  if (account.freeMargin <= 0) return { error: "Insufficient free margin" };
  const price    = basePrices[symbol];
  if (!price)    return { error: `Unknown symbol: ${symbol}` };
  const entryPrice = action === "BUY"
    ? price + (pipSize[symbol] ?? 0.0001) * 1.5  /* spread */
    : price - (pipSize[symbol] ?? 0.0001) * 1.5;

  const pos: AdminPosition = {
    id:          `POS-${posCounter++}`,
    symbol, action, size,
    openPrice:   parseFloat(entryPrice.toFixed(6)),
    currentPrice: parseFloat(price.toFixed(6)),
    sl, tp,
    pnl:  0, pips: 0,
    openedAt: new Date().toISOString(),
    botId, botName, comment,
  };
  account.positions.push(pos);
  refreshAccount();
  return pos;
}

export function closePosition(posId: string, comment = "Manual close"): AdminTradeHistory | { error: string } {
  const idx = account.positions.findIndex(p => p.id === posId);
  if (idx === -1) return { error: "Position not found" };
  const pos = account.positions[idx];
  account.positions.splice(idx, 1);

  const closePrice = basePrices[pos.symbol] ?? pos.openPrice;
  const { pnl, pips } = calcPnl(pos);

  const hist: AdminTradeHistory = {
    id:         pos.id,
    symbol:     pos.symbol,
    action:     pos.action,
    size:       pos.size,
    openPrice:  pos.openPrice,
    closePrice: parseFloat(closePrice.toFixed(6)),
    pnl,
    pips,
    openedAt:   pos.openedAt,
    closedAt:   new Date().toISOString(),
    botName:    pos.botName,
  };
  account.history.unshift(hist);
  if (account.history.length > 100) account.history.pop();

  account.totalTrades++;
  if (pnl > 0) account.winTrades++;
  account.balance = parseFloat((account.balance + pnl).toFixed(2));

  refreshAccount();
  return hist;
}

export function closeAllPositions(): number {
  const ids = account.positions.map(p => p.id);
  ids.forEach(id => closePosition(id, "Close All"));
  return ids.length;
}

export function resetAccount(): void {
  account.balance    = 100_000;
  account.positions  = [];
  account.history    = [];
  account.totalTrades = 0;
  account.winTrades   = 0;
  refreshAccount();
}

export function getAccount(): AdminAccount {
  refreshAccount();
  return { ...account, positions: account.positions.map(p => ({ ...p })), history: account.history.slice(0, 20) };
}

/* Tick every 250ms */
setInterval(() => { tickPrices(); refreshAccount(); }, 250);
