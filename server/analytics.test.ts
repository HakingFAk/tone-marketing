import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context.js";
import { appRouter } from "./routers.js";

function userContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "analytics-test-user",
      name: "Analytics test",
      email: "analytics@example.test",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("analytics executive access", () => {
  it("blocks executive summary access for non-admin accounts", async () => {
    const caller = appRouter.createCaller(userContext("user"));

    await expect(caller.analytics.summary({ days: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
