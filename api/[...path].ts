import express from "express";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { registerOAuthRoutes } from "../server/_core/oauth";
import { createContext } from "../server/_core/context";
import {
  apiRateLimiter,
  assertRuntimeSecurity,
  authRateLimiter,
  rejectCrossOriginWrites,
} from "../server/_core/security";
import { appRouter } from "../server/routers";

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