import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Filter } from "lucide-react";
import { rpGet } from "./rpApi";

interface LogEntry {
  id: number; accountId: number | null; event: string; message: string;
  level: string; details: unknown; createdAt: string;
}

const EVENT_TYPES = ["ALL","LOGIN","LOGOUT","CONNECTION","DISCONNECTION","TRADE_OPEN","TRADE_CLOSE",
  "AI_DECISION","REJECTED_TRADE","MARGIN_ERROR","SPREAD_TOO_HIGH","SKIPPED_TRADE","TIMER_CLOSE",
  "SYSTEM_RESTART","ACCOUNT_ADDED","ACCOUNT_REMOVED","WORKER_START","WORKER_STOP","SETTINGS_UPDATED","ERROR"];

const levelColor = (level: string) =>
  level === "error" ? "text-red-400 bg-red-500/10 border-red-500/20" :
  level === "warn"  ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                      "text-muted-foreground bg-accent border-border";

const eventColor = (event: string) =>
  event.includes("OPEN")  || event === "CONNECTION"  || event === "WORKER_START" || event === "ACCOUNT_ADDED" ? "text-emerald-400" :
  event.includes("CLOSE") || event === "DISCONNECTION" || event === "WORKER_STOP" || event === "ACCOUNT_REMOVED" ? "text-amber-400" :
  event === "ERROR"       || event.includes("ERROR")   ? "text-red-400" :
  event === "SKIPPED_TRADE" || event === "REJECTED_TRADE" ? "text-muted-foreground" : "text-foreground";

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    const r = await rpGet("/api/refer-project/logs?limit=300");
    if (r.ok) setLogs(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const id = setInterval(load, 5_000);
    return () => clearInterval(id);
  }, [load, autoRefresh]);

  const filtered = logs
    .filter(l => levelFilter === "all" || l.level === levelFilter)
    .filter(l => eventFilter === "ALL"  || l.event === eventFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Event Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">All Refer Project events · {filtered.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
              autoRefresh ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            }`}>
            Live {autoRefresh ? "ON" : "OFF"}
          </button>
          <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="w-3 h-3" /> Level:
        </div>
        {["all","info","warn","error"].map(l => (
          <button key={l} onClick={() => setLevelFilter(l)}
            className={`px-3 py-1 text-xs rounded-lg border transition-all capitalize ${
              levelFilter === l ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            }`}>
            {l}
          </button>
        ))}
        <div className="ml-4">
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
            className="bg-accent border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary">
            {EVENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-card">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium w-36">Time</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium w-24">Level</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium w-36">Event</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium w-16">Account</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No log entries{levelFilter !== "all" || eventFilter !== "ALL" ? " matching filters" : " yet"}</td></tr>
              )}
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-2 font-mono text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${levelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className={`px-4 py-2 font-mono text-[10px] font-semibold ${eventColor(log.event)}`}>
                    {log.event}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {log.accountId ? `#${log.accountId}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground max-w-md truncate" title={log.message}>
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
