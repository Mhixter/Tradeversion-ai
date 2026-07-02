import { useEffect, useState, useCallback } from "react";
import { Plus, Play, Square, Wifi, Trash2, RefreshCw, X, ShieldCheck, ShieldAlert, WifiOff, Loader2, DollarSign } from "lucide-react";
import { rpGet, rpPost, rpDelete } from "./rpApi";

interface Account {
  id: number; accountName: string; mt5Login: string; server: string;
  brokerName: string; accountType: string; leverage: string;
  status: string; connectionStatus: string; lastSyncTime: string | null;
  balance: string; equity: string; workerRunning: boolean;
  metaApiAccountId: string | null; verificationStatus: string;
}

interface TestResult {
  ok: boolean; ms: number; isLive?: boolean;
  message?: string; state?: string; connectionStatus?: string;
}

const statusColor = (s: string) =>
  s === "connected"  ? "text-emerald-400" :
  s === "connecting" ? "text-amber-400"   :
  s === "error"      ? "text-red-400"     : "text-muted-foreground";

const statusDot = (s: string) =>
  s === "connected"  ? "bg-emerald-400 animate-pulse" :
  s === "connecting" ? "bg-amber-400 animate-pulse"   :
  s === "error"      ? "bg-red-400"                   : "bg-muted-foreground";

const verifyBadge = (status: string, testing: boolean, message?: string) => {
  if (testing || status === "verifying") return (
    <span className="flex items-center gap-1 text-[10px] text-amber-400">
      <Loader2 className="w-3 h-3 animate-spin" /> Verifying…
    </span>
  );
  if (status === "verified") return (
    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
      <ShieldCheck className="w-3 h-3" /> Live
    </span>
  );
  if (status === "network_blocked") return (
    <span className="flex items-center gap-1 text-[10px] text-amber-400" title={message ?? "MetaApi egress blocked by hosting provider"}>
      <WifiOff className="w-3 h-3" /> Egress blocked
    </span>
  );
  if (status === "failed") return (
    <span className="flex items-center gap-1 text-[10px] text-red-400" title={message ?? "Token rejected by MetaApi"}>
      <ShieldAlert className="w-3 h-3" /> Bad token
    </span>
  );
  return <span className="text-[10px] text-muted-foreground">Unverified</span>;
};

