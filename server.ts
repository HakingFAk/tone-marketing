import express from "express";
import helmet from "helmet";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { registerOAuthRoutes } from "./server/_core/oauth.ts";
import { createContext } from "./server/_core/context.ts";
import {
  apiRateLimiter,
  assertRuntimeSecurity,
  authRateLimiter,
  rejectCrossOriginWrites,
} from "./server/_core/security.ts";
import { appRouter } from "./server/routers.ts";

assertRuntimeSecurity();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              connectSrc: ["'self'", "https:"],
              fontSrc: [
                "'self'",
                "data:",
                "https://fonts.gstatic.com",
              ],
              frameAncestors: ["'self'"],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              mediaSrc: ["'self'", "blob:", "https:"],
              objectSrc: ["'none'"],
              scriptSrc: ["'self'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              upgradeInsecureRequests: [],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  }),
);

/*
 * API
 */
app.use("/api", apiRateLimiter);
app.use("/api", rejectCrossOriginWrites);

app.use(express.json({ limit: "2mb" }));
app.use(
  express.urlencoded({
    limit: "100kb",
    extended: false,
  }),
);

/*
 * OAuth
 */
app.use("/api/oauth", authRateLimiter);
registerOAuthRoutes(app);

/*
 * tRPC
 */
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

/*
 * Frontend React/Vite
 *
 * O comando `pnpm run build` gera o frontend em:
 * dist/public
 */
const clientDistPath = path.resolve(
  process.cwd(),
  "dist",
  "public",
);

/*
 * Arquivos estáticos:
 * /assets/*
 * /media/*
 * etc.
 */
app.use(express.static(clientDistPath));

/*
 * SPA fallback.
 *
 * Qualquer rota que não tenha sido atendida pela API
 * ou pelos arquivos estáticos recebe o index.html.
 *
 * Express 5 usa a sintaxe /{*splat}.
 */
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

export default app;