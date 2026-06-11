import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStrategies } from "@workspace/api-client-react";

export default function StrategyBuilder() {
  const { data: strategies, isLoading } = useGetStrategies();

  return (
    <Layout title="Strategy Builder" subtitle="Visual drag & drop strategy designer">
      <div className="flex h-full w-full gap-4">
        {/* Components Library */}
        <Card className="w-64 shrink-0 bg-sidebar border-border rounded-lg flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border bg-card">
            <CardTitle className="text-sm">Components</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            <div className="p-2 space-y-4">
              <ComponentSection title="Indicators" items={["RSI", "MACD", "EMA", "SMA", "ATR", "Bollinger Bands"]} />
              <ComponentSection title="AI Components" items={["AI Trend Predictor", "Sentiment Analysis", "Pattern Detector"]} />
              <ComponentSection title="Risk Management" items={["Position Sizer", "Stop Loss", "Take Profit", "Risk Firewall"]} />
              <ComponentSection title="Execution" items={["Market Order", "Limit Order"]} />
            </div>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="flex-1 bg-background rounded-lg border border-border flex flex-col overflow-hidden relative" style={{ backgroundImage: "radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 0)", backgroundSize: "20px 20px" }}>
          
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-3 py-1.5 bg-card border border-border rounded shadow-sm text-sm font-medium">Draft: AI Scalper Pro</div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="px-3 py-1.5 bg-card border border-border rounded text-sm hover:bg-accent">Run Backtest</button>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium">Save Strategy</button>
          </div>

          <div className="m-auto flex items-center gap-8">
            <div className="p-4 bg-card border border-border rounded-lg shadow-sm w-40 text-center text-sm font-medium">Market Data</div>
            <div className="h-[2px] w-8 bg-muted-foreground relative"><div className="absolute right-0 top-[-4px] border-[5px] border-transparent border-l-muted-foreground"></div></div>
            <div className="p-4 bg-card border border-border rounded-lg shadow-sm w-40 text-center text-sm font-medium border-l-4 border-l-primary">AI Trend Predictor</div>
            <div className="h-[2px] w-8 bg-muted-foreground relative"><div className="absolute right-0 top-[-4px] border-[5px] border-transparent border-l-muted-foreground"></div></div>
            <div className="p-4 bg-card border border-border rounded-lg shadow-sm w-40 text-center text-sm font-medium border-l-4 border-l-success">BUY Signal</div>
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="w-80 shrink-0 bg-sidebar border-border rounded-lg flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border bg-card">
            <CardTitle className="text-sm">Strategy Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Strategy Name</label>
              <input type="text" value="AI Scalper Pro" className="w-full bg-accent border border-border rounded p-2 text-sm text-foreground" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Market</label>
              <select className="w-full bg-accent border border-border rounded p-2 text-sm text-foreground">
                <option>EURUSD</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Timeframe</label>
              <select className="w-full bg-accent border border-border rounded p-2 text-sm text-foreground">
                <option>M15</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Risk Per Trade %</label>
              <input type="number" value="1.5" className="w-full bg-accent border border-border rounded p-2 text-sm text-foreground" readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function ComponentSection({ title, items }: { title: string, items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{title}</h3>
      <div className="space-y-1">
        {items.map(item => (
          <div key={item} className="px-3 py-2 bg-background border border-border rounded text-sm hover:border-primary cursor-pointer transition-colors shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}