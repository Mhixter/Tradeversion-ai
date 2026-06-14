import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetCopyTraders, useGetCopyTradingStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, Search, TrendingUp, TrendingDown, Users, Star,
  Zap, Copy, ChevronRight, Award, BarChart2, AlertTriangle,
  Clock, X, Check, DollarSign, Globe, Filter, LineChart,
  Calendar, Activity, ArrowUpRight, ArrowDownRight, Percent,
  Target, Flame, Trophy, ChevronDown, Eye,
} from "lucide-react";

/* ── Mini sparkline SVG ──────────────────────────────────────────────────── */
function Sparkline({ seed = 0, positive = true, height = 36 }: { seed?: number; positive?: boolean; height?: number }) {
  const pts = Array.from({ length: 14 }, (_, i) => {
    const base = 40 + (i * 3.5) + (positive ? 0 : -10);
    const noise = Math.sin((i + seed) * 1.7) * 8 + Math.cos((i + seed) * 0.9) * 5;
    return Math.max(8, Math.min(68, base + noise));
  });
  const w = 100, h = height;
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`);
  const d = `M ${coords.join(" L ")}`;
  const fillD = `${d} L ${w},${h} L 0,${h} Z`;
  const color = positive ? "#22C55E" : "#EF4444";
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${seed}-${height}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${seed}-${height})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Risk badge ──────────────────────────────────────────────────────────── */
function RiskBadge({ score }: { score: number }) {
  const level = score <= 3 ? { label: "Low", cls: "bg-success/15 text-success border-success/20" }
    : score <= 6 ? { label: "Med", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" }
    : { label: "High", cls: "bg-destructive/15 text-destructive border-destructive/20" };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${level.cls}`}>
      {level.label} {score}/10
    </span>
  );
}

/* ── Medal for top 3 ─────────────────────────────────────────────────────── */
function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-black text-white shadow-md">1</div>;
  if (rank === 2) return <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-black text-white shadow-md">2</div>;
  if (rank === 3) return <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-[9px] font-black text-white shadow-md">3</div>;
  return <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">#{rank}</div>;
}

/* ── Generate deterministic monthly returns from seed ─────────────────────── */
function getMonthlyReturns(seed: number, roi: number) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((month, i) => {
    const base = roi / 12;
    const noise = Math.sin((i + seed) * 1.3) * (base * 0.6) + Math.cos((i * 0.7 + seed)) * (base * 0.4);
    const val = Math.round((base + noise) * 10) / 10;
    return { month, value: val };
  });
}

function getRecentTrades(seed: number, winRate: number) {
  const pairs = ["EURUSD","XAUUSD","GBPJPY","BTC/USD","US500","USDJPY","GBPUSD","AUDUSD"];
  const actions = ["BUY","SELL"];
  return Array.from({ length: 8 }, (_, i) => {
    const won = (Math.sin(seed + i * 1.9) + 1) / 2 < winRate / 100;
    const pair = pairs[(seed + i * 3) % pairs.length];
    const action = actions[(seed + i) % 2] as "BUY" | "SELL";
    const pips = won
      ? Math.round(15 + Math.abs(Math.sin(seed + i) * 60))
      : -Math.round(8 + Math.abs(Math.cos(seed + i) * 25));
    const daysAgo = i * 2 + Math.round(Math.abs(Math.sin(i + seed)) * 2);
    return { pair, action, pips, won, daysAgo };
  });
}

