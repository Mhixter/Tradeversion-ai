import { useEffect, useState } from "react";
import { Save, Power } from "lucide-react";
import { rpGet, rpPatch } from "./rpApi";

interface Settings {
  enabled: boolean; maxPositionsPerAccount: number; maxPositionsPerSymbol: number;
  tradingHoursStart: string; tradingHoursEnd: string; allowedSymbols: string[] | null;
  minAiConfidence: string; maxSpread: string; maxDailyVolume: string;
  closeAfterMinutes: number; lotSize: string; directionMode: string;
}

const ALL_SYMBOLS = ["EURUSD","GBPUSD","USDJPY","XAUUSD","GBPJPY","EURJPY","AUDUSD","USDCAD","USDCHF","NZDUSD"];

export default function RPSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    rpGet("/api/refer-project/settings").then(r => r.json()).then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const r = await rpPatch("/api/refer-project/settings", settings);
    if (r.ok) setSettings(await r.json());
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleSymbol = (sym: string) => {
    if (!settings) return;
    const cur = settings.allowedSymbols ?? ALL_SYMBOLS;
    setSettings({ ...settings, allowedSymbols: cur.includes(sym) ? cur.filter(s => s !== sym) : [...cur, sym] });
  };

  const set = (key: keyof Settings, val: unknown) => setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  if (!settings) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;

  const allowedSymbols = settings.allowedSymbols ?? ALL_SYMBOLS;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold">Module Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Refer Project global configuration</p>
      </div>

      {/* Enable/disable */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Module Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              When disabled, all workers stop immediately and existing app is unaffected
            </p>
          </div>
          <button
            onClick={() => set("enabled", !settings.enabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              settings.enabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-accent border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <Power className="w-4 h-4" />
            {settings.enabled ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold">Position Limits</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "maxPositionsPerAccount", label: "Max Open Positions / Account", integer: true },
            { key: "maxPositionsPerSymbol",  label: "Max Open Positions / Symbol",  integer: true },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
              <input type="number" min={1}
                value={(settings as any)[f.key]}
                onChange={e => set(f.key as any, parseInt(e.target.value) || 1)}
                className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trading hours */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold">Trading Hours (UTC)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Start Time</label>
            <input type="time" value={settings.tradingHoursStart}
              onChange={e => set("tradingHoursStart", e.target.value)}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">End Time</label>
            <input type="time" value={settings.tradingHoursEnd}
              onChange={e => set("tradingHoursEnd", e.target.value)}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Allowed symbols */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">Allowed Symbols ({allowedSymbols.length})</h2>
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

      {/* Risk & execution */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold">Risk & Execution</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "minAiConfidence", label: "Min AI Confidence (0-100)", step: "1"   },
            { key: "maxSpread",       label: "Max Spread (price units)",   step: "any" },
            { key: "maxDailyVolume",  label: "Max Daily Volume (lots)",    step: "any" },
            { key: "closeAfterMinutes",label:"Close After (minutes)",      step: "1", integer: true },
            { key: "lotSize",         label: "Lot Size",                   step: "0.01" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
              <input type="number" step={f.step} min={0}
                value={(settings as any)[f.key]}
                onChange={e => set(f.key as any, f.integer ? parseInt(e.target.value) : e.target.value)}
                className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Direction Mode</label>
            <select value={settings.directionMode} onChange={e => set("directionMode", e.target.value)}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary">
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
        <Save className="w-3.5 h-3.5" />
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </button>
    </div>
  );
}
