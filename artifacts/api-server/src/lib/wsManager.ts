import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

const BROADCAST_INTERVAL_MS = 5000;

const SIGNALS = [
  { id: 1, symbol: "EURUSD", direction: "BUY",  baseConf: 92, basePrice: 1.08350 },
  { id: 2, symbol: "XAUUSD", direction: "SELL", baseConf: 84, basePrice: 2345.40 },
  { id: 3, symbol: "BTCUSD", direction: "BUY",  baseConf: 87, basePrice: 67500.00 },
  { id: 4, symbol: "GBPUSD", direction: "BUY",  baseConf: 76, basePrice: 1.26500 },
  { id: 5, symbol: "USDJPY", direction: "SELL", baseConf: 81, basePrice: 156.245 },
  { id: 6, symbol: "ETHUSD", direction: "BUY",  baseConf: 78, basePrice: 3540.00 },
];

function jitter(val: number, pct: number) {
  return val * (1 + (Math.random() - 0.5) * 2 * pct);
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

let wss: WebSocketServer | null = null;

let signalState = SIGNALS.map(s => ({ ...s, price: s.basePrice, confidence: s.baseConf }));

function broadcast(data: object) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

async function tick() {
  // Only broadcast market signals — no fake user-specific equity/P&L data.
  // Dashboard summary is fetched from the authenticated REST endpoint.
  signalState = signalState.map(s => ({
    ...s,
    price: jitter(s.price, 0.0005),
    confidence: clamp(Math.round(jitter(s.confidence, 0.04)), 55, 99),
  }));

  broadcast({
    type: "tick",
    timestamp: Date.now(),
    signals: signalState.map(s => ({
      id: s.id,
      symbol: s.symbol,
      direction: s.direction,
      confidence: s.confidence,
      price: Math.round(s.price * 100000) / 100000,
    })),
  });
}

export function createWsServer(server: import("http").Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: WebSocket, _req: IncomingMessage) => {
    socket.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
  });

  const interval = setInterval(tick, BROADCAST_INTERVAL_MS);

  server.on("close", () => {
    clearInterval(interval);
    wss?.close();
  });

  return wss;
}
