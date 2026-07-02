import { useEffect, useState, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Activity, Zap, Target, BarChart2, DollarSign } from "lucide-react";
import { rpGet } from "./rpApi";

interface DashboardData {
  connectedAccounts: number; runningAccounts: number; stoppedAccounts: number;
  openPositions: number; tradesToday: number; closedTrades: number;
  totalLots: number; floatingPnl: number; todayProfit: number; todayLoss: number;
  aiConfidence: number; directionMode: string; runningSymbols: string[];
  enabled: boolean;
}

function MetricCard({ label, value, sub, color = "text-foreground", icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await rpGet("/api/refer-project/dashboard");
      if (r.ok) { setData(await r.json()); setLastUpdate(new Date()); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 5_000); return () => clearInterval(id); }, [load]);

  if (loading && !data) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading dashboard…</div>
  );

  if (!data) return null;

  const pnlColor  = data.floatingPnl >= 0 ? "text-emerald-400" : "text-red-400";
  const profColor = data.todayProfit >= 0 ? "text-emerald-400" : "text-foreground";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Refer Project Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time overview · XM MT5 Simulation Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            data.enabled ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-accent border-border text-muted-foreground"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.enabled ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`} />
            {data.enabled ? "MODULE ACTIVE" : "MODULE DISABLED"}
          </div>
          <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Accounts row */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Connected Accounts" value={data.connectedAccounts} icon={Activity} />
        <MetricCard label="Running Accounts"   value={data.runningAccounts}   color="text-emerald-400" icon={Zap} />
        <MetricCard label="Stopped Accounts"   value={data.stoppedAccounts}   color={data.stoppedAccounts > 0 ? "text-amber-400" : "text-foreground"} icon={Target} />
      </div>

      {/* Trade metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Open Positions"  value={data.openPositions}  color="text-primary" />
        <MetricCard label="Trades Today"    value={data.tradesToday} />
        <MetricCard label="Closed Trades"   value={data.closedTrades} />
        <MetricCard label="Total Lots"      value={data.totalLots.toFixed(2)} sub="Standard lots" />
      </div>

      {/* P&L row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Current Floating P&L"
          value={`${data.floatingPnl >= 0 ? "+" : ""}$${data.floatingPnl.toFixed(2)}`}
          color={pnlColor}
          icon={DollarSign}
        />
        <MetricCard
          label="Today's Profit"
          value={`+$${data.todayProfit.toFixed(2)}`}
          color="text-emerald-400"
          icon={TrendingUp}
        />
        <MetricCard
          label="Today's Loss"
          value={data.todayLoss < 0 ? `-$${Math.abs(data.todayLoss).toFixed(2)}` : "$0.00"}
          color={data.todayLoss < 0 ? "text-red-400" : "text-foreground"}
          icon={TrendingDown}
        />
        <MetricCard
          label="AI Confidence"
          value={`${data.aiConfidence.toFixed(1)}%`}
          sub={data.aiConfidence >= 80 ? "Strong" : data.aiConfidence >= 65 ? "Medium" : "Low"}
          color={data.aiConfidence >= 80 ? "text-emerald-400" : data.aiConfidence >= 65 ? "text-amber-400" : "text-red-400"}
          icon={BarChart2}
        />
      </div>

      {/* Direction + Symbols */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-3">Market Direction Mode</p>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-black ${data.directionMode === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
              {data.directionMode}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.directionMode === "BUY" ? "Only opening BUY positions" : "Only opening SELL positions"}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-3">Running Symbols ({data.runningSymbols.length})</p>
          {data.runningSymbols.length === 0 ? (
            <p className="text-xs text-muted-foreground">No open positions</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.runningSymbols.map(sym => (
                <span key={sym} className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded-md">
                  {sym}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {lastUpdate && (
        <p className="text-[10px] text-muted-foreground text-right">
          Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refreshes every 5s
        </p>
      )}
    </div>
  );
}