/* ── Trader Details Modal ─────────────────────────────────────────────────── */
function TraderDetailsModal({ trader, seed, onClose, onCopy }: {
  trader: any; seed: number; onClose: () => void; onCopy: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "trades" | "stats">("overview");
  const positive = (trader.roi ?? 0) > 0;
  const monthly = getMonthlyReturns(seed, trader.roi ?? 0);
  const trades = getRecentTrades(seed, trader.winRate ?? 65);
  const sharpe = (1.2 + (seed % 10) * 0.15).toFixed(2);
  const avgTrade = (trader.roi / (24 + seed % 20)).toFixed(1);
  const totalTrades = 280 + seed * 17;
  const profitFactor = (1.4 + (seed % 8) * 0.12).toFixed(2);
  const maxConsecWins = 8 + seed % 6;

  const statItems = [
    { label: "Total ROI",         value: `+${trader.roi}%`,           color: "text-success",    icon: TrendingUp    },
    { label: "Win Rate",          value: `${trader.winRate}%`,         color: "text-primary",    icon: Target        },
    { label: "Sharpe Ratio",      value: sharpe,                       color: "text-blue-400",   icon: Activity      },
    { label: "Max Drawdown",      value: `-${trader.maxDrawdown}%`,    color: "text-destructive", icon: TrendingDown  },
    { label: "Profit Factor",     value: profitFactor,                 color: "text-amber-400",  icon: Percent       },
    { label: "Total Trades",      value: totalTrades.toLocaleString(), color: "text-foreground", icon: BarChart2     },
    { label: "Avg Trade",         value: `+${avgTrade}%`,              color: "text-success",    icon: ArrowUpRight  },
    { label: "Max Consec. Wins",  value: String(maxConsecWins),        color: "text-emerald-400",icon: Flame         },
    { label: "Active Copiers",    value: (trader.copiers ?? 0).toLocaleString(), color: "text-violet-400", icon: Users },
    { label: "Risk Score",        value: `${trader.riskScore}/10`,     color: "text-amber-400",  icon: AlertTriangle },
  ];

  const maxMonthly = Math.max(...monthly.map(m => Math.abs(m.value)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="relative shrink-0">
          {/* Gradient bg strip */}
          <div className={`h-24 bg-gradient-to-br ${positive ? "from-success/20 to-emerald-900/10" : "from-destructive/20 to-red-900/10"} border-b border-border`} />

          {/* Avatar positioned over the strip */}
          <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className={`w-16 h-16 border-4 ${positive ? "border-success/40" : "border-destructive/40"} shadow-xl`}>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.id}`} />
                <AvatarFallback className="text-lg font-bold">{trader.name?.slice(0,2)}</AvatarFallback>
              </Avatar>
              {trader.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-card shadow-md">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Name + meta below the strip */}
          <div className="pt-10 pb-3 px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <h2 className="text-base font-bold">{trader.name}</h2>
              {trader.isVerified && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">VERIFIED</span>}
              <RiskBadge score={trader.riskScore ?? 5} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{trader.strategy}</p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{trader.country ?? "Global"}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(trader.copiers ?? 0).toLocaleString()} copiers</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Trading {2 + (seed % 4)} yrs</span>
            </div>
          </div>

          {/* ROI hero */}
          <div className="flex items-center justify-center gap-6 px-6 py-3 bg-accent/20 border-y border-border/50">
            <div className="text-center">
              <p className={`text-2xl font-black ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? "+" : ""}{trader.roi}%
              </p>
              <p className="text-[10px] text-muted-foreground">All-time ROI</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{trader.winRate}%</p>
              <p className="text-[10px] text-muted-foreground">Win Rate</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-destructive">-{trader.maxDrawdown}%</p>
              <p className="text-[10px] text-muted-foreground">Max Drawdown</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["overview","trades","stats"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-all ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "overview" ? "Overview" : t === "trades" ? "Recent Trades" : "Full Stats"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* OVERVIEW tab */}
          {tab === "overview" && (
            <>
              {/* Equity sparkline */}
              <div className="bg-accent/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><LineChart className="w-3.5 h-3.5 text-primary" />Equity Curve</p>
                  <span className={`text-xs font-bold ${positive ? "text-success" : "text-destructive"}`}>{positive ? "+" : ""}{trader.roi}% all time</span>
                </div>
                <div className="h-20">
                  <Sparkline seed={seed} positive={positive} height={80} />
                </div>
              </div>

              {/* Monthly returns bar chart */}
              <div className="bg-accent/30 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />Monthly Returns (last 12m)</p>
                <div className="flex items-end gap-1 h-20">
                  {monthly.map(({ month, value }) => {
                    const pct = Math.abs(value) / (maxMonthly || 1);
                    const barH = Math.max(4, pct * 72);
                    const isPos = value >= 0;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-md px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {isPos ? "+" : ""}{value}%
                        </div>
                        <div className="flex-1 flex items-end">
                          <div
                            className={`w-full rounded-t-sm transition-all ${isPos ? "bg-success/70 hover:bg-success" : "bg-destructive/70 hover:bg-destructive"}`}
                            style={{ height: `${barH}px` }}
                          />
                        </div>
                        <span className="text-[8px] text-muted-foreground/60">{month.slice(0,1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick stats 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Profit Factor", value: profitFactor, sub: "Revenue / Loss ratio", color: "text-amber-400" },
                  { label: "Sharpe Ratio",  value: sharpe,       sub: "Risk-adjusted return",  color: "text-blue-400"  },
                  { label: "Total Trades",  value: totalTrades.toLocaleString(), sub: "Lifetime executions", color: "text-foreground" },
                  { label: "Avg Trade",     value: `+${avgTrade}%`, sub: "Per-trade return", color: "text-success" },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Tags / markets */}
              <div>
                <p className="text-xs font-semibold mb-2">Markets & Style</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Forex","Gold","Swing Trading","Technical Analysis","AI Assisted","Low Frequency"].slice(0, 3 + seed % 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{tag}</span>
                  ))}
                  {trader.isVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-medium">Verified Pro</span>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground border border-border font-medium">Rank #{trader.rank ?? seed + 1}</span>
                </div>
              </div>
            </>
          )}

          {/* TRADES tab */}
          {tab === "trades" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Showing 8 most recent trades</p>
              {trades.map((trade, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl border border-border/40 hover:bg-accent/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-black ${trade.action === "BUY" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {trade.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{trade.pair}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${trade.won ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {trade.won ? "WIN" : "LOSS"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{trade.daysAgo === 0 ? "Today" : `${trade.daysAgo}d ago`}</p>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${trade.pips > 0 ? "text-success" : "text-destructive"}`}>
                    {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                  </div>
                  {trade.won
                    ? <ArrowUpRight className="w-4 h-4 text-success shrink-0" />
                    : <ArrowDownRight className="w-4 h-4 text-destructive shrink-0" />
                  }
                </div>
              ))}
              <div className="text-center pt-2">
                <button className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                  Load more trades <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* STATS tab */}
          {tab === "stats" && (
            <div className="grid grid-cols-2 gap-3">
              {statItems.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl border border-border/40">
                    <div className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center shrink-0 ${s.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-black leading-tight ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────────── */}
        <div className="shrink-0 p-4 border-t border-border bg-card/80 flex gap-3">
          <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onClose}>
            Close
          </Button>
          <Button
            className="flex-1 h-10 bg-primary hover:bg-primary/90 text-sm font-semibold shadow-lg shadow-primary/20"
            onClick={() => { onClose(); onCopy(); }}
          >
            <Copy className="w-3.5 h-3.5 mr-2" />Start Copying
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Copy modal ──────────────────────────────────────────────────────────── */
function CopyModal({ trader, onClose }: { trader: any; onClose: () => void }) {
  const [amount, setAmount] = useState("500");
  const [stopLoss, setStopLoss] = useState("20");
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-lg font-bold mb-1">Now Copying {trader.name}!</h3>
        <p className="text-xs text-muted-foreground mb-4">Your $<b>{amount}</b> allocation is live. Trades will be mirrored automatically.</p>
        <Button className="w-full bg-primary" onClick={onClose}>Go to My Portfolio</Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative px-6 py-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/30">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.id}`} />
              <AvatarFallback>{trader.name?.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold">Copy {trader.name}</h3>
              <p className="text-xs text-muted-foreground">{trader.strategy} · +{trader.roi}% ROI</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Copy Amount (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-accent border border-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1 mt-1.5">
              {["100","500","1000","5000"].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${amount===v ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                  ${v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Stop Loss (%)</label>
            <input
              type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Automatically stop copying if loss exceeds {stopLoss}%</p>
          </div>

          <div className="bg-accent/60 rounded-xl p-3 space-y-1.5">
            {[
              { label: "Estimated Monthly Return", value: `+${(parseFloat(trader.roi ?? "0") / 12).toFixed(1)}%` },
              { label: "Trader Win Rate", value: `${trader.winRate}%` },
              { label: "Current Copiers", value: trader.copiers?.toLocaleString() ?? "—" },
              { label: "Max Drawdown", value: `-${trader.maxDrawdown}%` },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.value}</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 h-10 font-semibold" onClick={() => setConfirmed(true)}>
            <Copy className="w-3.5 h-3.5 mr-2" />Start Copying — ${amount}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
type TabType = "discover" | "top" | "low-risk" | "rising";

export default function CopyTrading() {
  const { data: traders, isLoading } = useGetCopyTraders();
  const { data: stats } = useGetCopyTradingStats();
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const [search, setSearch] = useState("");
  const [copyTarget, setCopyTarget] = useState<any>(null);
  const [detailsTarget, setDetailsTarget] = useState<{ trader: any; seed: number } | null>(null);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "discover",  label: "Discover",    icon: Globe      },
    { key: "top",       label: "Top Earners", icon: Award      },
    { key: "low-risk",  label: "Low Risk",    icon: ShieldCheck},
    { key: "rising",    label: "Rising Stars",icon: Zap        },
  ];

  const filtered = (traders ?? []).filter(t =>
    (t.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (t.strategy ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const tabFiltered = activeTab === "top"
    ? [...filtered].sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
    : activeTab === "low-risk"
    ? filtered.filter(t => (t.riskScore ?? 10) <= 4)
    : activeTab === "rising"
    ? filtered.filter((_, i) => i % 3 !== 0)
    : filtered;

  const avgROI = traders?.length
    ? `+${(traders.reduce((s, t) => s + (t.roi ?? 0), 0) / traders.length).toFixed(1)}%`
    : "—";
  const totalCopiers = traders?.reduce((s, t) => s + (t.copiers ?? 0), 0) ?? 0;
  const verifiedCount = traders?.filter(t => t.isVerified).length ?? 0;

  const statCards = [
    { label: "Platform Traders",  value: `${traders?.length ?? 0}`,    icon: DollarSign,  color: "from-primary/20 to-emerald-600/5",  num: "text-primary"   },
    { label: "Avg Trader ROI",    value: avgROI,                        icon: TrendingUp,  color: "from-emerald-600/20 to-green-600/5", num: "text-success"   },
    { label: "Active Copiers",    value: totalCopiers > 0 ? totalCopiers.toLocaleString() : "0", icon: Users, color: "from-cyan-600/20 to-sky-600/5", num: "text-cyan-400" },
    { label: "Verified Traders",  value: `${verifiedCount}`,            icon: ShieldCheck, color: "from-amber-600/20 to-yellow-600/5", num: "text-amber-400" },
  ];

  return (
    <Layout title="Copy Trading" subtitle="Automatically mirror top-performing verified traders in real time">
      {detailsTarget && (
        <TraderDetailsModal
          trader={detailsTarget.trader}
          seed={detailsTarget.seed}
          onClose={() => setDetailsTarget(null)}
          onCopy={() => setCopyTarget(detailsTarget.trader)}
        />
      )}
      {copyTarget && <CopyModal trader={copyTarget} onClose={() => setCopyTarget(null)} />}

      <div className="flex flex-col gap-5">

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${s.color} p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xl sm:text-2xl font-black ${s.num}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-xl bg-card/50 flex items-center justify-center ${s.num}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              placeholder="Search traders or strategies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex gap-1">
            {["All Markets","Forex","Crypto","Commodities"].map(m => (
              <button key={m} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${m==="All Markets" ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 pb-3 px-4 text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Featured leaderboard header */}
        {activeTab === "discover" && (
          <div className="hidden sm:grid grid-cols-5 gap-3 mb-1">
            {["#1 This Month","Highest Win Rate","Most Copied","Lowest Drawdown","Best Sharpe"].map((badge, i) => (
              <div key={i} className="text-[10px] font-semibold text-muted-foreground text-center px-2 py-1 bg-accent/40 rounded-lg border border-border/40">
                🏆 {badge}
              </div>
            ))}
          </div>
        )}

        {/* Trader grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
          ) : tabFiltered.map((trader, i) => {
            const positive = (trader.roi ?? 0) > 0;
            const isVerified = trader.isVerified;
            return (
              <div
                key={trader.id}
                className="group relative bg-card border border-border/50 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Top gradient accent */}
                <div className={`h-1 ${positive ? "bg-gradient-to-r from-success to-emerald-400" : "bg-gradient-to-r from-destructive to-red-400"}`} />

                <div className="p-4 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="relative flex items-start gap-3 mb-3">
                    <Medal rank={(trader.rank ?? i + 1)} />
                    <div className="relative mx-auto">
                      <Avatar className={`w-14 h-14 border-2 ${positive ? "border-success/30" : "border-destructive/30"} shadow-md`}>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.id}`} />
                        <AvatarFallback>{trader.name?.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      {isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-0 right-0">
                      <RiskBadge score={trader.riskScore ?? 5} />
                    </div>
                  </div>

                  {/* Name + strategy */}
                  <div className="text-center mb-2">
                    <h3 className="text-sm font-bold leading-tight">{trader.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{trader.strategy}</p>
                  </div>

                  {/* Sparkline + ROI */}
                  <div className="flex flex-col items-center mb-3">
                    <Sparkline seed={i} positive={positive} />
                    <div className="flex items-center gap-1.5 mt-1">
                      {positive ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      <span className={`text-xl font-black ${positive ? "text-success" : "text-destructive"}`}>
                        {positive ? "+" : ""}{trader.roi}%
                      </span>
                      <span className="text-[9px] text-muted-foreground">all time</span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[
                      { label: "Win Rate", value: `${trader.winRate}%`, color: "text-success" },
                      { label: "Copiers",  value: (trader.copiers ?? 0) > 1000 ? `${((trader.copiers??0)/1000).toFixed(1)}k` : String(trader.copiers ?? 0), color: "text-foreground" },
                      { label: "Max DD",   value: `-${trader.maxDrawdown}%`, color: "text-destructive" },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center p-1.5 bg-accent/50 rounded-lg">
                        <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                        <span className="text-[9px] text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {["Forex","Swing","AI"].slice(0, 2 + (i % 2)).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                    ))}
                    {isVerified && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">Verified</span>}
                  </div>

                  {/* Copiers row */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                    <div className="flex -space-x-1">
                      {[1,2,3].map(j => (
                        <Avatar key={j} className="w-4 h-4 border border-card">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=copier-${i}-${j}`} />
                          <AvatarFallback className="text-[6px]">U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span>{(trader.copiers ?? 0).toLocaleString()} copying now</span>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold text-muted-foreground hover:text-primary border border-border hover:border-primary/60 hover:bg-primary/5 rounded-lg transition-all"
                      onClick={() => setDetailsTarget({ trader, seed: i })}
                    >
                      <Eye className="w-3 h-3" />Details
                    </button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-xs h-auto py-2 shadow-md shadow-primary/20"
                      onClick={() => setCopyTarget(trader)}
                    >
                      <Copy className="w-3 h-3 mr-1" />Copy
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My copied traders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Currently Copying</h2>
            <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Trader</th>
                  <th className="text-right px-4 py-3">Allocated</th>
                  <th className="text-right px-4 py-3">My P&L</th>
                  <th className="text-right px-4 py-3">Since Copy</th>
                  <th className="text-right px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Alex Chen",   strategy: "AI Momentum",    allocated: "$2,500", pnl: "+$384.20", pct: "+15.4%", since: "42 days", positive: true  },
                  { name: "Sarah Kim",   strategy: "XAUUSD Scalper", allocated: "$1,000", pnl: "+$127.50", pct: "+12.8%", since: "28 days", positive: true  },
                  { name: "Marcus Reed", strategy: "Carry Trade",    allocated: "$500",   pnl: "-$23.40",  pct: "-4.7%",  since: "9 days",  positive: false },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=mc-${i}`} />
                          <AvatarFallback className="text-[9px]">{row.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold">{row.name}</p>
                          <p className="text-[10px] text-muted-foreground">{row.strategy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-right font-medium">{row.allocated}</td>
                    <td className={`px-4 py-3 text-xs text-right font-bold ${row.positive ? "text-success" : "text-destructive"}`}>{row.pnl}</td>
                    <td className={`px-4 py-3 text-xs text-right font-semibold ${row.positive ? "text-success" : "text-destructive"}`}>{row.pct}</td>
                    <td className="px-4 py-3 text-xs text-right text-muted-foreground">
                      <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" />{row.since}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-[10px] px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors font-semibold">Stop</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
