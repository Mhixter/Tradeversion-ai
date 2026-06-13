import { useEffect, useRef, useState, useCallback } from "react";

export type WsTick = {
  type: "tick";
  timestamp: number;
  summary: {
    totalEquity: number;
    dailyProfit: number;
    activeBots: number;
    winRate: number;
    equityChange24h: number;
    profitChange: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  signals: Array<{
    id: number;
    symbol: string;
    direction: "BUY" | "SELL";
    confidence: number;
    price: number;
  }>;
  bots: Array<{
    id: number;
    name: string;
    symbol: string;
    status: string;
    pnlToday: number;
    pnlAllTime: number;
  }>;
};

type WsState = {
  connected: boolean;
  lastTick: WsTick | null;
  lastUpdated: number | null;
};

const RECONNECT_DELAY = 3000;

export function useWebSocket(): WsState {
  const [state, setState] = useState<WsState>({
    connected: false,
    lastTick: null,
    lastUpdated: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  const connect = useCallback(() => {
    if (unmounted.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted.current) return;
        setState(s => ({ ...s, connected: true }));
      };

      ws.onmessage = (evt) => {
        if (unmounted.current) return;
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type === "tick") {
            setState(s => ({
              ...s,
              lastTick: msg as WsTick,
              lastUpdated: Date.now(),
            }));
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        setState(s => ({ ...s, connected: false }));
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };
    } catch {
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    }
  }, []);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}
