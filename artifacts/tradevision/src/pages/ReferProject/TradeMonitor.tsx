import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Clock, Wifi, Bot } from "lucide-react";
import { rpGet } from "./rpApi";

/* ── Bot positions (from our rp_positions table) ──────────────────────── */
interface Position {
  id: number; accountId: number; accountName: string; ticket: string;
  symbol: string; direction: string; lotSize: number; openPrice: number;
  closePrice: number | null; currentPrice: number | null; profit: number;
  openTime: string; closeTime: string | null; closeAfterMinutes: number;
  remainingSeconds: number; status: string; closeReason: string | null;
  aiConfidence: number | null;
}

/* ── Real MT5 deals (from MetaApi history API) ───────────────────────── */
interface MT5Deal {
  id: string; symbol: string; type: string; entry: string;
  volume: number; price: number; profit: number; commission: number;
  swap: number; time: string;
}
interface MT5Position {
  id: string; symbol: string; type: string; volume: number;
  openPrice: number; currentPrice: number; profit: number;
  commission: number; swap: number; time: string;
}
interface Account { id: number; accountName: string; metaApiAccountId?: string; }

function CountdownTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const urgent = seconds < 60;
  return (
    <span className={`font-mono text-xs ${urgent ? "text-red-400" : seconds < 180 ? "text-amber-400" : "text-foreground"}`}>
      {mins}:{String(secs).padStart(2,"0")}
    </span>
  );
}

function MT5TypeBadge({ type }: { type: string }) {
  const isBuy = type.includes("BUY");
  const isSell = type.includes("SELL");
  return (
    <span className={`font-bold text-xs ${isBuy ? "text-emerald-400" : isSell ? "text-red-400" : "text-muted-foreground"}`}>
      {isBuy ? "BUY" : isSell ? "SELL" : type.replace("DEAL_TYPE_","").replace("POSITION_TYPE_","")}
    </span>
  );
}

type Tab = "real" | "bot";

