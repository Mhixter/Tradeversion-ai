import { useEffect, useState } from "react";
import { Save, Brain, TrendingUp, Activity, Zap, BarChart2, Grid } from "lucide-react";
import { rpGet, rpPatch } from "./rpApi";

interface AIConfig {
  weightTrend: string; weightMomentum: string; weightVolatility: string;
  weightSupportResistance: string; weightSpread: string; weightMarketStructure: string;
  thresholdStrong: string; thresholdMedium: string;
}

interface WeightItem { key: keyof AIConfig; label: string; icon: React.ElementType; description: string; }

const WEIGHTS: WeightItem[] = [
  { key: "weightTrend",            label: "Trend",              icon: TrendingUp, description: "EMA alignment and price vs long-term moving averages" },
  { key: "weightMomentum",         label: "Momentum",           icon: Activity,   description: "RSI-based momentum — avoids overbought/oversold extremes" },
  { key: "weightVolatility",       label: "Volatility",         icon: Zap,        description: "ATR-based — rewards moderate volatility, penalises extremes" },
  { key: "weightSupportResistance",label: "Support/Resistance", icon: BarChart2,  description: "Price proximity to recent swing highs and lows" },
  { key: "weightSpread",           label: "Spread",             icon: Grid,       description: "Penalises high spread — wider spread = lower score" },
  { key: "weightMarketStructure",  label: "Market Structure",   icon: Brain,      description: "Higher-highs / lower-lows pattern recognition" },
];

function WeightSlider({ item, value, onChange }: { item: WeightItem; value: number; onChange: (v: number) => void }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <item.icon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} max={100} step={1}
            value={pct}
            onChange={e => onChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-14 bg-accent border border-border rounded px-2 py-0.5 text-xs text-right focus:outline-none focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      <input type="range" min={0} max={100} step={1} value={pct}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 accent-primary rounded-full bg-accent cursor-pointer"
      />
      <p className="text-[10px] text-muted-foreground">{item.description}</p>
    </div>
  );
}

export default function AIDecisionEngine() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    rpGet("/api/refer-project/ai-config").then(r => r.json()).then(setConfig);
  }, []);

  const setWeight = (key: keyof AIConfig, val: number) => {
    if (!config) return;
    setConfig({ ...config, [key]: String(val) });
  };

  const totalWeight = config
    ? WEIGHTS.reduce((s, w) => s + parseFloat(config[w.key] || "0"), 0)
    : 0;

  const save = async () => {
    if (!config) return;
    setSaving(true);
    await rpPatch("/api/refer-project/ai-config", config);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (!config) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;

  const strong = parseFloat(config.thresholdStrong);
  const medium = parseFloat(config.thresholdMedium);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold">AI Decision Engine</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure indicator weights and confidence thresholds · Scores are normalised to 100%
        </p>
      </div>

      {/* Weight warning */}
      {Math.abs(totalWeight - 100) > 5 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
          ⚠ Total weight is {totalWeight.toFixed(0)}% — weights are automatically normalised to 100% at runtime.
        </div>
      )}

      {/* Weights */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold">Indicator Weights</h2>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
            Math.abs(totalWeight - 100) <= 5 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}>
            Total: {totalWeight.toFixed(0)}%
          </div>
        </div>

        <div className="space-y-6">
          {WEIGHTS.map(w => (
            <WeightSlider
              key={w.key} item={w}
              value={parseFloat(config[w.key] || "0")}
              onChange={val => setWeight(w.key, val)}
            />
          ))}
        </div>
      </div>

      {/* Signal thresholds */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Signal Thresholds</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Strong Trade (≥)</label>
            <input type="number" min={0} max={100}
              value={config.thresholdStrong}
              onChange={e => setConfig({ ...config, thresholdStrong: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Medium Trade (≥)</label>
            <input type="number" min={0} max={100}
              value={config.thresholdMedium}
              onChange={e => setConfig({ ...config, thresholdMedium: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        {/* Signal legend */}
        <div className="space-y-2">
          {[
            { label: `${strong}–100`, signal: "STRONG", desc: "Open trade — high confidence", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: `${medium}–${strong - 1}`, signal: "MEDIUM", desc: "Open trade — acceptable confidence", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: `0–${medium - 1}`, signal: "SKIP",   desc: "Skip — confidence too low", color: "text-muted-foreground", bg: "bg-accent border-border" },
          ].map(r => (
            <div key={r.signal} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${r.bg}`}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-14">{r.label}</span>
                <span className={`text-xs font-bold ${r.color}`}>{r.signal}</span>
              </div>
              <span className="text-xs text-muted-foreground">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
        <Save className="w-3.5 h-3.5" />
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save AI Config"}
      </button>
    </div>
  );
}