export default function ConnectedAccounts() {
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [testResults, setTestResults] = useState<Record<number, TestResult>>({});
  const [testing, setTesting]         = useState<Record<number, boolean>>({});
  const [syncing, setSyncing]         = useState<Record<number, boolean>>({});
  const [syncErrors, setSyncErrors]   = useState<Record<number, string>>({});
  const [form, setForm] = useState({
    accountName: "", mt5Login: "", tradingPassword: "", investorPassword: "",
    server: "XMTrading-MT5", brokerName: "XM", accountType: "Ultra Low Standard", leverage: "1:1000",
  });

  const load = useCallback(async () => {
    const r = await rpGet("/api/refer-project/accounts");
    if (r.ok) setAccounts(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 5_000); return () => clearInterval(id); }, [load]);

  const startAccount = async (id: number) => {
    await rpPost(`/api/refer-project/accounts/${id}/start`);
    setTimeout(load, 1000);
  };

  const stopAccount = async (id: number) => {
    await rpPost(`/api/refer-project/accounts/${id}/stop`);
    setTimeout(load, 1000);
  };

  const deleteAccount = async (id: number) => {
    if (!confirm("Delete this account? All positions for this account will remain in history.")) return;
    await rpDelete(`/api/refer-project/accounts/${id}`);
    load();
  };

  const syncBalance = useCallback(async (id: number) => {
    setSyncing(prev => ({ ...prev, [id]: true }));
    setSyncErrors(prev => ({ ...prev, [id]: "" }));
    try {
      const r = await rpPost(`/api/refer-project/accounts/${id}/sync-balance`);
      const data = await r.json() as { success?: boolean; balance?: number; equity?: number; error?: string; details?: string; hint?: string };
      if (!r.ok || !data.success) {
        const msg = data.hint ?? data.error ?? `Sync failed (${r.status})`;
        setSyncErrors(prev => ({ ...prev, [id]: msg }));
      }
      await load(); // refresh balance from DB
    } catch {
      setSyncErrors(prev => ({ ...prev, [id]: "Network error — check Railway is running" }));
    } finally {
      setSyncing(prev => ({ ...prev, [id]: false }));
    }
  }, [load]);

  const testConnection = async (id: number) => {
    setTesting(prev => ({ ...prev, [id]: true }));
    try {
      const r    = await rpPost(`/api/refer-project/accounts/${id}/test-connection`);
      const data = await r.json();
      setTestResults(prev => ({
        ...prev,
        [id]: { ok: data.success, ms: data.latencyMs, isLive: data.isLive, message: data.message, state: data.state, connectionStatus: data.connectionStatus },
      }));
      // Refresh verificationStatus badge and then auto-sync balance
      await load();
      if (data.success && data.isLive) {
        // Fire balance sync in background — don't block the verify flow
        syncBalance(id);
      }
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const addAccount = async () => {
    if (!form.accountName || !form.mt5Login || !form.server) return alert("Name, MT5 Login, and Server are required.");
    const r = await rpPost("/api/refer-project/accounts", form);
    if (r.ok) {
      setShowAdd(false);
      setForm({ accountName:"", mt5Login:"", tradingPassword:"", investorPassword:"", server:"XMTrading-MT5", brokerName:"XM", accountType:"Ultra Low Standard", leverage:"1:1000" });
      load();
    } else {
      const body = await r.json().catch(() => ({}));
      alert(`Failed to add account (${r.status}): ${(body as { error?: string }).error ?? "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Connected Accounts</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage XM MT5 accounts · Each runs independently</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        </div>
      </div>

      {/* Accounts table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-accent/30">
              {["#","Account","MT5 Login","Server","Type","Leverage","Balance","Equity","MetaApi","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">No accounts added yet</td></tr>
            )}
            {accounts.map(acc => {
              const tr = testResults[acc.id];
              const isTesting = testing[acc.id] ?? false;
              const isSyncing = syncing[acc.id] ?? false;
              const syncErr   = syncErrors[acc.id] ?? "";
              return (
                <tr key={acc.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground text-[11px]">#{acc.id}</td>
                  <td className="px-4 py-3 font-medium">{acc.accountName}</td>
                  <td className="px-4 py-3 font-mono">{acc.mt5Login}</td>
                  <td className="px-4 py-3 text-muted-foreground text-[11px]">{acc.server}</td>
                  <td className="px-4 py-3">{acc.accountType}</td>
                  <td className="px-4 py-3">{acc.leverage}</td>
                  <td className="px-4 py-3 font-mono">
                    <div className="flex items-center gap-1">
                      <span className={isSyncing ? "opacity-50" : ""}>${parseFloat(acc.balance).toFixed(2)}</span>
                      {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    </div>
                    {syncErr && (
                      <div className="text-[9px] text-red-400 max-w-[140px] leading-tight mt-0.5" title={syncErr}>
                        ⚠ {syncErr.length > 50 ? syncErr.slice(0, 50) + "…" : syncErr}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">${parseFloat(acc.equity).toFixed(2)}</td>
                  {/* MetaApi verification column */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {verifyBadge(acc.verificationStatus, isTesting, tr?.message)}
                      {tr && !isTesting && (
                        <div className={`text-[10px] mt-0.5 ${tr.ok ? "text-emerald-400" : "text-red-400"}`}>
                          {tr.isLive
                            ? (tr.ok ? `✓ ${tr.ms}ms · ${tr.state ?? ""}` : `✗ Check creds`)
                            : (tr.ok ? `✓ ${tr.ms}ms (sim)` : `✗ Failed`)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(acc.connectionStatus)}`} />
                        <span className={statusColor(acc.connectionStatus)}>{acc.connectionStatus}</span>
                      </div>
                      <div className={`text-[10px] ${acc.workerRunning ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {acc.workerRunning ? "running" : acc.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {acc.workerRunning ? (
                        <button onClick={() => stopAccount(acc.id)} title="Stop"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          <Square className="w-3 h-3" />
                        </button>
                      ) : (
                        <button onClick={() => startAccount(acc.id)} title="Start"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => testConnection(acc.id)} title="Verify via MetaApi" disabled={isTesting}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                        {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                      </button>
                      <button onClick={() => syncBalance(acc.id)} title="Sync live balance from broker" disabled={isSyncing}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-emerald-400 transition-colors disabled:opacity-50">
                        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                      </button>
                      <button onClick={() => deleteAccount(acc.id)} title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add account modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold">Add XM MT5 Account</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Each account runs an independent worker</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "accountName",      label: "Account Name *",   placeholder: "e.g. My XM Account 1" },
                { key: "mt5Login",         label: "MT5 Login *",      placeholder: "e.g. 12345678" },
                { key: "server",           label: "Server *",          placeholder: "XMTrading-MT5" },
                { key: "tradingPassword",  label: "Trading Password",  placeholder: "••••••••", type: "password" },
                { key: "investorPassword", label: "Investor Password", placeholder: "••••••••", type: "password" },
                { key: "brokerName",       label: "Broker",            placeholder: "XM" },
                { key: "accountType",      label: "Account Type",      placeholder: "Ultra Low Standard" },
                { key: "leverage",         label: "Leverage",          placeholder: "1:1000" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Tip: enter your Trading Password to enable live MetaApi balance &amp; position data. Click the Wifi icon to verify after adding.
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={addAccount}
                className="flex-1 px-4 py-2 text-xs bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
