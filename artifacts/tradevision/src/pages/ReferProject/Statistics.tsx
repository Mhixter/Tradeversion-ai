import { useEffect, useState } from "react";
import { RefreshCw, Trophy, Target, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { rpGet } from "./rpApi";

interface Stats {
  totalTrades: number; winningTrades: number; losingTrades: number; winRate: number;
  avgProfit: number; avgLoss: number; avgHoldingMinutes: number;
  largestWin: number; largestLoss: number; totalLots: number;
  tradesBySymbol: Record<string, number>; tradesByAccount: Record<string, number>;
}

function StatCard({ label, value, sub, icon: Icon, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; icon?: React.ElementType; color?: string;
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

export default function Statistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await rpGet("/api/refer-project/stats");
    if (r.ok) setStats(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading && !stats) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;
  if (!stats) return null;

  const symbolEntries  = Object.entries(stats.tradesBySymbol).sort((a, b) => b[1] - a[1]);
  const accountEntries = Object.entries(stats.tradesByAccount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Statistics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregated from all closed positions</p>
        </div>
        <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {stats.totalTrades === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No closed trades yet</p>
          <p className="text-xs text-muted-foreground mt-1">Statistics will appear once positions are closed</p>
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Trades"     value={stats.totalTrades} icon={Target} />
            <StatCard label="Winning Trades"   value={stats.winningTrades} color="text-emerald-400" icon={TrendingUp} />
            <StatCard label="Losing Trades"    value={stats.losingTrades}  color={stats.losingTrades > 0 ? "text-red-400" : "text-foreground"} icon={TrendingDown} />
            <StatCard label="Win Rate"         value={`${stats.winRate}%`}
              color={stats.winRate >= 60 ? "text-emerald-400" : stats.winRate >= 40 ? "text-amber-400" : "text-red-400"}
              icon={Trophy} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Avg Profit"       value={`+$${stats.avgProfit}`}  color="text-emerald-400" />
            <StatCard label="Avg Loss"         value={`$${stats.avgLoss}`}     color={stats.avgLoss < 0 ? "text-red-400" : "text-foreground"} />
            <StatCard label="Avg Hold Time"    value={`${stats.avgHoldingMinutes}m`} icon={Clock} />
            <StatCard label="Total Lots"       value={stats.totalLots.toFixed(2)} sub="Standard lots" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Largest Win"  value={`+$${stats.largestWin}`}  color="text-emerald-400" icon={TrendingUp} />
            <StatCard label="Largest Loss" value={`$${stats.largestLoss}`}  color={stats.largestLoss < 0 ? "text-red-400" : "text-foreground"} icon={TrendingDown} />
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-xs font-semibold mb-3">Trades Per Symbol</h2>
              <div className="space-y-2">
                {symbolEntries.map(([sym, count]) => {
                  const pct = Math.round((count / stats.totalTrades) * 100);
                  return (
                    <div key={sym} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono font-medium">{sym}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-xs font-semibold mb-3">Trades Per Account</h2>
              <div className="space-y-2">
                {accountEntries.map(([acc, count]) => {
                  const pct = Math.round((count / stats.totalTrades) * 100);
                  return (
                    <div key={acc} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{acc}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
