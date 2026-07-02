import { useEffect, useState, useCallback } from "react";
import { Plus, Play, Square, Wifi, Trash2, RefreshCw, X, ShieldCheck, ShieldAlert, WifiOff, Loader2, DollarSign, Stethoscope, RotateCcw, Pencil } from "lucide-react";
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

interface MatchingAccount {
  id: string; state: unknown; connectionStatus: unknown;
  server: unknown; region: unknown; isStoredId: boolean;
}

interface MetaApiStatus {
  metaApiAccountId: string | null;
  state: string | null;
  connectionStatus: string | null;
  region: string | null;
  server?: string | null;
  dbServer?: string;
  dbLogin?: string;
  matchingAccounts?: MatchingAccount[];
  rawMetaApiAccount?: Record<string, unknown>;
  diagnosis?: string;
  message?: string;
  error?: string;
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

const connStatusColor = (s: string | null) => {
  if (!s) return "text-muted-foreground";
  if (s === "CONNECTED") return "text-emerald-400 font-semibold";
  if (s === "DISCONNECTED") return "text-red-400";
  return "text-amber-400";
};

export default function ConnectedAccounts() {
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [testResults, setTestResults] = useState<Record<number, TestResult>>({});
  const [testing, setTesting]         = useState<Record<number, boolean>>({});
  const [syncing, setSyncing]         = useState<Record<number, boolean>>({});
  const [syncErrors, setSyncErrors]   = useState<Record<number, string>>({});

  // Edit modal state
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editForm, setEditForm]       = useState<Record<string, string>>({});
  const [editSaving, setEditSaving]   = useState(false);

  // Diagnose modal state
  const [diagAccount, setDiagAccount]       = useState<Account | null>(null);
  const [diagStatus, setDiagStatus]         = useState<MetaApiStatus | null>(null);
  const [diagLoading, setDiagLoading]       = useState(false);
  const [redeploying, setRedeploying]       = useState(false);
  const [redeploySteps, setRedeploySteps]   = useState<string[]>([]);
  const [serverOverride, setServerOverride] = useState("");

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
      await load();
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
      await load();
      if (data.success && data.isLive) {
        syncBalance(id);
      }
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const openEdit = (acc: Account) => {
    setEditAccount(acc);
    setEditForm({
      accountName:      acc.accountName,
      mt5Login:         acc.mt5Login,
      server:           acc.server,
      tradingPassword:  "",
      investorPassword: "",
      brokerName:       acc.brokerName,
      accountType:      acc.accountType,
      leverage:         acc.leverage,
    });
  };

