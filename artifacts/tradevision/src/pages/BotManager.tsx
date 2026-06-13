import React, { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useGetBots, useGetBotsStats, useGetBrokers,
  useStartBot, useStopBot, usePauseBot, useCreateBot,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Play, Square, Pause, Plus, X, Zap, RefreshCw,
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  ChevronRight, Wallet, Bot as BotIcon, Activity,
} from "lucide-react";

const STRATEGY_TEMPLATES = [
  { id: "sma_crossover",        name: "Dual SMA Crossover",         type: "Trend Following",   markets: ["Forex","Indices","Commodities"] },
  { id: "rsi_divergence",       name: "RSI Mean Reversion",         type: "Mean Reversion",    markets: ["Forex","Crypto"] },
  { id: "macd_momentum",        name: "MACD Momentum Surge",        type: "Momentum",          markets: ["Forex","Indices"] },
  { id: "bollinger_breakout",   name: "Bollinger Band Squeeze",     type: "Breakout",          markets: ["Crypto","Forex","Indices"] },
  { id: "vwap_scalper",         name: "VWAP Intraday Scalper",      type: "Scalping",          markets: ["Indices","Forex"] },
  { id: "multi_tf_confluence",  name: "Multi-Timeframe Confluence", type: "Hybrid",            markets: ["Forex","Gold"] },
  { id: "fibonacci_retracement",name: "Fibonacci Retracement Bot",  type: "Support/Resistance",markets: ["Forex","Indices","Commodities"] },
  { id: "ai_sentiment",         name: "AI Sentiment Trader",        type: "AI/ML",             markets: ["Forex","Indices"] },
];
const PAIRS: Record<string, string[]> = {
  Forex:  ["EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD","EURGBP"],
  Gold:   ["XAUUSD"],
  Indices:["NAS100","US30","SPX500","GER40"],
  Crypto: ["BTCUSD","ETHUSD","XRPUSD"],
  Commodities: ["USOIL","UKOIL","NATGAS"],
};
const TIMEFRAMES = ["M1","M5","M15","M30","H1","H4","D1"];

type BotRow = { id: number; name: string; strategy: string; market: string; timeframe: string; status: string; pnlToday: number; pnlAllTime: number; winRate: number; account: string; };
type BrokerRow = { id: number; broker: string; platform: string; accountNumber: string; equity: number; balance: number; profit: number; status: string; isConnected: boolean; };
type Signal = { action: string; reason: string; confidence: number; stopLoss: number; takeProfit: number; market?: string; status?: string; };
type TradeResult = { orderId: string; action: string; symbol: string; size: number; executionPrice: number; slippage: number; executionTime: number; profit: number; brokerEquity: number; timestamp: string; };

