import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";
import { workerManager } from "./refer-project/workerManager.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// Start Refer Project worker manager (non-blocking — recovers active accounts after restart)
workerManager.start().catch(err => logger.error({ err }, "Refer Project worker manager failed to start"));

// In production, serve the built React frontend and handle client-side routing
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Bundled binary lives at artifacts/api-server/dist/index.mjs;
  // frontend is built to artifacts/tradevision/dist/public/ (two levels up from dist/)
  const staticDir = path.resolve(__dirname, "../../tradevision/dist/public");

  app.use(express.static(staticDir));

  // SPA fallback — all non-API routes serve index.html
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
