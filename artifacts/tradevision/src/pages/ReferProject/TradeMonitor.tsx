import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Clock } from "lucide-react";
import { rpGet } from "./rpApi";

interface Position {
  id: number; accountId: number; accountName: string; ticket: string;
  symbol: string; direction: string; lotSize: number; openPrice: number;
  closePrice: number | null; currentPrice: number | null; profit: number;
  openTime: string; closeTime: string | null; closeAfterMinutes: number;
  remainingSeconds: number; status: string; closeReason: string | null;
  aiConfidence: number | null;
}

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

export default function TradeMonitor() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const url = filter === "all" ? "/api/refer-project/positions" : `/api/refer-project/positions?status=${filter}`;
    const r = await rpGet(url);
    if (r.ok) setPositions(await r.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); const id = setInterval(load, 5_000); return () => clearInterval(id); }, [load]);

  const filtered = filter === "all" ? positions : positions.filter(p => p.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Trade Monitor</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time position tracking · Auto-refreshes every 5s</p>
        </div>
        <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Close Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={13} className="text-center py-12 text-muted-foreground">No positions</td></tr>
            )}
            {filtered.map(pos => {
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
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(pos.openTime).toLocaleTimeString()}
                  </td>
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
                  <td className="px-4 py-2.5 text-muted-foreground capitalize">{pos.closeReason ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
