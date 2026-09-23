import express from "express";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { registerOAuthRoutes } from "../server/_core/oauth.js";
import { createContext } from "../server/_core/context.js";
import {
  apiRateLimiter,
  assertRuntimeSecurity,
  authRateLimiter,
  rejectCrossOriginWrites,
} from "../server/_core/security.js";
import { appRouter } from "../server/routers.js";

assertRuntimeSecurity();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  }),
);

app.use(apiRateLimiter);
app.use(rejectCrossOriginWrites);

app.use(express.json({ limit: "2mb" }));
app.use(
  express.urlencoded({
    limit: "100kb",
    extended: false,
  }),
);

app.use("/oauth", authRateLimiter);
registerOAuthRoutes(app);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;