  const saveEdit = async () => {
    if (!editAccount) return;
    setEditSaving(true);
    try {
      // Only send tradingPassword if user typed something
      const body: Record<string, string> = {
        accountName:  editForm.accountName,
        mt5Login:     editForm.mt5Login,
        server:       editForm.server,
        brokerName:   editForm.brokerName,
        accountType:  editForm.accountType,
        leverage:     editForm.leverage,
      };
      if (editForm.tradingPassword)  body.tradingPassword  = editForm.tradingPassword;
      if (editForm.investorPassword) body.investorPassword = editForm.investorPassword;
      const r = await fetch(`/api/refer-project/accounts/${editAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        alert(`Save failed: ${(d as {error?: string}).error ?? r.status}`);
        return;
      }
      setEditAccount(null);
      await load();
    } finally {
      setEditSaving(false);
    }
  };

  const openDiagnose = async (acc: Account) => {
    setDiagAccount(acc);
    setDiagStatus(null);
    setRedeploySteps([]);
    setServerOverride("");
    setDiagLoading(true);
    try {
      const r = await rpGet(`/api/refer-project/accounts/${acc.id}/metaapi-status`);
      const data = await r.json() as MetaApiStatus;
      setDiagStatus(data);
    } catch {
      setDiagStatus({ metaApiAccountId: null, state: null, connectionStatus: null, region: null, error: "Network error reaching Railway" });
    } finally {
      setDiagLoading(false);
    }
  };

  const forceRedeploy = async () => {
    if (!diagAccount) return;
    setRedeploying(true);
    setRedeploySteps([]);
    try {
      const body = serverOverride.trim() ? { server: serverOverride.trim() } : {};
      const r = await rpPost(`/api/refer-project/accounts/${diagAccount.id}/force-redeploy`, body);
      const data = await r.json() as { success?: boolean; steps?: string[]; error?: string; details?: string };
      if (!r.ok) {
        setRedeploySteps([`❌ Server error (${r.status}): ${data.error ?? "Unknown error"}${data.details ? ` — ${data.details}` : ""}`]);
        return;
      }
      if (data.steps) setRedeploySteps(data.steps);
      // If deploy was triggered, refresh status after a few seconds
      if (data.success) {
        setTimeout(async () => {
          const r2 = await rpGet(`/api/refer-project/accounts/${diagAccount.id}/metaapi-status`);
          if (r2.ok) setDiagStatus(await r2.json());
        }, 5000);
      }
    } catch {
      setRedeploySteps(["❌ Network error — could not reach Railway server"]);
    } finally {
      setRedeploying(false);
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
                      <button onClick={() => openEdit(acc)} title="Edit account / set password"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-blue-400 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => openDiagnose(acc)} title="Diagnose MetaApi connection"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-amber-400 transition-colors">
                        <Stethoscope className="w-3 h-3" />
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

      {/* Edit account modal */}
      {editAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold">Edit Account — {editAccount.accountName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Leave password blank to keep existing value</p>
              </div>
              <button onClick={() => setEditAccount(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "accountName",      label: "Account Name",      placeholder: "" },
                { key: "mt5Login",         label: "MT5 Login",         placeholder: "" },
                { key: "server",           label: "Server",            placeholder: "e.g. XMGlobal-MT5 6" },
                { key: "tradingPassword",  label: "Trading Password",  placeholder: "Enter to update (required for balance sync)", type: "password" },
                { key: "investorPassword", label: "Investor Password", placeholder: "Enter to update", type: "password" },
                { key: "brokerName",       label: "Broker",            placeholder: "" },
                { key: "accountType",      label: "Account Type",      placeholder: "" },
                { key: "leverage",         label: "Leverage",          placeholder: "" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder || (editForm[f.key] ?? "")}
                    value={editForm[f.key] ?? ""}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            {!editForm.tradingPassword && (
              <p className="text-[10px] text-amber-400 mt-3">
                ⚠ No trading password entered. MetaApi cannot sync the balance without it.
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditAccount(null)}
                className="flex-1 px-4 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={editSaving}
                className="flex-1 px-4 py-2 text-xs bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnose modal */}
      {diagAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-amber-400" />
                  MetaApi Diagnostics — {diagAccount.accountName}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live status from MetaApi provisioning API</p>
              </div>
              <button onClick={() => setDiagAccount(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {diagLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching MetaApi status…
              </div>
            )}

            {diagStatus && !diagLoading && (
              <div className="space-y-3">
                {/* Status grid */}
                <div className="bg-accent/30 rounded-lg p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <span className="text-muted-foreground">State</span>
                    <span className={diagStatus.state === "DEPLOYED" ? "text-amber-400" : diagStatus.state === "CONNECTED" ? "text-emerald-400" : "text-foreground"}>
                      {diagStatus.state ?? "—"}
                    </span>

                    <span className="text-muted-foreground">Connection</span>
                    <span className={connStatusColor(diagStatus.connectionStatus)}>
                      {diagStatus.connectionStatus ?? "—"}
                    </span>

                    <span className="text-muted-foreground">MetaApi server</span>
                    <span className={diagStatus.server && diagStatus.server !== diagAccount.server ? "text-red-400" : "text-foreground"}>
                      {diagStatus.server ?? "—"}
                      {diagStatus.server && diagStatus.server !== diagAccount.server && (
                        <span className="text-red-400 ml-1">⚠ mismatch!</span>
                      )}
                    </span>

                    <span className="text-muted-foreground">DB server</span>
                    <span>{diagAccount.server}</span>

                    <span className="text-muted-foreground">Region</span>
                    <span>{diagStatus.region ?? "—"}</span>

                    <span className="text-muted-foreground">Account ID</span>
                    <span className="text-[10px] break-all">{diagStatus.metaApiAccountId ?? "—"}</span>
                  </div>
                </div>

                {/* Message */}
                {diagStatus.message && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{diagStatus.message}</p>
                )}
                {diagStatus.error && (
                  <p className="text-[11px] text-red-400 leading-relaxed">{diagStatus.error}</p>
                )}

                {/* Diagnosis */}
                {diagStatus.diagnosis && (
                  <div className={`border rounded-lg p-3 text-[11px] space-y-1 ${
                    diagStatus.diagnosis.startsWith("✅")
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : diagStatus.diagnosis.startsWith("❌")
                      ? "bg-red-500/10 border-red-500/20 text-red-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}>
                    <p className="font-semibold">Diagnosis</p>
                    <p>{diagStatus.diagnosis}</p>
                  </div>
                )}

                {/* All matching MetaApi accounts for this login */}
                {diagStatus.matchingAccounts && diagStatus.matchingAccounts.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">All MetaApi accounts with login {diagAccount.mt5Login}:</p>
                    <div className="space-y-1">
                      {diagStatus.matchingAccounts.map((ma) => (
                        <div key={String(ma.id)} className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded ${ma.isStoredId ? "bg-primary/10 border border-primary/20" : "bg-accent/30"}`}>
                          <span className={ma.connectionStatus === "CONNECTED" ? "text-emerald-400" : "text-amber-400"}>
                            {String(ma.connectionStatus ?? "?")}
                          </span>
                          <span className="text-muted-foreground">{String(ma.state ?? "?")}</span>
                          <span className="text-foreground truncate flex-1">{String(ma.id)}</span>
                          <span className="text-muted-foreground">{String(ma.server ?? "?")}</span>
                          {ma.isStoredId && <span className="text-primary">← in use</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full raw MetaApi JSON */}
                {diagStatus.rawMetaApiAccount && (
                  <details className="text-[10px]">
                    <summary className="text-muted-foreground cursor-pointer hover:text-foreground select-none">
                      Full MetaApi response (click to expand)
                    </summary>
                    <pre className="mt-2 bg-black/40 rounded p-2 overflow-auto max-h-48 text-[9px] text-emerald-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(diagStatus.rawMetaApiAccount, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Server override input */}
                {diagStatus.connectionStatus !== "CONNECTED" && (
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">
                      Override server name for Fix & Redeploy
                      <span className="text-amber-400 ml-1">(current: "{diagAccount.server}")</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. XMGlobal-MT5 6"
                      value={serverOverride}
                      onChange={e => setServerOverride(e.target.value)}
                      className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Leave blank to keep current server. Enter the exact server name from your XM MT5 terminal.
                    </p>
                  </div>
                )}

                {/* Redeploy steps */}
                {redeploySteps.length > 0 && (
                  <div className="bg-accent/20 rounded-lg p-3 space-y-1">
                    {redeploySteps.map((s, i) => (
                      <p key={i} className={`text-[11px] font-mono ${s.startsWith("✅") ? "text-emerald-400" : s.startsWith("⚠") ? "text-amber-400" : "text-muted-foreground"}`}>{s}</p>
                    ))}
                    {redeploySteps.some(s => s.includes("Deploy requested")) && (
                      <p className="text-[11px] text-muted-foreground mt-1">MetaApi will attempt broker reconnect. Wait 2–3 min then click the $ button to sync balance.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openDiagnose(diagAccount)}
                disabled={diagLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${diagLoading ? "animate-spin" : ""}`} /> Refresh Status
              </button>
              <button
                onClick={forceRedeploy}
                disabled={redeploying || diagLoading || !diagStatus?.metaApiAccountId}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                {redeploying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                {diagStatus?.server && diagStatus.server !== diagAccount.server ? "Fix Server & Redeploy" : "Force Redeploy"}
              </button>
              <button
                onClick={() => { setDiagAccount(null); syncBalance(diagAccount.id); }}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
              >
                <DollarSign className="w-3 h-3" /> Sync Balance
              </button>
            </div>
          </div>
        </div>
      )}

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
                { key: "server",           label: "Server *",          placeholder: "XMGlobal-MT5 6" },
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
              Tip: use the exact server name from your XM MT5 terminal (e.g. XMGlobal-MT5 6). Enter Trading Password to enable live balance sync.
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
