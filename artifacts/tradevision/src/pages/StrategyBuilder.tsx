import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGetStrategies, useDeployStrategy, useUpdateStrategy } from "@workspace/api-client-react";
import {
  Save, Play, Rocket, ChevronDown, Plus, Trash2, ZoomIn, ZoomOut,
  Move, MousePointer, Grid, ChevronRight, AlertCircle, CheckCircle2,
} from "lucide-react";

type NodeType = "data" | "indicator" | "ai" | "signal" | "risk" | "execute";

type ParamDef = { key: string; label: string; type: "number" | "select" | "toggle"; default: string | number | boolean; options?: string[]; description?: string };

const NODE_PARAMS: Record<string, ParamDef[]> = {
  "RSI (14)": [
    { key: "period", label: "Period", type: "number", default: 14, description: "Lookback bars" },
    { key: "source", label: "Source", type: "select", default: "Close", options: ["Close","Open","High","Low","HL/2","HLC/3"] },
    { key: "overbought", label: "Overbought Level", type: "number", default: 70 },
    { key: "oversold", label: "Oversold Level", type: "number", default: 30 },
  ],
  "MACD": [
    { key: "fast", label: "Fast EMA", type: "number", default: 12 },
    { key: "slow", label: "Slow EMA", type: "number", default: 26 },
    { key: "signal", label: "Signal Period", type: "number", default: 9 },
    { key: "source", label: "Source", type: "select", default: "Close", options: ["Close","Open","HL/2"] },
  ],
  "EMA (21)": [
    { key: "period", label: "Period", type: "number", default: 21 },
    { key: "source", label: "Source", type: "select", default: "Close", options: ["Close","Open","High","Low","HL/2"] },
    { key: "shift", label: "Shift", type: "number", default: 0 },
  ],
  "SMA (50)": [
    { key: "period", label: "Period", type: "number", default: 50 },
    { key: "source", label: "Source", type: "select", default: "Close", options: ["Close","Open","High","Low","HL/2"] },
  ],
  "ATR (14)": [
    { key: "period", label: "Period", type: "number", default: 14 },
    { key: "multiplier", label: "Multiplier", type: "number", default: 1.5, description: "Used for dynamic SL/TP" },
  ],
  "ADX": [
    { key: "period", label: "Period", type: "number", default: 14 },
    { key: "threshold", label: "Trend Threshold", type: "number", default: 25, description: ">25 = trending market" },
  ],
  "Bollinger Bands": [
    { key: "period", label: "Period", type: "number", default: 20 },
    { key: "stddev", label: "Std Deviation", type: "number", default: 2 },
    { key: "source", label: "Source", type: "select", default: "Close", options: ["Close","Open","HL/2"] },
  ],
  "Stochastic": [
    { key: "k", label: "%K Period", type: "number", default: 14 },
    { key: "d", label: "%D Period", type: "number", default: 3 },
    { key: "smooth", label: "Smooth", type: "number", default: 3 },
    { key: "overbought", label: "Overbought", type: "number", default: 80 },
    { key: "oversold", label: "Oversold", type: "number", default: 20 },
  ],
  "CCI": [
    { key: "period", label: "Period", type: "number", default: 14 },
    { key: "overbought", label: "Overbought", type: "number", default: 100 },
    { key: "oversold", label: "Oversold", type: "number", default: -100 },
  ],
  "Volume": [
    { key: "ma_period", label: "MA Period", type: "number", default: 20, description: "Volume moving average" },
    { key: "threshold", label: "Volume Spike (%)", type: "number", default: 150 },
  ],
  "AI Trend Predictor": [
    { key: "confidence", label: "Min Confidence (%)", type: "number", default: 75, description: "Minimum AI confidence to generate signal" },
    { key: "lookback", label: "Lookback Bars", type: "number", default: 100 },
    { key: "model", label: "Model", type: "select", default: "GPT-4 Turbo", options: ["GPT-4 Turbo","Claude 3","Gemini Pro"] },
  ],
  "Sentiment Analysis": [
    { key: "sources", label: "News Sources", type: "select", default: "All", options: ["All","Reuters","Bloomberg","Twitter","Forex Factory"] },
    { key: "lookback_hours", label: "Lookback (hours)", type: "number", default: 6 },
    { key: "min_score", label: "Min Sentiment Score", type: "number", default: 60 },
  ],
  "Volatility Predictor": [
    { key: "model", label: "Model", type: "select", default: "GARCH", options: ["GARCH","EGARCH","ATR-ML","Neural Net"] },
    { key: "period", label: "Training Bars", type: "number", default: 200 },
    { key: "high_vol_threshold", label: "High Vol Threshold", type: "number", default: 80, description: "Percentile cutoff" },
  ],
  "Pattern Detector": [
    { key: "patterns", label: "Pattern Set", type: "select", default: "All Candles", options: ["All Candles","Reversal Only","Continuation Only","Harmonic"] },
    { key: "min_confidence", label: "Min Match (%)", type: "number", default: 80 },
  ],
  "AI Signal Filter": [
    { key: "filter_mode", label: "Filter Mode", type: "select", default: "Strict", options: ["Strict","Moderate","Loose"] },
    { key: "max_daily_signals", label: "Max Daily Signals", type: "number", default: 5 },
  ],
  "Position Sizer": [
    { key: "method", label: "Sizing Method", type: "select", default: "Risk %", options: ["Risk %","Fixed Lots","Kelly Criterion","ATR-based"] },
    { key: "risk_pct", label: "Risk Per Trade (%)", type: "number", default: 2 },
    { key: "max_lots", label: "Max Lot Size", type: "number", default: 5 },
  ],
  "Stop Loss": [
    { key: "type", label: "Stop Type", type: "select", default: "Fixed Pips", options: ["Fixed Pips","ATR Multiple","Support/Resistance","Swing High/Low"] },
    { key: "pips", label: "Distance (Pips)", type: "number", default: 25 },
    { key: "atr_mult", label: "ATR Multiplier", type: "number", default: 1.5 },
  ],
  "Take Profit": [
    { key: "type", label: "TP Type", type: "select", default: "Fixed Pips", options: ["Fixed Pips","RR Ratio","ATR Multiple","Fibonacci"] },
    { key: "pips", label: "Distance (Pips)", type: "number", default: 50 },
    { key: "rr_ratio", label: "R:R Ratio", type: "number", default: 2 },
  ],
  "Trailing Stop": [
    { key: "type", label: "Trail Type", type: "select", default: "ATR", options: ["ATR","Fixed Pips","Parabolic SAR"] },
    { key: "distance", label: "Trail Distance (Pips)", type: "number", default: 15 },
    { key: "step", label: "Step Size (Pips)", type: "number", default: 5 },
  ],
  "Risk Firewall": [
    { key: "max_daily_loss", label: "Max Daily Loss (%)", type: "number", default: 3 },
    { key: "max_open", label: "Max Open Positions", type: "number", default: 5 },
    { key: "block_news", label: "Block During News", type: "toggle", default: true },
  ],
  "Daily Drawdown Guard": [
    { key: "threshold", label: "Drawdown Limit (%)", type: "number", default: 5 },
    { key: "action", label: "Action", type: "select", default: "Stop All Bots", options: ["Stop All Bots","Pause Bot","Notify Only"] },
  ],
  "Market Order": [
    { key: "slippage", label: "Max Slippage (Pips)", type: "number", default: 2 },
    { key: "retry", label: "Retry on Reject", type: "toggle", default: true },
    { key: "comment", label: "Order Comment", type: "select", default: "TradeVision", options: ["TradeVision","Bot ID","Strategy Name"] },
  ],
  "Limit Order": [
    { key: "offset", label: "Offset (Pips)", type: "number", default: 5, description: "Distance from current price" },
    { key: "expiry", label: "Expiry (Hours)", type: "number", default: 4 },
  ],
  "Stop Order": [
    { key: "offset", label: "Offset (Pips)", type: "number", default: 3 },
    { key: "expiry", label: "Expiry (Hours)", type: "number", default: 4 },
  ],
  "Market Data": [
    { key: "symbol", label: "Symbol", type: "select", default: "EURUSD", options: ["EURUSD","XAUUSD","BTCUSD","GBPUSD","USDJPY","NAS100","US500"] },
    { key: "timeframe", label: "Timeframe", type: "select", default: "H1", options: ["M1","M5","M15","M30","H1","H4","D1"] },
    { key: "bars", label: "Bars to Load", type: "number", default: 500 },
  ],
  "BUY Signal": [
    { key: "min_strength", label: "Min Signal Strength (%)", type: "number", default: 70 },
    { key: "session_filter", label: "Session Filter", type: "select", default: "All Sessions", options: ["All Sessions","London","New York","Tokyo","Overlap"] },
  ],
  "SELL Signal": [
    { key: "min_strength", label: "Min Signal Strength (%)", type: "number", default: 70 },
    { key: "session_filter", label: "Session Filter", type: "select", default: "All Sessions", options: ["All Sessions","London","New York","Tokyo","Overlap"] },
  ],
};

