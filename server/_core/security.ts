import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizedOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getTrustedOrigins(appBaseUrl = process.env.APP_BASE_URL) {
  const origins = new Set<string>();
  if (appBaseUrl) {
    const origin = normalizedOrigin(appBaseUrl);
    if (origin) origins.add(origin);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

export function rejectCrossOriginWrites(req: Request, res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method)) return next();

  const origin = req.headers.origin;
  if (!origin) return next();

  if (!getTrustedOrigins().has(origin)) {
    res.status(403).json({ error: "Origem da requisição não autorizada." });
    return;
  }

  return next();
}

export const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: positiveInt(process.env.API_RATE_LIMIT_PER_15_MIN, 300),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS",
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});

export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: positiveInt(process.env.AUTH_RATE_LIMIT_PER_15_MIN, 20),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS",
  message: { error: "Muitas tentativas de autenticação. Aguarde e tente novamente." },
});

export function assertRuntimeSecurity() {
  if (process.env.NODE_ENV !== "production") return;

  const sessionSecret = process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? "";
  if (sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres em produção.");
  }

  const appBaseUrl = process.env.APP_BASE_URL ?? "";
  if (!appBaseUrl.startsWith("https://")) {
    throw new Error("APP_BASE_URL deve usar HTTPS em produção.");
  }
}
