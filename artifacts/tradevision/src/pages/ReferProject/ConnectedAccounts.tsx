import { useEffect, useState, useCallback } from "react";
import { Plus, Play, Square, Wifi, Trash2, RefreshCw, X, TestTube } from "lucide-react";
import { rpGet, rpPost, rpDelete } from "./rpApi";

interface Account {
  id: number; accountName: string; mt5Login: string; server: string;
  brokerName: string; accountType: string; leverage: string;
  status: string; connectionStatus: string; lastSyncTime: string | null;
  balance: string; equity: string; workerRunning: boolean;
}

const statusColor = (s: string) =>
  s === "connected" ? "text-emerald-400" :
  s === "connecting" ? "text-amber-400" :
  s === "error"      ? "text-red-400"   : "text-muted-foreground";

const statusDot = (s: string) =>
  s === "connected"  ? "bg-emerald-400 animate-pulse" :
  s === "connecting" ? "bg-amber-400 animate-pulse"   :
  s === "error"      ? "bg-red-400"                    : "bg-muted-foreground";

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { ok: boolean; ms: number }>>({});
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

  const testConnection = async (id: number) => {
    const r = await rpPost(`/api/refer-project/accounts/${id}/test-connection`);
    const data = await r.json();
    setTestResults(prev => ({ ...prev, [id]: { ok: data.success, ms: data.latencyMs } }));
  };

  const addAccount = async () => {
    if (!form.accountName || !form.mt5Login || !form.server) return alert("Name, MT5 Login, and Server are required.");
    const r = await rpPost("/api/refer-project/accounts", form);
    if (r.ok) { setShowAdd(false); setForm({ accountName:"", mt5Login:"", tradingPassword:"", investorPassword:"", server:"XMTrading-MT5", brokerName:"XM", accountType:"Ultra Low Standard", leverage:"1:1000" }); load(); }
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
              {["Account Name","MT5 Login","Server","Type","Leverage","Balance","Equity","Status","Connection","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No accounts added yet</td></tr>
            )}
            {accounts.map(acc => (
              <tr key={acc.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3 font-medium">{acc.accountName}</td>
                <td className="px-4 py-3 font-mono">{acc.mt5Login}</td>
                <td className="px-4 py-3 text-muted-foreground">{acc.server}</td>
                <td className="px-4 py-3">{acc.accountType}</td>
                <td className="px-4 py-3">{acc.leverage}</td>
                <td className="px-4 py-3 font-mono">${parseFloat(acc.balance).toFixed(2)}</td>
                <td className="px-4 py-3 font-mono">${parseFloat(acc.equity).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`${acc.workerRunning ? "text-emerald-400" : "text-muted-foreground"} font-medium capitalize`}>
                    {acc.workerRunning ? "running" : acc.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(acc.connectionStatus)}`} />
                    <span className={statusColor(acc.connectionStatus)}>{acc.connectionStatus}</span>
                  </div>
                  {testResults[acc.id] && (
                    <div className={`text-[10px] mt-0.5 ${testResults[acc.id].ok ? "text-emerald-400" : "text-red-400"}`}>
                      {testResults[acc.id].ok ? `✓ ${testResults[acc.id].ms}ms` : "✗ Failed"}
                    </div>
                  )}
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
                    <button onClick={() => testConnection(acc.id)} title="Test Connection"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Wifi className="w-3 h-3" />
                    </button>
                    <button onClick={() => deleteAccount(acc.id)} title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                { key: "accountName", label: "Account Name *", placeholder: "e.g. My XM Account 1" },
                { key: "mt5Login",    label: "MT5 Login *",    placeholder: "e.g. 12345678" },
                { key: "server",      label: "Server *",        placeholder: "XMTrading-MT5" },
                { key: "tradingPassword",  label: "Trading Password",  placeholder: "••••••••", type: "password" },
                { key: "investorPassword", label: "Investor Password", placeholder: "••••••••", type: "password" },
                { key: "brokerName",  label: "Broker",     placeholder: "XM" },
                { key: "accountType", label: "Account Type", placeholder: "Ultra Low Standard" },
                { key: "leverage",    label: "Leverage",    placeholder: "1:1000" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
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