interface CanvasNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

const NODE_COLORS: Record<NodeType, string> = {
  data: "border-border bg-card",
  indicator: "border-blue-500/50 bg-blue-500/10",
  ai: "border-primary/60 bg-primary/10",
  signal: "border-success/60 bg-success/10",
  risk: "border-amber-500/50 bg-amber-500/10",
  execute: "border-cyan-500/50 bg-cyan-500/10",
};

const NODE_LABEL_COLORS: Record<NodeType, string> = {
  data: "text-foreground",
  indicator: "text-blue-400",
  ai: "text-primary",
  signal: "text-success",
  risk: "text-amber-400",
  execute: "text-cyan-400",
};

const DEFAULT_NODES: CanvasNode[] = [
  { id: "1", label: "Market Data", type: "data", x: 20, y: 120 },
  { id: "2", label: "EMA (21)", type: "indicator", x: 190, y: 60 },
  { id: "3", label: "RSI (14)", type: "indicator", x: 190, y: 180 },
  { id: "4", label: "AI Trend Predictor", type: "ai", x: 370, y: 120 },
  { id: "5", label: "BUY Signal", type: "signal", x: 550, y: 60 },
  { id: "6", label: "SELL Signal", type: "signal", x: 550, y: 200 },
  { id: "7", label: "Position Sizer", type: "risk", x: 720, y: 60 },
  { id: "8", label: "Execute Order", type: "execute", x: 890, y: 120 },
];