export default function BotManager() {
  const { data: bots, isLoading: botsLoading } = useGetBots();
  const { data: stats, isLoading: statsLoading } = useGetBotsStats();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [testBot, setTestBot] = useState<BotRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const startMut  = useStartBot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bots"] }); qc.invalidateQueries({ queryKey: ["/api/bots/stats"] }); } } });
  const stopMut   = useStopBot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bots"] }); qc.invalidateQueries({ queryKey: ["/api/bots/stats"] }); } } });
  const pauseMut  = usePauseBot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bots"] }); qc.invalidateQueries({ queryKey: ["/api/bots/stats"] }); } } });

  const handleStart = async (id: number) => {
    try {
      await startMut.mutateAsync({ id });
      toast({ title: "Bot started", description: "Bot is now running." });
      if (testBot?.id === id) setTestBot(b => b ? { ...b, status: "RUNNING" } : b);
    } catch { toast({ title: "Failed to start bot", variant: "destructive" }); }
  };
  const handleStop = async (id: number) => {
    try {
      await stopMut.mutateAsync({ id });
      toast({ title: "Bot stopped" });
      if (testBot?.id === id) setTestBot(b => b ? { ...b, status: "STOPPED" } : b);
    } catch { toast({ title: "Failed to stop bot", variant: "destructive" }); }
  };
  const handlePause = async (id: number) => {
    try {
      await pauseMut.mutateAsync({ id });
      toast({ title: "Bot paused" });
      if (testBot?.id === id) setTestBot(b => b ? { ...b, status: "PAUSED" } : b);
    } catch { toast({ title: "Failed to pause bot", variant: "destructive" }); }
  };

  const openTestPanel = (bot: BotRow) => setTestBot(bot);

  return (
    <Layout title="Bot Manager" subtitle="Manage and monitor your active trading bots">
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* Stats Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <StatCard title="Total Bots"   value={stats?.totalBots}   isLoading={statsLoading} />
          <StatCard title="Running"      value={stats?.running}     isLoading={statsLoading} valueClass="text-success" />
          <StatCard title="Stopped"      value={stats?.stopped}     isLoading={statsLoading} valueClass="text-destructive" />
          <StatCard title="Paused"       value={stats?.paused}      isLoading={statsLoading} valueClass="text-amber-500" />
          <StatCard title="Total Profit" value={stats?.totalProfit} isLoading={statsLoading} prefix="$" valueClass="text-success" />
          <StatCard title="Win Rate"     value={stats?.avgWinRate}  isLoading={statsLoading} suffix="%" />
        </div>

        {/* Header Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="default" size="sm" className="h-8 sm:h-9 bg-primary text-xs sm:text-sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Bot
          </Button>
        </div>

        {/* Main two-column layout */}
        <div className={`flex flex-col ${testBot ? "lg:grid lg:grid-cols-12" : ""} gap-4 sm:gap-6`}>

          {/* Bot Table */}
          <div className={testBot ? "lg:col-span-7 flex flex-col gap-4" : "flex flex-col gap-4"}>
            <Card className="border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/50">
                    <TableRow className="border-border">
                      <TableHead className="font-medium whitespace-nowrap">Bot Name</TableHead>
                      <TableHead className="font-medium hidden sm:table-cell">Strategy</TableHead>
                      <TableHead className="font-medium">Market</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium text-right">P&L Today</TableHead>
                      <TableHead className="font-medium text-right hidden md:table-cell">All Time</TableHead>
                      <TableHead className="font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {botsLoading ? Array(4).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    )) : bots?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                          No bots yet. Click <strong>Create Bot</strong> to get started.
                        </TableCell>
                      </TableRow>
                    ) : bots?.map(bot => {
                      const isSelected = testBot?.id === bot.id;
                      return (
                        <TableRow
                          key={bot.id}
                          className={`border-border hover:bg-accent/50 cursor-pointer ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                          onClick={() => openTestPanel(bot as BotRow)}
                        >
                          <TableCell className="font-medium text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {bot.name}
                              {(bot as any).isAI && <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/40 text-primary">AI</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{bot.strategy}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {bot.market}<span className="text-muted-foreground ml-1 text-[10px]">{bot.timeframe}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] font-semibold whitespace-nowrap ${
                              bot.status === "RUNNING" ? "text-success border-success/30 bg-success/10" :
                              bot.status === "STOPPED" ? "text-destructive border-destructive/30 bg-destructive/10" :
                              "text-amber-500 border-amber-500/30 bg-amber-500/10"
                            }`}>{bot.status}</Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium text-xs whitespace-nowrap ${bot.pnlToday >= 0 ? "text-success" : "text-destructive"}`}>
                            {bot.pnlToday >= 0 ? "+" : ""}${bot.pnlToday.toFixed(2)}
                          </TableCell>
                          <TableCell className={`text-right font-medium text-xs hidden md:table-cell whitespace-nowrap ${bot.pnlAllTime >= 0 ? "text-success" : "text-destructive"}`}>
                            {bot.pnlAllTime >= 0 ? "+" : ""}${bot.pnlAllTime.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1">
                              <button
                                className="p-1 rounded hover:bg-primary/10 hover:text-primary text-xs font-medium text-primary/70"
                                title="Live Test"
                                onClick={() => openTestPanel(bot as BotRow)}
                              ><Zap className="w-3.5 h-3.5" /></button>
                              {bot.status !== "RUNNING" && (
                                <button
                                  className="p-1 rounded hover:bg-success/10 hover:text-success text-muted-foreground disabled:opacity-40"
                                  title="Start" disabled={startMut.isPending}
                                  onClick={() => handleStart(bot.id)}
                                ><Play className="w-3.5 h-3.5" /></button>
                              )}
                              {bot.status === "RUNNING" && (
                                <button
                                  className="p-1 rounded hover:bg-amber-500/10 hover:text-amber-500 text-muted-foreground disabled:opacity-40"
                                  title="Pause" disabled={pauseMut.isPending}
                                  onClick={() => handlePause(bot.id)}
                                ><Pause className="w-3.5 h-3.5" /></button>
                              )}
                              {bot.status !== "STOPPED" && (
                                <button
                                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground disabled:opacity-40"
                                  title="Stop" disabled={stopMut.isPending}
                                  onClick={() => handleStop(bot.id)}
                                ><Square className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Live Test Panel */}
          {testBot && (
            <div className="lg:col-span-5">
              <LiveTestPanel
                bot={testBot}
                onClose={() => setTestBot(null)}
                onStart={handleStart}
                onStop={handleStop}
                onBotStatusChange={(status) => setTestBot(b => b ? { ...b, status } : b)}
              />
            </div>
          )}
        </div>

        {/* Tip when no bot selected */}
        {!testBot && !botsLoading && (bots?.length ?? 0) > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Click any bot row or the <Zap className="inline w-3 h-3 text-primary" /> icon to open the Live Trade Test panel
          </p>
        )}
      </div>

      {showCreate && (
        <CreateBotModal
          onClose={() => setShowCreate(false)}
          onCreate={() => {
            qc.invalidateQueries({ queryKey: ["/api/bots"] });
            qc.invalidateQueries({ queryKey: ["/api/bots/stats"] });
          }}
        />
      )}
    </Layout>
  );
}

/* ─── Live Test Panel ──────────────────────────────────────── */
function LiveTestPanel({
  bot, onClose, onStart, onStop, onBotStatusChange,
}: {
  bot: BotRow;
  onClose: () => void;
  onStart: (id: number) => Promise<void>;
  onStop: (id: number) => Promise<void>;
  onBotStatusChange: (s: string) => void;
}) {
  const { data: brokers, isLoading: brokersLoading } = useGetBrokers();
  const { toast } = useToast();

  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [fundBalance, setFundBalance] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [fundedEquity, setFundedEquity] = useState<number | null>(null);

  const [signal, setSignal] = useState<Signal | null>(null);
  const [isGettingSignal, setIsGettingSignal] = useState(false);
  const [customAction, setCustomAction] = useState<"BUY" | "SELL" | null>(null);
  const [lotSize, setLotSize] = useState("0.01");
  const [isExecuting, setIsExecuting] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const activeBroker = brokers?.find(b => b.id === selectedBrokerId) ?? (brokers && brokers.length > 0 ? brokers[0] : null);
  const displayEquity = fundedEquity ?? activeBroker?.equity ?? 0;

  React.useEffect(() => {
    if (brokers && brokers.length > 0 && selectedBrokerId === null) {
      setSelectedBrokerId((brokers[0] as BrokerRow).id);
    }
  }, [brokers]);

  const handleFundAccount = async () => {
    if (!activeBroker || !fundBalance) return;
    setIsFunding(true);
    try {
      const amt = parseFloat(fundBalance);
      const res = await fetch(`/api/brokers/${activeBroker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equity: amt, balance: amt }),
      });
      if (!res.ok) throw new Error(await res.text());
      setFundedEquity(amt);
      setFundBalance("");
      toast({ title: "Account funded", description: `Equity set to $${amt.toLocaleString()}` });
    } catch (e: any) {
      toast({ title: "Failed to fund account", description: e.message, variant: "destructive" });
    } finally {
      setIsFunding(false);
    }
  };

  const handleGetSignal = async () => {
    setIsGettingSignal(true);
    setSignal(null);
    setTradeResult(null);
    try {
      const res = await fetch(`/api/bots/${bot.id}/signal`);
      if (!res.ok) throw new Error("Signal request failed");
      const data = await res.json();
      setSignal(data);
      setCustomAction(data.action === "BUY" || data.action === "SELL" ? data.action : null);
    } catch {
      toast({ title: "Could not get signal", variant: "destructive" });
    } finally {
      setIsGettingSignal(false);
    }
  };

  const handleExecute = async () => {
    const action = customAction;
    if (!action) { toast({ title: "Select BUY or SELL to execute", variant: "destructive" }); return; }
    if (displayEquity === 0) { toast({ title: "Fund your account first", description: "Set equity before executing trades.", variant: "destructive" }); return; }
    setIsExecuting(true);
    try {
      const res = await fetch(`/api/bots/${bot.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, size: parseFloat(lotSize), symbol: signal?.market || bot.market }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");
      setTradeResult(data);
      setFundedEquity(data.brokerEquity);
      toast({ title: data.profit >= 0 ? "Trade executed ✓" : "Trade executed", description: `${action} ${lotSize} lots — P&L: ${data.profit >= 0 ? "+" : ""}$${data.profit.toFixed(2)}` });
    } catch (e: any) {
      toast({ title: "Execution failed", description: e.message, variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStartBot = async () => {
    setIsStarting(true);
    try {
      await onStart(bot.id);
      onBotStatusChange("RUNNING");
    } finally { setIsStarting(false); }
  };
  const handleStopBot = async () => {
    setIsStopping(true);
    try {
      await onStop(bot.id);
      onBotStatusChange("STOPPED");
    } finally { setIsStopping(false); }
  };

  const actionColor = signal?.action === "BUY" ? "text-success" : signal?.action === "SELL" ? "text-destructive" : "text-amber-500";
  const noBrokers = !brokersLoading && (!brokers || brokers.length === 0);

  return (
    <Card className="border-primary/30 bg-card shadow-lg sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg"><BotIcon className="w-4 h-4 text-primary" /></div>
          <div>
            <p className="font-semibold text-sm leading-tight">{bot.name}</p>
            <p className="text-[11px] text-muted-foreground">{bot.strategy} · {bot.market}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] font-bold ${
            bot.status === "RUNNING" ? "text-success border-success/30 bg-success/10" :
            bot.status === "STOPPED" ? "text-destructive border-destructive/30 bg-destructive/10" :
            "text-amber-500 border-amber-500/30 bg-amber-500/10"
          }`}>{bot.status}</Badge>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

        {/* ── Step 1: Funded Account ── */}
        <Section icon={<Wallet className="w-3.5 h-3.5" />} title="Funded Account">
          {brokersLoading ? <Skeleton className="h-10 w-full" /> : noBrokers ? (
            <div className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-3">
              No broker accounts found. Go to <strong>Settings → Connections</strong> to connect a broker first.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Broker selector */}
              <select
                value={selectedBrokerId ?? ""}
                onChange={e => setSelectedBrokerId(Number(e.target.value))}
                className="bg-accent border border-border rounded-lg px-3 py-2 text-xs w-full"
              >
                {brokers?.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.broker} {b.platform} #{b.accountNumber || "—"} — ${b.equity.toLocaleString()}
                  </option>
                ))}
              </select>

              {/* Current equity */}
              <div className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">Account Equity</span>
                <span className={`text-sm font-bold ${displayEquity > 0 ? "text-success" : "text-muted-foreground"}`}>
                  ${displayEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Set balance */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Set funded balance (e.g. 10000)"
                  value={fundBalance}
                  onChange={e => setFundBalance(e.target.value)}
                  className="bg-accent border border-border rounded-lg px-3 py-1.5 text-xs flex-1"
                />
                <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={handleFundAccount} disabled={isFunding || !fundBalance}>
                  {isFunding ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Fund"}
                </Button>
              </div>
            </div>
          )}
        </Section>

        {/* ── Step 2: Bot Control ── */}
        <Section icon={<Activity className="w-3.5 h-3.5" />} title="Bot Control">
          <div className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-2.5">
            <div>
              <p className="text-xs font-medium">
                {bot.status === "RUNNING" ? "Bot is live — signals are active" :
                 bot.status === "PAUSED"  ? "Bot is paused — resume to trade" :
                 "Bot is stopped — start to enable trading"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {bot.strategy} on {bot.market} {bot.timeframe}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {bot.status !== "RUNNING" && (
                <Button size="sm" className="h-7 text-xs bg-success/90 hover:bg-success text-white" onClick={handleStartBot} disabled={isStarting}>
                  {isStarting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" /> Start</>}
                </Button>
              )}
              {bot.status === "RUNNING" && (
                <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10" onClick={handleStopBot} disabled={isStopping}>
                  {isStopping ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><Square className="w-3 h-3 mr-1" /> Stop</>}
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* ── Step 3: Signal & Execute ── */}
        <Section icon={<Zap className="w-3.5 h-3.5" />} title="Signal & Execute">
          <div className="flex flex-col gap-3">
            {/* Get Signal */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs w-full"
              onClick={handleGetSignal}
              disabled={isGettingSignal}
            >
              {isGettingSignal
                ? <><RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> Scanning market…</>
                : <><RefreshCw className="w-3 h-3 mr-1.5" /> Get Live Signal</>
              }
            </Button>

            {/* Signal card */}
            {signal && (
              <div className={`rounded-lg border p-3 ${
                signal.action === "BUY"  ? "border-success/30 bg-success/5" :
                signal.action === "SELL" ? "border-destructive/30 bg-destructive/5" :
                "border-amber-500/30 bg-amber-500/5"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {signal.action === "BUY"  ? <TrendingUp className="w-4 h-4 text-success" /> :
                     signal.action === "SELL" ? <TrendingDown className="w-4 h-4 text-destructive" /> :
                     <Activity className="w-4 h-4 text-amber-500" />}
                    <span className={`font-bold text-sm ${actionColor}`}>{signal.action}</span>
                    <span className="text-xs text-muted-foreground">{signal.market || bot.market}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{signal.confidence}% confidence</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{signal.reason}</p>
                {(signal.stopLoss > 0 || signal.takeProfit > 0) && (
                  <div className="flex gap-3 text-[11px]">
                    {signal.stopLoss > 0  && <span className="text-destructive">SL: {signal.stopLoss}</span>}
                    {signal.takeProfit > 0 && <span className="text-success">TP: {signal.takeProfit}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Direction override */}
            <div className="flex gap-2">
              <button
                onClick={() => setCustomAction("BUY")}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  customAction === "BUY"
                    ? "bg-success text-white border-success"
                    : "border-success/30 text-success hover:bg-success/10"
                }`}
              >▲ BUY</button>
              <button
                onClick={() => setCustomAction("SELL")}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  customAction === "SELL"
                    ? "bg-destructive text-white border-destructive"
                    : "border-destructive/30 text-destructive hover:bg-destructive/10"
                }`}
              >▼ SELL</button>
            </div>

            {/* Lot size */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Lot size</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={lotSize}
                onChange={e => setLotSize(e.target.value)}
                className="bg-accent border border-border rounded-lg px-3 py-1.5 text-xs flex-1"
              />
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                ≈ ${(parseFloat(lotSize || "0") * 100000 * 0.0001).toFixed(0)}/pip
              </span>
            </div>

            {/* Execute */}
            <Button
              className={`h-9 text-sm font-semibold w-full ${
                customAction === "BUY"  ? "bg-success hover:bg-success/90 text-white" :
                customAction === "SELL" ? "bg-destructive hover:bg-destructive/90 text-white" :
                "bg-primary"
              }`}
              onClick={handleExecute}
              disabled={isExecuting || !customAction || displayEquity === 0}
            >
              {isExecuting
                ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Executing…</>
                : customAction
                  ? <><ChevronRight className="w-4 h-4 mr-1" /> Execute {customAction} {lotSize} lots</>
                  : "Select BUY or SELL above"
              }
            </Button>
          </div>
        </Section>

        {/* ── Trade Result ── */}
        {tradeResult && (
          <Section icon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />} title="Execution Result">
            <div className="rounded-lg border border-success/20 bg-success/5 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-xs font-mono font-medium">{tradeResult.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Direction</span>
                <span className={`text-xs font-bold ${tradeResult.action === "BUY" ? "text-success" : "text-destructive"}`}>{tradeResult.action}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Symbol</span>
                <span className="text-xs font-medium">{tradeResult.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Entry Price</span>
                <span className="text-xs font-medium">{tradeResult.executionPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Size</span>
                <span className="text-xs font-medium">{tradeResult.size} lots</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Slippage</span>
                <span className="text-xs text-amber-500">{tradeResult.slippage} pips</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Exec Time</span>
                <span className="text-xs">{tradeResult.executionTime}ms</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                <span className="text-xs font-semibold">Trade P&L</span>
                <span className={`text-sm font-bold ${tradeResult.profit >= 0 ? "text-success" : "text-destructive"}`}>
                  {tradeResult.profit >= 0 ? "+" : ""}${tradeResult.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">New Equity</span>
                <span className="text-sm font-bold text-primary">${tradeResult.brokerEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs w-full mt-1" onClick={() => { setTradeResult(null); handleGetSignal(); }}>
              <RefreshCw className="w-3 h-3 mr-1.5" /> Get Next Signal
            </Button>
          </Section>
        )}
      </div>
    </Card>
  );
}

/* ─── Create Bot Modal ──────────────────────────────────────── */
function CreateBotModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const { toast } = useToast();
  const { data: brokers } = useGetBrokers();
  const createBot = useCreateBot();

  const [name, setName]             = useState("");
  const [templateId, setTemplateId] = useState(STRATEGY_TEMPLATES[0].id);
  const [market, setMarket]         = useState("Forex");
  const [pair, setPair]             = useState("EURUSD");
  const [timeframe, setTimeframe]   = useState("H1");
  const [brokerId, setBrokerId]     = useState<string>("");
  const [isAI, setIsAI]             = useState(false);
  const [saving, setSaving]         = useState(false);

  const template = STRATEGY_TEMPLATES.find(t => t.id === templateId) ?? STRATEGY_TEMPLATES[0];

  const handleMarketChange = (m: string) => {
    setMarket(m);
    setPair(PAIRS[m]?.[0] ?? "EURUSD");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast({ title: "Bot name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const broker = brokers?.find(b => String(b.id) === brokerId);
      await createBot.mutateAsync({
        data: {
          name: name.trim(),
          strategyTemplateId: templateId,
          strategy: template.name,
          market: pair || market,
          timeframe,
          account: broker ? `${broker.broker} ${broker.platform}` : "Live MT5",
          accountNumber: broker ? String(broker.accountNumber) : "",
          isAI,
        } as any,
      });
      toast({ title: "Bot created", description: `${name} is ready. Start it from the table.` });
      onCreate();
      onClose();
    } catch {
      toast({ title: "Failed to create bot", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h3 className="text-base font-bold">Create Trading Bot</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Configure a new automated strategy</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Bot Name */}
          <Field label="Bot Name">
            <input
              className="bg-accent border border-border rounded-lg px-3 py-2 text-sm w-full"
              placeholder="e.g. EURUSD Scalper 1"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Field>

          {/* Strategy */}
          <Field label="Strategy Template">
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {STRATEGY_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTemplateId(t.id); if (t.type === "AI/ML") setIsAI(true); }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${templateId === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                >
                  <p className="font-semibold text-xs leading-tight">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.type}</p>
                </button>
              ))}
            </div>
          </Field>

          {/* Market + Pair */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Market">
              <select
                className="bg-accent border border-border rounded-lg px-3 py-2 text-sm w-full"
                value={market}
                onChange={e => handleMarketChange(e.target.value)}
              >
                {Object.keys(PAIRS).map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Pair / Symbol">
              <select
                className="bg-accent border border-border rounded-lg px-3 py-2 text-sm w-full"
                value={pair}
                onChange={e => setPair(e.target.value)}
              >
                {(PAIRS[market] ?? []).map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          {/* Timeframe */}
          <Field label="Timeframe">
            <div className="flex flex-wrap gap-1.5">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${timeframe === tf ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </Field>

          {/* Broker account */}
          {brokers && brokers.length > 0 && (
            <Field label="Link to Broker Account">
              <select
                className="bg-accent border border-border rounded-lg px-3 py-2 text-sm w-full"
                value={brokerId}
                onChange={e => setBrokerId(e.target.value)}
              >
                <option value="">— Select account —</option>
                {brokers.map(b => (
                  <option key={b.id} value={String(b.id)}>
                    {b.broker} {b.platform} #{b.accountNumber || "—"} (${b.equity.toLocaleString()})
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* AI toggle */}
          <div className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">AI-Enhanced Mode</p>
              <p className="text-[11px] text-muted-foreground">Use sentiment analysis to refine signals</p>
            </div>
            <button
              onClick={() => setIsAI(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isAI ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAI ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border/50">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating…</> : "Create Bot"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper sub-components ───────────────────────────────── */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ title, value, prefix = "", suffix = "", isLoading, valueClass = "text-foreground" }: any) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1 justify-center">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{title}</p>
        {isLoading ? <Skeleton className="h-6 sm:h-8 w-12 sm:w-20" /> : (
          <h3 className={`text-sm sm:text-2xl font-bold leading-tight ${valueClass}`}>
            {prefix}{value?.toLocaleString() ?? 0}{suffix}
          </h3>
        )}
      </CardContent>
    </Card>
  );
}