export default function TradeMonitor() {
  const [tab, setTab] = useState<Tab>("real");

  /* Bot positions state */
  const [positions, setPositions] = useState<Position[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [loadingBot, setLoadingBot] = useState(true);

  /* Real MT5 state */
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [mt5Deals, setMt5Deals] = useState<MT5Deal[]>([]);
  const [mt5Positions, setMt5Positions] = useState<MT5Position[]>([]);
  const [mt5Msg, setMt5Msg] = useState<string>("");
  const [loadingMt5, setLoadingMt5] = useState(false);
  const [days, setDays] = useState(30);

  /* Load bot positions */
  const loadBot = useCallback(async () => {
    const url = filter === "all" ? "/api/refer-project/positions" : `/api/refer-project/positions?status=${filter}`;
    const r = await rpGet(url);
    if (r.ok) setPositions(await r.json());
    setLoadingBot(false);
  }, [filter]);

  /* Load account list */
  const loadAccounts = useCallback(async () => {
    const r = await rpGet("/api/refer-project/accounts");
    if (r.ok) {
      const data: Account[] = await r.json();
      setAccounts(data);
      if (!selectedAccountId && data.length > 0) setSelectedAccountId(data[0].id);
    }
  }, [selectedAccountId]);

  /* Load real MT5 history */
  const loadMt5 = useCallback(async () => {
    if (!selectedAccountId) return;
    setLoadingMt5(true);
    setMt5Msg("");
    try {
      const r = await rpGet(`/api/refer-project/accounts/${selectedAccountId}/mt5-history?days=${days}`);
      if (r.ok) {
        const data = await r.json();
        setMt5Deals(data.deals ?? []);
        setMt5Positions(data.positions ?? []);
        if (data.message) setMt5Msg(data.message);
      } else {
        const err = await r.json().catch(() => ({}));
        setMt5Msg(err.details ?? err.error ?? "Failed to load MT5 history");
      }
    } catch (e) {
      setMt5Msg(String(e));
    }
    setLoadingMt5(false);
  }, [selectedAccountId, days]);

  useEffect(() => { loadAccounts(); }, []);
  useEffect(() => { loadBot(); const id = setInterval(loadBot, 5_000); return () => clearInterval(id); }, [loadBot]);
  useEffect(() => { if (tab === "real") loadMt5(); }, [tab, loadMt5]);

  const botFiltered = filter === "all" ? positions : positions.filter(p => p.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Trade Monitor</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tab === "real" ? "Live data from your XM MT5 account via MetaApi" : "Bot positions · Auto-refreshes every 5s"}
          </p>
        </div>
        <button
          onClick={tab === "real" ? loadMt5 : loadBot}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loadingMt5 || loadingBot) ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab("real")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            tab === "real" ? "bg-primary/10 border border-primary/30 text-primary" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Wifi className="w-3 h-3" /> Real MT5 Account
        </button>
        <button
          onClick={() => setTab("bot")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            tab === "bot" ? "bg-primary/10 border border-primary/30 text-primary" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Bot className="w-3 h-3" /> Bot Trades
        </button>
      </div>

      {/* ── Real MT5 Tab ─────────────────────────────────────────────────── */}
      {tab === "real" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {accounts.length > 1 && (
              <select
                value={selectedAccountId ?? ""}
                onChange={e => setSelectedAccountId(Number(e.target.value))}
                className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
              >
                {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
              </select>
            )}
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
            >
              {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
            </select>
            <button
              onClick={loadMt5}
              disabled={loadingMt5}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loadingMt5 ? "Loading…" : "Load History"}
            </button>
          </div>

          {mt5Msg && (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              {mt5Msg}
            </div>
          )}

          {/* Open Positions */}
          {mt5Positions.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Open Positions ({mt5Positions.length})
              </h2>
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-accent/30">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Ticket</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Pair</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Type</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Volume</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Open Price</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Current Price</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">P&L</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Open Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mt5Positions.map(p => {
                      const pnl = p.profit + p.commission + p.swap;
                      return (
                        <tr key={p.id} className="border-b border-border/40 hover:bg-accent/20">
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{p.id}</td>
                          <td className="px-4 py-2.5 font-mono font-semibold">{p.symbol}</td>
                          <td className="px-4 py-2.5"><MT5TypeBadge type={p.type} /></td>
                          <td className="px-4 py-2.5 font-mono">{p.volume.toFixed(2)}</td>
                          <td className="px-4 py-2.5 font-mono">{p.openPrice.toFixed(5)}</td>
                          <td className="px-4 py-2.5 font-mono">{p.currentPrice.toFixed(5)}</td>
                          <td className={`px-4 py-2.5 font-mono font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{new Date(p.time).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deal History */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Trade History — {mt5Deals.length} deals
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Deal ID</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Pair</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Type</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Entry</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Volume</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Price</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Profit</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Commission</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mt5Deals.length === 0 && !loadingMt5 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-muted-foreground">
                        {mt5Msg ? mt5Msg : "No trade history found. Click \"Load History\" to fetch from MetaApi."}
                      </td>
                    </tr>
                  )}
                  {loadingMt5 && (
                    <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading from MetaApi…</td></tr>
                  )}
                  {!loadingMt5 && mt5Deals.map(d => {
                    const pnlColor = d.profit >= 0 ? "text-emerald-400" : "text-red-400";
                    const isIn = d.entry?.includes("IN");
                    return (
                      <tr key={d.id} className={`border-b border-border/40 hover:bg-accent/20 ${isIn ? "" : "opacity-70"}`}>
                        <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.id}</td>
                        <td className="px-4 py-2.5 font-mono font-semibold">{d.symbol}</td>
                        <td className="px-4 py-2.5"><MT5TypeBadge type={d.type} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            isIn ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {d.entry?.replace("DEAL_ENTRY_","") ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono">{d.volume.toFixed(2)}</td>
                        <td className="px-4 py-2.5 font-mono">{d.price.toFixed(5)}</td>
                        <td className={`px-4 py-2.5 font-mono font-semibold ${pnlColor}`}>
                          {d.profit !== 0 ? `${d.profit >= 0 ? "+" : ""}${d.profit.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-muted-foreground">
                          {d.commission !== 0 ? d.commission.toFixed(2) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{new Date(d.time).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Bot Trades Tab ────────────────────────────────────────────────── */}
      {tab === "bot" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["all","open","closed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all capitalize ${
                  filter === f ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                }`}>
                {f} ({f === "all" ? positions.length : positions.filter(p => p.status === f).length})
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ticket</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Account</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Pair</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Dir</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Lot</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Open Price</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Current/Close</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Open Time</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Remaining</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">P&L</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">AI %</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {botFiltered.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-12 text-muted-foreground">No bot positions</td></tr>
                )}
                {botFiltered.map(pos => {
                  const pnlColor = pos.profit >= 0 ? "text-emerald-400" : "text-red-400";
                  const dirColor = pos.direction === "BUY" ? "text-emerald-400" : "text-red-400";
                  return (
                    <tr key={pos.id} className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{pos.ticket.slice(0, 12)}…</td>
                      <td className="px-4 py-2.5">{pos.accountName}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold">{pos.symbol}</td>
                      <td className={`px-4 py-2.5 font-bold ${dirColor}`}>{pos.direction}</td>
                      <td className="px-4 py-2.5 font-mono">{pos.lotSize.toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-mono">{pos.openPrice.toFixed(5)}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">
                        {pos.status === "open" ? (pos.currentPrice?.toFixed(5) ?? "—") : (pos.closePrice?.toFixed(5) ?? "—")}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{new Date(pos.openTime).toLocaleTimeString()}</td>
                      <td className="px-4 py-2.5">
                        {pos.status === "open"
                          ? <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /><CountdownTimer seconds={pos.remainingSeconds} /></div>
                          : <span className="text-muted-foreground">Closed</span>}
                      </td>
                      <td className={`px-4 py-2.5 font-mono font-semibold ${pnlColor}`}>
                        {pos.profit >= 0 ? "+" : ""}{pos.profit.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">
                        {pos.aiConfidence != null ? (
                          <span className={`font-mono ${pos.aiConfidence >= 80 ? "text-emerald-400" : pos.aiConfidence >= 65 ? "text-amber-400" : "text-muted-foreground"}`}>
                            {pos.aiConfidence.toFixed(0)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          pos.status === "open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-accent text-muted-foreground border border-border"
                        }`}>
                          {pos.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
