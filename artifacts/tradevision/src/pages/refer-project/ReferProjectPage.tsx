import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReferSection =
  | "Dashboard"
  | "Connected Accounts"
  | "Trading Rules"
  | "AI Decision Engine"
  | "Trade Monitor"
  | "Statistics"
  | "Logs"
  | "Settings";

interface ReferProjectPageProps {
  section: ReferSection;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

export function ReferProjectPage({ section }: ReferProjectPageProps) {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["refer-project-dashboard"],
    queryFn: () => getJson<any>("/api/refer-project/dashboard"),
    enabled: section === "Dashboard",
  });

  const accountsQuery = useQuery({
    queryKey: ["refer-project-accounts"],
    queryFn: () => getJson<any[]>("/api/refer-project/accounts"),
    enabled: section === "Connected Accounts" || section === "Trade Monitor" || section === "Dashboard",
  });

  const rulesQuery = useQuery({
    queryKey: ["refer-project-rules"],
    queryFn: () => getJson<any>("/api/refer-project/trading-rules"),
    enabled: section === "Trading Rules",
  });

  const aiQuery = useQuery({
    queryKey: ["refer-project-ai"],
    queryFn: () => getJson<any>("/api/refer-project/ai-engine"),
    enabled: section === "AI Decision Engine",
  });

  const monitorQuery = useQuery({
    queryKey: ["refer-project-monitor"],
    queryFn: () => getJson<any[]>("/api/refer-project/trades/monitor"),
    enabled: section === "Trade Monitor",
    refetchInterval: 10_000,
  });

  const statisticsQuery = useQuery({
    queryKey: ["refer-project-statistics"],
    queryFn: () => getJson<any>("/api/refer-project/statistics"),
    enabled: section === "Statistics",
  });

  const logsQuery = useQuery({
    queryKey: ["refer-project-logs"],
    queryFn: () => getJson<any[]>("/api/refer-project/logs?limit=200"),
    enabled: section === "Logs",
  });

  const settingsQuery = useQuery({
    queryKey: ["refer-project-settings"],
    queryFn: () => getJson<any>("/api/refer-project/settings"),
    enabled: section === "Settings",
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch("/api/refer-project/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["refer-project-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["refer-project-dashboard"] });
    },
  });

  const startAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/refer-project/accounts/${accountId}/start`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to start account");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["refer-project-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["refer-project-dashboard"] });
    },
  });

  return (
    <Layout title="Refer Project" subtitle={section}>
      <div className="flex flex-col gap-4">
        {section === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              ["Connected Accounts", dashboardQuery.data?.connectedAccounts],
              ["Running Accounts", dashboardQuery.data?.runningAccounts],
              ["Stopped Accounts", dashboardQuery.data?.stoppedAccounts],
              ["Open Positions", dashboardQuery.data?.openPositions],
              ["Trades Today", dashboardQuery.data?.tradesToday],
              ["Closed Trades", dashboardQuery.data?.closedTrades],
              ["Total Lots", dashboardQuery.data?.totalLots],
              ["Current Floating P/L", dashboardQuery.data?.currentFloatingPL],
              ["Today's Profit", dashboardQuery.data?.todaysProfit],
              ["Today's Loss", dashboardQuery.data?.todaysLoss],
              ["AI Confidence", dashboardQuery.data?.aiConfidence],
              ["Current Market Direction", dashboardQuery.data?.currentMarketDirection],
            ].map(([label, value]) => (
              <Card key={String(label)}>
                <CardHeader className="pb-2"><CardTitle className="text-xs">{String(label)}</CardTitle></CardHeader>
                <CardContent className="text-lg font-semibold">{value ?? "-"}</CardContent>
              </Card>
            ))}
          </div>
        )}

        {section === "Connected Accounts" && (
          <Card>
            <CardHeader><CardTitle>Connected Accounts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(accountsQuery.data ?? []).map((account) => (
                <div key={account.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-semibold">{account.accountName}</div>
                    <div className="text-xs text-muted-foreground">{account.brokerName} · {account.server} · {account.connectionStatus}</div>
                  </div>
                  <Button size="sm" onClick={() => startAccountMutation.mutate(account.id)} disabled={account.status === "running"}>
                    {account.status === "running" ? "Running" : "Start"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "Trading Rules" && (
          <Card>
            <CardHeader><CardTitle>Trading Rules</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(rulesQuery.data ?? {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-border/50 py-1">
                  <span className="font-medium">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "AI Decision Engine" && (
          <Card>
            <CardHeader><CardTitle>AI Decision Engine</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Minimum Threshold: {aiQuery.data?.threshold ?? "-"}</div>
              <div className="text-sm font-medium">Weights</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(aiQuery.data?.weights ?? {}).map(([key, value]) => (
                  <div key={key} className="border rounded p-2">{key}: {String(value)}%</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {section === "Trade Monitor" && (
          <Card>
            <CardHeader><CardTitle>Trade Monitor</CardTitle></CardHeader>
            <CardContent className="overflow-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left border-b">
                    {[
                      "Ticket", "Account", "Pair", "BUY/SELL", "Lot", "Open Time", "Remaining Time", "Profit/Loss", "Status", "Close Reason",
                    ].map((col) => <th key={col} className="p-2">{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(monitorQuery.data ?? []).map((trade) => (
                    <tr key={trade.id} className="border-b border-border/30">
                      <td className="p-2">{trade.ticket}</td>
                      <td className="p-2">{trade.accountName}</td>
                      <td className="p-2">{trade.pair}</td>
                      <td className="p-2">{trade.direction}</td>
                      <td className="p-2">{trade.lot}</td>
                      <td className="p-2">{new Date(trade.openTime).toLocaleString()}</td>
                      <td className="p-2">{trade.remainingTimeSeconds}s</td>
                      <td className="p-2">{trade.profitLoss}</td>
                      <td className="p-2">{trade.status}</td>
                      <td className="p-2">{trade.closeReason ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {section === "Statistics" && (
          <Card>
            <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
              {[
                ["Total Trades", statisticsQuery.data?.totalTrades],
                ["Winning Trades", statisticsQuery.data?.winningTrades],
                ["Losing Trades", statisticsQuery.data?.losingTrades],
                ["Win Rate", `${statisticsQuery.data?.winRate ?? 0}%`],
                ["Average Profit", statisticsQuery.data?.averageProfit],
                ["Average Loss", statisticsQuery.data?.averageLoss],
                ["Average Holding Time", `${statisticsQuery.data?.averageHoldingTimeSeconds ?? 0}s`],
                ["Largest Win", statisticsQuery.data?.largestWin],
                ["Largest Loss", statisticsQuery.data?.largestLoss],
                ["Total Lots", statisticsQuery.data?.totalLots],
              ].map(([label, value]) => (
                <div key={String(label)} className="border rounded p-3">
                  <div className="text-muted-foreground text-xs">{String(label)}</div>
                  <div className="font-semibold">{value ?? "-"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "Logs" && (
          <Card>
            <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(logsQuery.data ?? []).map((log) => (
                <div key={log.id} className="border rounded p-2 text-xs">
                  <div className="font-semibold">{log.eventType}</div>
                  <div>{log.message}</div>
                  <div className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "Settings" && (
          <Card>
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-semibold text-sm">Enable Refer Project</div>
                  <div className="text-xs text-muted-foreground">Turn module on/off without affecting other app features</div>
                </div>
                <Button
                  onClick={() => toggleEnabledMutation.mutate(!settingsQuery.data?.enabled)}
                  disabled={toggleEnabledMutation.isPending}
                >
                  {settingsQuery.data?.enabled ? "Disable" : "Enable"}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div>Close After Minutes</div>
                  <Input value={String(settingsQuery.data?.closeAfterMinutes ?? "")} readOnly />
                </div>
                <div className="space-y-1">
                  <div>Lot Size</div>
                  <Input value={String(settingsQuery.data?.lotSize ?? "")} readOnly />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div>Allowed Symbols</div>
                  <Input value={(settingsQuery.data?.allowedSymbols ?? []).join(", ")} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
