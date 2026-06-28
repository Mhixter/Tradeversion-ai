import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp, TrendingDown, Play, Square, RefreshCw,
  Minus, Zap, Bot, DollarSign, Activity, AlertTriangle,
  CheckCircle, Clock, Trash2, ChevronDown,
} from "lucide-react";
import { useLivePrices, ALL_SYMBOLS } from "@/hooks/useLivePrices";
import { buildAdminApiUrl } from "@/lib/adminApi";

async function api(method: string, path: string, body?: object) {
  const r = await fetch(buildAdminApiUrl(path), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

/* ── Types ───────────────────────────────────────────────────────────────── */
interface Position {
  id: string; symbol: string; action: "BUY" | "SELL"; size: number;
  openPrice: number; currentPrice: number; sl: number; tp: number;
  pnl: number; pips: number; openedAt: string; botName: string;
}
interface TradeHist {
  id: string; symbol: string; action: "BUY" | "SELL"; size: number;
  openPrice: number; closePrice: number; pnl: number; pips: number;
  closedAt: string; botName: string;
}
interface Account {
  balance: number; equity: number; margin: number;
  freeMargin: number; marginLevel: number; openPnl: number;
  positions: Position[]; history: TradeHist[];
  totalTrades: number; winTrades: number;
  accountNo: string; currency: string;
}
interface Bot { id: number; name: string; strategy: string; market: string; status: string; }

const SYMBOLS = ["EURUSD","GBPUSD","USDJPY","XAUUSD","BTCUSD","ETHUSD","NAS100","US30","USOIL","XAGUSD","USDCHF","AUDUSD","USDCAD","EURGBP","EURJPY","GBPJPY","XRPUSD","SPX500","BRENT","NZDUSD"];

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function pnlColor(v: number) { return v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-muted-foreground"; }
function pnlBg(v: number)    { return v > 0 ? "bg-emerald-500/10" : v < 0 ? "bg-red-500/10" : "bg-zinc-500/10"; }

/* ── Account stats bar ───────────────────────────────────────────────────── */
function AccountBar({ acct }: { acct: Account }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 p-4 bg-[#0d0e14] border-b border-border/60 text-xs font-mono">
      {[
        { label: "Account",    value: acct.accountNo,                           plain: true },
        { label: "Balance",    value: `$${fmt(acct.balance)}`,                  color: "text-foreground" },
        { label: "Equity",     value: `$${fmt(acct.equity)}`,                   color: acct.equity >= acct.balance ? "text-emerald-400" : "text-red-400" },
        { label: "Open P&L",   value: `${acct.openPnl >= 0 ? "+" : ""}$${fmt(acct.openPnl)}`, color: pnlColor(acct.openPnl) },
        { label: "Free Margin",value: `$${fmt(acct.freeMargin)}`,               color: "text-foreground" },
        { label: "Positions",  value: String(acct.positions.length),            color: acct.positions.length > 0 ? "text-amber-400" : "text-muted-foreground" },
        { label: "Win Rate",   value: acct.totalTrades > 0 ? `${Math.round((acct.winTrades / acct.totalTrades) * 100)}%` : "—", color: "text-primary" },
      ].map(({ label, value, color, plain }) => (
        <div key={label} className="flex flex-col">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
          <span className={`font-bold text-[11px] ${plain ? "text-muted-foreground" : (color ?? "text-foreground")}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Watchlist ───────────────────────────────────────────────────────────── */
function Watchlist({ onSelect, selected }: { onSelect: (s: string) => void; selected: string }) {
  const prices = useLivePrices(SYMBOLS);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide border-b border-border/50 flex items-center gap-1.5">
        <Activity className="w-3 h-3" /> Live Prices
      </div>
      <div className="flex-1 overflow-y-auto">
        {SYMBOLS.map(sym => {
          const p = prices.get(sym);
          if (!p) return null;
          const isUp   = p.direction === "up";
          const isDown = p.direction === "down";
          return (
            <button key={sym} onClick={() => onSelect(sym)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left border-b border-border/20 transition-colors hover:bg-accent/30 ${selected === sym ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
              <span className="text-[10px] font-bold text-foreground w-16 shrink-0">{sym}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className={`text-[10px] font-mono font-bold transition-colors duration-150 ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-foreground"}`}>
                  {p.bid.toFixed(p.digits)}
                </span>
                <span className={`text-[9px] ${p.changePct >= 0 ? "text-emerald-500" : "text-red-500"} w-12 text-right`}>
                  {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Trade form ──────────────────────────────────────────────────────────── */
function TradeForm({ symbol, bots, onTrade }: {
  symbol: string; bots: Bot[]; onTrade: () => void;
}) {
  const prices = useLivePrices([symbol]);
  const p      = prices.get(symbol);
  const [size,    setSize]    = useState("0.10");
  const [sl,      setSl]      = useState("0");
  const [tp,      setTp]      = useState("0");
  const [selBot,  setSelBot]  = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  const selectedBot = bots.find(b => b.id === selBot);

  const execute = async (action: "BUY" | "SELL") => {
    setLoading(true); setMsg(null);
    try {
      const result = await api("POST", "/admin-trading/open", {
        symbol, action,
        size:    parseFloat(size),
        sl:      parseFloat(sl),
        tp:      parseFloat(tp),
        botId:   selBot,
        botName: selectedBot?.name ?? "Manual",
        comment: selBot ? `Bot: ${selectedBot?.name}` : "Admin manual",
      });
      if (result.error) { setMsg({ ok: false, text: result.error }); }
      else              { setMsg({ ok: true,  text: `${action} ${size} ${symbol} @ ${result.openPrice}` }); onTrade(); }
    } catch { setMsg({ ok: false, text: "Connection error" }); }
    finally { setLoading(false); }
  };

  if (!p) return <div className="p-4 text-xs text-muted-foreground">Loading…</div>;

  return (
    <div className="p-4 space-y-3">
      {/* Live price display */}
      <div className="flex gap-2">
        <div className="flex-1 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">BID</p>
          <p className={`text-base font-mono font-black transition-colors duration-150 ${p.direction === "down" ? "text-red-400" : "text-foreground"}`}>
            {p.bid.toFixed(p.digits)}
          </p>
        </div>
        <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">ASK</p>
          <p className={`text-base font-mono font-black transition-colors duration-150 ${p.direction === "up" ? "text-emerald-400" : "text-foreground"}`}>
            {p.ask.toFixed(p.digits)}
          </p>
        </div>
      </div>

      {/* Symbol info */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>H: {p.high.toFixed(p.digits)}</span>
        <span className="font-bold text-foreground">{symbol}</span>
        <span>L: {p.low.toFixed(p.digits)}</span>
      </div>

      {/* Bot selector */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Link to Bot (optional)</label>
        <div className="relative">
          <select
            value={selBot ?? ""}
            onChange={e => setSelBot(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-7"
          >
            <option value="">Manual Trade</option>
            {bots.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.strategy})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Size (Lots)</label>
          <input value={size} onChange={e => setSize(e.target.value)} type="number" step="0.01" min="0.01"
            className="w-full bg-accent border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Stop Loss</label>
          <input value={sl} onChange={e => setSl(e.target.value)} type="number" step="0.0001" min="0"
            className="w-full bg-accent border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Take Profit</label>
          <input value={tp} onChange={e => setTp(e.target.value)} type="number" step="0.0001" min="0"
            className="w-full bg-accent border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      {/* Quick size buttons */}
      <div className="flex gap-1">
        {["0.01","0.05","0.10","0.50","1.00"].map(s => (
          <button key={s} onClick={() => setSize(s)}
            className={`flex-1 text-[9px] font-bold py-1 rounded-md border transition-colors ${size === s ? "bg-primary text-primary-foreground border-primary" : "bg-accent border-border text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* BUY / SELL */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => execute("BUY")} disabled={loading}
          className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm disabled:opacity-50 transition-colors flex flex-col items-center justify-center leading-tight">
          <span>BUY</span>
          <span className="text-[9px] font-mono opacity-80">{p.ask.toFixed(p.digits)}</span>
        </button>
        <button onClick={() => execute("SELL")} disabled={loading}
          className="h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm disabled:opacity-50 transition-colors flex flex-col items-center justify-center leading-tight">
          <span>SELL</span>
          <span className="text-[9px] font-mono opacity-80">{p.bid.toFixed(p.digits)}</span>
        </button>
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 ${msg.ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {msg.ok ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          {msg.text}
        </div>
      )}
    </div>
  );
}

/* ── Bot quick-trade panel ───────────────────────────────────────────────── */
function BotQuickTrade({ bots, onTrade }: { bots: Bot[]; onTrade: () => void }) {
  const prices  = useLivePrices();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, string>>({});

  const MARKET_SYMBOL: Record<string, string> = {
    Forex: "EURUSD", Gold: "XAUUSD", Crypto: "BTCUSD",
    Indices: "NAS100", Oil: "USOIL", Silver: "XAGUSD",
  };

  const botTrade = async (bot: Bot, action: "BUY" | "SELL") => {
    const key = `${bot.id}-${action}`;
    const sym = MARKET_SYMBOL[bot.market] ?? "EURUSD";
    setLoading(p => ({ ...p, [key]: true }));
    try {
      const result = await api("POST", "/admin-trading/open", {
        symbol: sym, action, size: 0.10,
        sl: 0, tp: 0, botId: bot.id, botName: bot.name,
        comment: `Bot test: ${bot.strategy}`,
      });
      const txt = result.error ? `Error: ${result.error}` : `${action} ${sym} @ ${result.openPrice}`;
      setResults(p => ({ ...p, [bot.id]: txt }));
      if (!result.error) onTrade();
    } finally {
      setLoading(p => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-bold">Bot Quick-Trade</h3>
        <span className="text-[9px] text-muted-foreground ml-1">Execute any bot on its assigned market instantly</span>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {bots.map(bot => {
          const sym = MARKET_SYMBOL[bot.market] ?? "EURUSD";
          const p   = prices.get(sym);
          return (
            <div key={bot.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/40 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{bot.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">{sym}</span>
                  {p && <span className={`text-[9px] font-mono font-bold ${p.direction === "up" ? "text-emerald-400" : p.direction === "down" ? "text-red-400" : "text-foreground"}`}>{p.bid.toFixed(p.digits)}</span>}
                </div>
                {results[bot.id] && <p className="text-[9px] text-amber-400 mt-0.5 truncate">{results[bot.id]}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => botTrade(bot, "BUY")} disabled={loading[`${bot.id}-BUY`]}
                  className="px-3 py-1.5 text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-colors">
                  BUY
                </button>
                <button onClick={() => botTrade(bot, "SELL")} disabled={loading[`${bot.id}-SELL`]}
                  className="px-3 py-1.5 text-[10px] font-black bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 transition-colors">
                  SELL
                </button>
              </div>
            </div>
          );
        })}
        {bots.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No bots available</p>}
      </div>
    </div>
  );
}

/* ── Open positions ──────────────────────────────────────────────────────── */
function OpenPositions({ positions, onClose, onCloseAll }: {
  positions: Position[]; onClose: (id: string) => void; onCloseAll: () => void;
}) {
  const prices = useLivePrices(positions.map(p => p.symbol));

  /* Update PnL live from the price hook */
  const livePositions = positions.map(pos => {
    const lp = prices.get(pos.symbol);
    if (!lp) return pos;
    const ps = { EURUSD:0.0001,GBPUSD:0.0001,USDJPY:0.01,XAUUSD:0.01,BTCUSD:1,ETHUSD:0.01,NAS100:0.1,US30:1,USOIL:0.01,XAGUSD:0.001,USDCHF:0.0001,AUDUSD:0.0001,USDCAD:0.0001,EURGBP:0.0001,EURJPY:0.01,GBPJPY:0.01,XRPUSD:0.0001,SPX500:0.1,BRENT:0.01,NZDUSD:0.0001 } as Record<string,number>;
    const pv = { EURUSD:10,GBPUSD:10,USDJPY:6.7,XAUUSD:1,BTCUSD:1,ETHUSD:1,NAS100:1,US30:1,USOIL:1000,XAGUSD:50,USDCHF:11,AUDUSD:10,USDCAD:7.3,EURGBP:12.7,EURJPY:6.7,GBPJPY:6.7,XRPUSD:10,SPX500:1,BRENT:1000,NZDUSD:10 } as Record<string,number>;
    const cur  = pos.action === "BUY" ? lp.bid : lp.ask;
    const pips = pos.action === "BUY" ? (cur - pos.openPrice) / (ps[pos.symbol]??0.0001) : (pos.openPrice - cur) / (ps[pos.symbol]??0.0001);
    const pnl  = pips * (pv[pos.symbol]??10) * pos.size;
    return { ...pos, currentPrice: cur, pnl: parseFloat(pnl.toFixed(2)), pips: parseFloat(pips.toFixed(1)) };
  });

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <h3 className="text-xs font-bold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          Open Positions ({positions.length})
        </h3>
        {positions.length > 0 && (
          <button onClick={onCloseAll}
            className="text-[9px] px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-colors">
            Close All
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-1.5">Symbol</th>
              <th className="text-center px-2 py-1.5">Type</th>
              <th className="text-right px-2 py-1.5">Size</th>
              <th className="text-right px-2 py-1.5">Open</th>
              <th className="text-right px-2 py-1.5">Current</th>
              <th className="text-right px-2 py-1.5">Pips</th>
              <th className="text-right px-3 py-1.5">P&L</th>
              <th className="text-left px-3 py-1.5">Bot</th>
              <th className="text-center px-2 py-1.5">Close</th>
            </tr>
          </thead>
          <tbody>
            {livePositions.map(pos => (
              <tr key={pos.id} className={`border-b border-border/20 transition-colors ${pos.pnl > 0 ? "bg-emerald-500/[0.02]" : pos.pnl < 0 ? "bg-red-500/[0.02]" : ""}`}>
                <td className="px-4 py-2 text-xs font-bold">{pos.symbol}</td>
                <td className="px-2 py-2 text-center">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${pos.action === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {pos.action}
                  </span>
                </td>
                <td className="px-2 py-2 text-[10px] text-right font-mono">{pos.size.toFixed(2)}</td>
                <td className="px-2 py-2 text-[10px] text-right font-mono text-muted-foreground">{pos.openPrice.toFixed(5)}</td>
                <td className={`px-2 py-2 text-[10px] text-right font-mono font-bold transition-colors duration-150 ${pos.pnl > 0 ? "text-emerald-400" : pos.pnl < 0 ? "text-red-400" : "text-foreground"}`}>
                  {pos.currentPrice.toFixed(5)}
                </td>
                <td className={`px-2 py-2 text-[10px] text-right font-mono ${pos.pips > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pos.pips > 0 ? "+" : ""}{pos.pips.toFixed(1)}
                </td>
                <td className={`px-3 py-2 text-[10px] text-right font-mono font-black ${pnlColor(pos.pnl)}`}>
                  {pos.pnl >= 0 ? "+" : ""}${fmt(pos.pnl)}
                </td>
                <td className="px-3 py-2 text-[9px] text-muted-foreground truncate max-w-[80px]">{pos.botName}</td>
                <td className="px-2 py-2 text-center">
                  <button onClick={() => onClose(pos.id)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/30 text-red-400 mx-auto transition-colors">
                    <Square className="w-2.5 h-2.5" />
                  </button>
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">No open positions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Trade history ───────────────────────────────────────────────────────── */
function TradeHistory({ history }: { history: TradeHist[] }) {
  return (
    <div>
      <div className="px-4 py-2 border-b border-border/50">
        <h3 className="text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />Trade History ({history.length})
        </h3>
      </div>
      <div className="overflow-x-auto max-h-52 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-card/90 backdrop-blur-sm">
            <tr className="border-b border-border/30 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-1.5">Symbol</th>
              <th className="text-center px-2 py-1.5">Type</th>
              <th className="text-right px-2 py-1.5">Size</th>
              <th className="text-right px-2 py-1.5">Open</th>
              <th className="text-right px-2 py-1.5">Close</th>
              <th className="text-right px-2 py-1.5">Pips</th>
              <th className="text-right px-3 py-1.5">P&L</th>
              <th className="text-left px-3 py-1.5">Bot</th>
              <th className="text-right px-3 py-1.5">Closed</th>
            </tr>
          </thead>
          <tbody>
            {history.map(t => (
              <tr key={t.id} className={`border-b border-border/20 ${pnlBg(t.pnl)}/5`}>
                <td className="px-4 py-1.5 text-xs font-bold">{t.symbol}</td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${t.action === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{t.action}</span>
                </td>
                <td className="px-2 py-1.5 text-[10px] text-right font-mono">{t.size.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-[10px] text-right font-mono text-muted-foreground">{t.openPrice.toFixed(5)}</td>
                <td className="px-2 py-1.5 text-[10px] text-right font-mono text-muted-foreground">{t.closePrice.toFixed(5)}</td>
                <td className={`px-2 py-1.5 text-[10px] text-right font-mono ${t.pips > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {t.pips > 0 ? "+" : ""}{t.pips.toFixed(1)}
                </td>
                <td className={`px-3 py-1.5 text-[10px] text-right font-mono font-black ${pnlColor(t.pnl)}`}>
                  {t.pnl >= 0 ? "+" : ""}${fmt(t.pnl)}
                </td>
                <td className="px-3 py-1.5 text-[9px] text-muted-foreground truncate max-w-[80px]">{t.botName}</td>
                <td className="px-3 py-1.5 text-[9px] text-muted-foreground text-right">{new Date(t.closedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-xs text-muted-foreground">No closed trades yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main terminal ───────────────────────────────────────────────────────── */
export function LiveTradingTerminal() {
  const [acct,     setAcct]     = useState<Account | null>(null);
  const [bots,     setBots]     = useState<Bot[]>([]);
  const [symbol,   setSymbol]   = useState("EURUSD");
  const [view,     setView]     = useState<"trade" | "bots">("trade");
  const [resetting,setResetting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAcct = useCallback(async () => {
    try {
      const a = await api("GET", "/admin-trading/account");
      if (!a.error) setAcct(a);
    } catch {}
  }, []);

  useEffect(() => {
    api("GET", "/company-admin/bots").then(b => { if (Array.isArray(b)) setBots(b); });
    fetchAcct();
    /* Poll account every 500 ms for fast P&L updates */
    pollRef.current = setInterval(fetchAcct, 500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchAcct]);

  const closePos = async (id: string) => {
    await api("POST", `/admin-trading/close/${id}`);
    fetchAcct();
  };
  const closeAll = async () => {
    await api("POST", "/admin-trading/close-all");
    fetchAcct();
  };
  const resetAcct = async () => {
    setResetting(true);
    await api("POST", "/admin-trading/reset");
    await fetchAcct();
    setResetting(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a0b0f] rounded-2xl border border-border/50 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black">Admin Live Test Terminal</h2>
            <p className="text-[10px] text-muted-foreground">Paper trading account — test all bots before user deployment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0 bg-accent/40 rounded-lg p-1">
            {(["trade","bots"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md capitalize transition-all ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "trade" ? "Trade Terminal" : "Bot Quick-Trade"}
              </button>
            ))}
          </div>
          <button onClick={resetAcct} disabled={resetting}
            className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
            Reset ($100k)
          </button>
        </div>
      </div>

      {/* Account stats */}
      {acct && <AccountBar acct={acct} />}

      {/* Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Watchlist */}
        <div className="w-44 shrink-0 border-r border-border/40 overflow-y-auto">
          <Watchlist onSelect={setSymbol} selected={symbol} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {view === "trade" ? (
            /* Trade terminal + positions */
            <div className="flex flex-1 min-h-0">
              {/* Trade form */}
              <div className="w-64 shrink-0 border-r border-border/40 overflow-y-auto">
                <TradeForm symbol={symbol} bots={bots} onTrade={fetchAcct} />
              </div>

              {/* Positions + history */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {acct && (
                    <OpenPositions
                      positions={acct.positions}
                      onClose={closePos}
                      onCloseAll={closeAll}
                    />
                  )}
                </div>
                <div className="border-t border-border/40 flex-shrink-0 max-h-64 overflow-y-auto">
                  {acct && <TradeHistory history={acct.history} />}
                </div>
              </div>
            </div>
          ) : (
            /* Bot quick-trade */
            <div className="flex-1 overflow-y-auto">
              <BotQuickTrade bots={bots} onTrade={fetchAcct} />
              {acct && (
                <div className="border-t border-border/40">
                  <OpenPositions positions={acct.positions} onClose={closePos} onCloseAll={closeAll} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