const CONNECTIONS: [string, string][] = [
  ["1", "2"], ["1", "3"], ["2", "4"], ["3", "4"],
  ["4", "5"], ["4", "6"], ["5", "7"], ["7", "8"], ["6", "8"],
];

export default function StrategyBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: strategies } = useGetStrategies();
  const deployStrategy = useDeployStrategy();
  const updateStrategy = useUpdateStrategy();

  const [strategyName, setStrategyName] = useState("AI Scalper Pro");
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("M15");
  const [riskPerTrade, setRiskPerTrade] = useState("2.0");
  const [takeProfit, setTakeProfit] = useState("50");
  const [stopLoss, setStopLoss] = useState("25");
  const [zoom, setZoom] = useState(1);
  const [nodes, setNodes] = useState<CanvasNode[]>(DEFAULT_NODES);
  const [connections, setConnections] = useState<[string, string][]>(CONNECTIONS);
  const [activeTab, setActiveTab] = useState<"canvas" | "results">("canvas");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getCanvasPos = (e: React.MouseEvent | React.DragEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left + canvasRef.current.scrollLeft - 32) / zoom;
    const y = (e.clientY - rect.top + canvasRef.current.scrollTop - 56) / zoom;
    return { x, y };
  };

  const getComponentType = (label: string): NodeType => {
    if (["RSI (14)", "MACD", "EMA (21)", "SMA (50)", "ATR (14)", "ADX", "Bollinger Bands", "Stochastic", "CCI", "Volume"].includes(label)) return "indicator";
    if (["AI Trend Predictor", "Sentiment Analysis", "Volatility Predictor", "Pattern Detector", "AI Signal Filter"].includes(label)) return "ai";
    if (["Position Sizer", "Stop Loss", "Take Profit", "Trailing Stop", "Risk Firewall", "Daily Drawdown Guard"].includes(label)) return "risk";
    if (["Market Order", "Limit Order", "Stop Order"].includes(label)) return "execute";
    return "data";
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getCanvasPos(e);
    const node = nodes.find(n => n.id === nodeId)!;
    dragOffset.current = { x: pos.x - node.x, y: pos.y - node.y };
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const pos = getCanvasPos(e);
    setNodes(prev => prev.map(n => n.id === draggingNodeId ? {
      ...n,
      x: Math.max(0, pos.x - dragOffset.current.x),
      y: Math.max(0, pos.y - dragOffset.current.y),
    } : n));
  };

  const handleCanvasMouseUp = () => setDraggingNodeId(null);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const label = e.dataTransfer.getData("component");
    if (!label) return;
    const pos = getCanvasPos(e);
    const type = getComponentType(label);
    const newId = String(Date.now());
    setNodes(prev => [...prev, { id: newId, label, type, x: Math.max(0, pos.x - 70), y: Math.max(0, pos.y - 20) }]);
    toast({ title: "Component added", description: `"${label}" dropped onto canvas.` });
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(([f, t]) => f !== nodeId && t !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setIsSaving(false);
    toast({ title: "Strategy saved", description: `"${strategyName}" has been saved successfully.` });
  };

  const handleRunBacktest = () => {
    toast({ title: "Opening Backtesting", description: `Running backtest for "${strategyName}"...` });
    setTimeout(() => setLocation("/backtesting"), 400);
  };

  const handleDeployMT4 = async () => {
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsDeploying(false);
    toast({ title: "Strategy deployed to MT4", description: `"${strategyName}" is now live on your MT4 account.` });
  };

  const handleDeployMT5 = async () => {
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsDeploying(false);
    toast({ title: "Strategy deployed to MT5", description: `"${strategyName}" is now live on your MT5 account.` });
  };

  const backtestMetrics = [
    { label: "Net Profit", value: "$12,540.75", color: "text-success" },
    { label: "Win Rate", value: "78.57%", color: "text-success" },
    { label: "Profit Factor", value: "1.87", color: "" },
    { label: "Sharpe Ratio", value: "2.14", color: "" },
    { label: "Max Drawdown", value: "4.12%", color: "text-destructive" },
    { label: "Total Trades", value: "126", color: "" },
  ];

  return (
    <Layout title="Strategy Builder" subtitle="Visual drag & drop strategy designer">
      <div className="flex flex-col h-full gap-3">

        {/* Top toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Strategy:</span>
            <input
              value={strategyName}
              onChange={e => setStrategyName(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground focus:outline-none w-32"
              data-testid="input-strategy-name"
            />
            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
          </div>

          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="select-symbol"
          >
            {["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD", "USDJPY", "AUDUSD", "NAS100"].map(s => <option key={s}>{s}</option>)}
          </select>

          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="select-timeframe"
          >
            {["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"].map(t => <option key={t}>{t}</option>)}
          </select>

          <div className="flex items-center gap-1 ml-auto">
            <Button variant="outline" size="sm" className="h-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} data-testid="button-zoom-out"><ZoomOut className="w-3.5 h-3.5" /></Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} data-testid="button-zoom-in"><ZoomIn className="w-3.5 h-3.5" /></Button>
          </div>

          <Button variant="outline" size="sm" className="h-8" onClick={handleRunBacktest} data-testid="button-run-backtest">
            <Play className="w-3.5 h-3.5 mr-1.5" />Run Backtest
          </Button>
          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving} data-testid="button-save-strategy">
            <Save className="w-3.5 h-3.5 mr-1.5" />{isSaving ? "Saving…" : "Save Strategy"}
          </Button>

          {/* Deploy dropdown */}
          <div className="relative group">
            <Button size="sm" className="h-8 bg-success/90 hover:bg-success text-white" disabled={isDeploying} data-testid="button-deploy">
              <Rocket className="w-3.5 h-3.5 mr-1.5" />{isDeploying ? "Deploying…" : "Deploy"}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-xl z-50 hidden group-hover:block">
              <button onClick={handleDeployMT4} className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent rounded-t-lg" data-testid="button-deploy-mt4">Deploy to MT4</button>
              <button onClick={handleDeployMT5} className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent rounded-b-lg" data-testid="button-deploy-mt5">Deploy to MT5</button>
            </div>
          </div>
        </div>

        {/* Main workspace */}
        <div className="flex flex-1 min-h-0 gap-3">

          {/* Components sidebar — hidden on mobile unless toggled */}
          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-52 shrink-0 bg-card border border-border rounded-lg flex flex-col overflow-hidden`}>
            <div className="py-2.5 px-3 border-b border-border/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Components</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              <ComponentSection title="Indicators" items={["RSI (14)", "MACD", "EMA (21)", "SMA (50)", "ATR (14)", "ADX", "Bollinger Bands", "Stochastic", "CCI", "Volume"]} />
              <ComponentSection title="AI Components" items={["AI Trend Predictor", "Sentiment Analysis", "Volatility Predictor", "Pattern Detector", "AI Signal Filter"]} />
              <ComponentSection title="Risk Management" items={["Position Sizer", "Stop Loss", "Take Profit", "Trailing Stop", "Risk Firewall", "Daily Drawdown Guard"]} />
              <ComponentSection title="Order Execution" items={["Market Order", "Limit Order", "Stop Order"]} />
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 min-w-0 bg-background border border-border rounded-lg relative overflow-hidden">
            {/* Mobile toggle for component panel */}
            <button
              className="lg:hidden absolute top-2 left-2 z-10 bg-card border border-border rounded-md px-2 py-1 text-xs text-muted-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-toggle-components"
            >
              {sidebarOpen ? "Hide" : "Components"}
            </button>

            {/* Dot grid background */}
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(hsl(var(--muted-foreground)/0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }}
            />

            {/* Tabs */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 bg-card border border-border rounded-lg p-0.5 z-10">
              <button onClick={() => setActiveTab("canvas")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${activeTab === "canvas" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="tab-canvas">Canvas</button>
              <button onClick={() => setActiveTab("results")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${activeTab === "results" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="tab-results">Backtest Results</button>
            </div>

            {activeTab === "canvas" ? (
              /* Node canvas */
              <div
                ref={canvasRef}
                className="absolute inset-0 overflow-auto p-8 pt-14 select-none"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onDrop={handleCanvasDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => setSelectedNodeId(null)}
                style={{ cursor: draggingNodeId ? "grabbing" : "default" }}
              >
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "1100px", height: "380px", position: "relative" }}>
                  {/* SVG arrows */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                    {connections.map(([from, to]) => {
                      const f = nodes.find(n => n.id === from);
                      const t = nodes.find(n => n.id === to);
                      if (!f || !t) return null;
                      const x1 = f.x + 140, y1 = f.y + 24;
                      const x2 = t.x, y2 = t.y + 24;
                      const cx = (x1 + x2) / 2;
                      const isActive = selectedNodeId === from || selectedNodeId === to;
                      return (
                        <g key={`${from}-${to}`}>
                          <path d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                            stroke={isActive ? "hsl(var(--primary)/0.8)" : "hsl(var(--muted-foreground)/0.4)"}
                            strokeWidth={isActive ? 2 : 1.5} fill="none" />
                          <polygon
                            points={`${x2},${y2} ${x2 - 7},${y2 - 4} ${x2 - 7},${y2 + 4}`}
                            fill={isActive ? "hsl(var(--primary)/0.8)" : "hsl(var(--muted-foreground)/0.4)"} />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      style={{ position: "absolute", left: node.x, top: node.y, width: 140, cursor: draggingNodeId === node.id ? "grabbing" : "grab" }}
                      className={`border-2 rounded-xl px-3 py-3 shadow-md group transition-shadow ${NODE_COLORS[node.type]} ${selectedNodeId === node.id ? "ring-2 ring-primary shadow-primary/20 shadow-lg" : ""} ${draggingNodeId === node.id ? "opacity-80" : ""}`}
                      onMouseDown={e => handleNodeMouseDown(e, node.id)}
                      onClick={e => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                      data-testid={`node-${node.id}`}
                    >
                      <button
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white text-[10px] leading-5 text-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive/80"
                        onClick={e => { e.stopPropagation(); deleteNode(node.id); }}
                        data-testid={`delete-node-${node.id}`}
                      >×</button>
                      <p className={`text-xs font-semibold text-center ${NODE_LABEL_COLORS[node.type]}`}>{node.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Backtest results */
              <div className="absolute inset-0 overflow-auto p-4 pt-14">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Backtest Complete — {symbol} {timeframe} · Jan 2024 – May 2024</span>
                  <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={() => setLocation("/backtesting")} data-testid="button-view-full-backtest">
                    View Full Report <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {backtestMetrics.map(m => (
                    <div key={m.label} className="bg-card border border-border rounded-lg px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Equity Curve Preview</p>
                  {/* Simple sparkline */}
                  <svg viewBox="0 0 400 80" className="w-full h-16">
                    <defs>
                      <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 70 C 50 65, 80 55, 120 45 S 180 30, 220 25 S 300 15, 350 10 L 400 8" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
                    <path d="M 0 70 C 50 65, 80 55, 120 45 S 180 30, 220 25 S 300 15, 350 10 L 400 8 L 400 80 L 0 80 Z" fill="url(#eq-grad)" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Settings / Node Properties panel */}
          <div className="hidden lg:flex w-64 shrink-0 bg-card border border-border rounded-lg flex-col overflow-hidden">
            {selectedNodeId ? (
              <NodePropertiesPanel
                node={nodes.find(n => n.id === selectedNodeId)!}
                nodes={nodes}
                connections={connections}
                onDelete={() => deleteNode(selectedNodeId)}
                onConnect={(from, to) => {
                  if (!connections.find(([f, t]) => f === from && t === to)) {
                    setConnections(prev => [...prev, [from, to]]);
                    toast({ title: "Connected", description: `Linked components in the strategy.` });
                  }
                }}
                onDisconnect={(from, to) => setConnections(prev => prev.filter(([f, t]) => !(f === from && t === to)))}
              />
            ) : (
              <StrategySettingsPanel
                strategyName={strategyName}
                setStrategyName={setStrategyName}
                symbol={symbol}
                setSymbol={setSymbol}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                riskPerTrade={riskPerTrade}
                setRiskPerTrade={setRiskPerTrade}
                takeProfit={takeProfit}
                setTakeProfit={setTakeProfit}
                stopLoss={stopLoss}
                setStopLoss={setStopLoss}
                isSaving={isSaving}
                isDeploying={isDeploying}
                onSave={handleSave}
                onDeploy={handleDeployMT5}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── Node Properties Panel ────────────────────────────────────────────────────
function NodePropertiesPanel({
  node, nodes, connections, onDelete, onConnect, onDisconnect,
}: {
  node: CanvasNode;
  nodes: CanvasNode[];
  connections: [string, string][];
  onDelete: () => void;
  onConnect: (from: string, to: string) => void;
  onDisconnect: (from: string, to: string) => void;
}) {
  const params = NODE_PARAMS[node.label] ?? [];
  const [paramValues, setParamValues] = useState<Record<string, string | number | boolean>>(() =>
    Object.fromEntries(params.map(p => [p.key, p.default]))
  );

  const connectedInputs = connections.filter(([, to]) => to === node.id).map(([from]) => nodes.find(n => n.id === from)?.label ?? from);
  const connectedOutputs = connections.filter(([from]) => from === node.id).map(([, to]) => nodes.find(n => n.id === to)?.label ?? to);
  const availableInputs = nodes.filter(n => n.id !== node.id && !connections.find(([, t]) => t === node.id && connections.find(([f]) => f === n.id)));

  const nodeTypeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

  return (
    <div className="flex flex-col h-full">
      <div className={`py-2.5 px-3 border-b border-border/50 flex items-center justify-between ${NODE_COLORS[node.type]}`}>
        <div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${NODE_LABEL_COLORS[node.type]}`}>{nodeTypeLabel}</span>
          <p className="text-xs font-bold text-foreground leading-tight mt-0.5">{node.label}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-destructive hover:bg-destructive/10 rounded-md p-1 transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Parameters */}
        {params.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Parameters</p>
            {params.map(p => (
              <div key={p.key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{p.label}</label>
                {p.type === "number" && (
                  <input
                    type="number"
                    value={String(paramValues[p.key] ?? p.default)}
                    onChange={e => setParamValues(prev => ({ ...prev, [p.key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
                {p.type === "select" && (
                  <select
                    value={String(paramValues[p.key] ?? p.default)}
                    onChange={e => setParamValues(prev => ({ ...prev, [p.key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {p.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {p.type === "toggle" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(paramValues[p.key] ?? p.default)}
                      onChange={e => setParamValues(prev => ({ ...prev, [p.key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">{Boolean(paramValues[p.key] ?? p.default) ? "Enabled" : "Disabled"}</span>
                  </div>
                )}
                {p.description && <p className="text-[10px] text-muted-foreground/60">{p.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-3">No configurable parameters</div>
        )}

        {/* Connected Inputs */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Inputs ({connectedInputs.length})</p>
          {connectedInputs.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60">No inputs connected</p>
          ) : (
            connectedInputs.map((label, i) => {
              const srcNode = nodes.find(n => n.label === label)!;
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${NODE_LABEL_COLORS[srcNode?.type ?? "data"].replace("text-", "bg-")}`} />
                    <span className="text-foreground font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (srcNode) onDisconnect(srcNode.id, node.id);
                    }}
                    className="text-[10px] text-destructive/70 hover:text-destructive"
                  >✕</button>
                </div>
              );
            })
          )}

          {/* Add input connection */}
          {availableInputs.length > 0 && (
            <select
              className="w-full bg-background border border-border rounded-md px-2 py-1 text-[10px] text-muted-foreground"
              value=""
              onChange={e => { if (e.target.value) onConnect(e.target.value, node.id); }}
            >
              <option value="">+ Connect input…</option>
              {availableInputs.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Connected Outputs */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Outputs ({connectedOutputs.length})</p>
          {connectedOutputs.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60">No outputs connected</p>
          ) : (
            connectedOutputs.map((label, i) => {
              const tgtNode = nodes.find(n => n.label === label)!;
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${NODE_LABEL_COLORS[tgtNode?.type ?? "data"].replace("text-", "bg-")}`} />
                    <span className="text-foreground font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (tgtNode) onDisconnect(node.id, tgtNode.id);
                    }}
                    className="text-[10px] text-destructive/70 hover:text-destructive"
                  >✕</button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-3 border-t border-border/50">
        <button
          className="w-full text-[10px] text-muted-foreground text-center hover:text-foreground py-1"
          onClick={() => {}}
        >
          Click canvas to deselect
        </button>
      </div>
    </div>
  );
}

// ─── Strategy Settings Panel (shown when no node selected) ────────────────────
function StrategySettingsPanel({
  strategyName, setStrategyName, symbol, setSymbol, timeframe, setTimeframe,
  riskPerTrade, setRiskPerTrade, takeProfit, setTakeProfit, stopLoss, setStopLoss,
  isSaving, isDeploying, onSave, onDeploy,
}: any) {
  return (
    <>
      <div className="py-2.5 px-3 border-b border-border/50">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Strategy Settings</span>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click a node to configure it</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Strategy Name</label>
          <Input value={strategyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStrategyName(e.target.value)} className="h-8 text-sm" data-testid="input-settings-name" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Symbol</label>
          <select value={symbol} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSymbol(e.target.value)} className="w-full bg-accent border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" data-testid="select-settings-symbol">
            {["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD", "USDJPY", "AUDUSD", "NAS100"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Timeframe</label>
          <select value={timeframe} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value)} className="w-full bg-accent border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" data-testid="select-settings-timeframe">
            {["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Risk Per Trade (%)</label>
          <Input value={riskPerTrade} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRiskPerTrade(e.target.value)} type="number" className="h-8 text-sm" data-testid="input-risk-per-trade" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Take Profit (Pips)</label>
          <Input value={takeProfit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTakeProfit(e.target.value)} type="number" className="h-8 text-sm" data-testid="input-take-profit" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Stop Loss (Pips)</label>
          <Input value={stopLoss} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStopLoss(e.target.value)} type="number" className="h-8 text-sm" data-testid="input-stop-loss" />
        </div>
        <div className="pt-2 border-t border-border/50 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deploy</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Account</label>
            <select className="w-full bg-accent border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" data-testid="select-deploy-account">
              <option>MT5 IC Markets (#12345678)</option>
              <option>MT5 Exness (#87654321)</option>
              <option>MT4 Deriv (#11223344)</option>
            </select>
          </div>
          <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90" onClick={onSave} data-testid="button-save-settings">Save Settings</Button>
          <Button className="w-full h-8 text-xs bg-success/90 hover:bg-success text-white" onClick={onDeploy} disabled={isDeploying} data-testid="button-deploy-settings">
            <Rocket className="w-3 h-3 mr-1" />{isDeploying ? "Deploying…" : "Deploy Strategy"}
          </Button>
        </div>
      </div>
    </>
  );
}

function ComponentSection({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1"
        data-testid={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-1">
          {items.map(item => (
            <div
              key={item}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("component", item);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="px-2.5 py-1.5 bg-background border border-border rounded-md text-xs hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-colors flex items-center gap-1.5"
              data-testid={`component-${item.toLowerCase().replace(/[\s()]+/g, "-")}`}
            >
              <Move className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
