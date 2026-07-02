import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Save } from "lucide-react";
import { rpGet, rpPatch } from "./rpApi";

interface Settings {
  directionMode: string; lotSize: string; closeAfterMinutes: number;
  maxSpread: string; maxPositionsPerAccount: number; maxPositionsPerSymbol: number;
  allowedSymbols: string[] | null;
}

const ALL_SYMBOLS = ["EURUSD","GBPUSD","USDJPY","XAUUSD","GBPJPY","EURJPY","AUDUSD","USDCAD","USDCHF","NZDUSD"];

export default function TradingRules() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    rpGet("/api/refer-project/settings").then(r => r.json()).then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await rpPatch("/api/refer-project/settings", settings);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleSymbol = (sym: string) => {
    if (!settings) return;
    const current = settings.allowedSymbols ?? [];
    const updated  = current.includes(sym) ? current.filter(s => s !== sym) : [...current, sym];
    setSettings({ ...settings, allowedSymbols: updated });
  };

  if (!settings) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;

  const allowedSymbols = settings.allowedSymbols ?? ALL_SYMBOLS;
  const isBuy  = settings.directionMode === "BUY";
  const isSell = settings.directionMode === "SELL";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold">Trading Rules</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Rules apply only within Refer Project · No impact on existing trading engine</p>
      </div>

      {/* Fixed rules */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Fixed Rules (XM MT5)</h2>
        <div className="space-y-3">
          {[
            { label: "Broker",        value: "XM" },
            { label: "Platform",      value: "MT5 (MetaTrader 5)" },
            { label: "Account Type",  value: "Ultra Low Standard" },
            { label: "Leverage",      value: "1:1000" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs text-muted-foreground">{r.label}</span>
              <span className="text-xs font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configurable rules */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <h2 className="text-sm font-semibold">Configurable Rules</h2>

        {/* Direction mode */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Trade Direction Mode</p>
          <div className="flex gap-2">
            <button onClick={() => setSettings({ ...settings, directionMode: "BUY" })}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                isBuy ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "border-border text-muted-foreground hover:bg-accent"
              }`}>
              BUY Only
            </button>
            <button onClick={() => setSettings({ ...settings, directionMode: "SELL" })}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                isSell ? "bg-red-500/10 border-red-500/40 text-red-400" : "border-border text-muted-foreground hover:bg-accent"
              }`}>
              SELL Only
            </button>
          </div>
        </div>

        {/* Numeric inputs */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "lotSize",              label: "Lot Size",                   unit: "lots" },
            { key: "closeAfterMinutes",    label: "Close After (minutes)",      unit: "min" },
            { key: "maxSpread",            label: "Max Spread",                 unit: "price units" },
            { key: "maxPositionsPerAccount", label: "Max Positions / Account",  unit: "" },
            { key: "maxPositionsPerSymbol",  label: "Max Positions / Symbol",   unit: "" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
              <div className="flex items-center gap-2">
                <input type="number" step="any"
                  value={(settings as any)[f.key]}
                  onChange={e => setSettings({ ...settings, [f.key]: f.key === "closeAfterMinutes" || f.key.startsWith("max") ? parseInt(e.target.value) : e.target.value })}
                  className="flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                {f.unit && <span className="text-xs text-muted-foreground">{f.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Allowed symbols */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Allowed Symbols ({allowedSymbols.length} selected)</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SYMBOLS.map(sym => {
              const active = allowedSymbols.includes(sym);
              return (
                <button key={sym} onClick={() => toggleSymbol(sym)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                    active ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                  }`}>
                  {sym}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anti-hedge rules */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Anti-Hedge Rules</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 py-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs">Multiple {settings.directionMode} positions on the same symbol are allowed</span>
          </div>
          <div className="flex items-center gap-2.5 py-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs">Simultaneous BUY + SELL on the same symbol is forbidden (no hedging)</span>
          </div>
          <div className="flex items-center gap-2.5 py-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs">Trade direction is locked to <strong className={settings.directionMode === "BUY" ? "text-emerald-400" : "text-red-400"}>{settings.directionMode}</strong> only across all accounts and symbols</span>
          </div>
          <div className="flex items-center gap-2.5 py-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs">Every position auto-closes after {settings.closeAfterMinutes} minutes regardless of P&L</span>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
        <Save className="w-3.5 h-3.5" />
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Rules"}
      </button>
    </div>
  );
}
