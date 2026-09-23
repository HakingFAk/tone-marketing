import { describe, expect, it } from "vitest";
import { appRouter } from "./routers.js";
import type { TrpcContext } from "./_core/context.js";

const context = (user: TrpcContext["user"] = null): TrpcContext => ({
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
});

describe("products", () => {
  it("returns the public categories in the storefront order", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.products.categories()).resolves.toEqual(["Guitarras", "Violões", "Pedais", "Amplificadores", "Acessórios"]);
  });

  it("blocks product creation for non-admin users", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "user", name: "User", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.products.create({ name: "Teste", category: "Guitarras", description: "Produto de teste", priceCents: null, condition: "new", available: true, images: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns an array from the public listing", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.products.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts the public sold-products listing filter", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.products.list({ soldOnly: true })).resolves.toEqual(expect.any(Array));
  });

  it("returns undefined for an unknown product slug", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.products.bySlug({ slug: "produto-que-nao-existe" })).resolves.toBeUndefined();
  });

  it("blocks product removal for non-admin users", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "user", name: "User", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.products.remove({ id: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns an array from the public video listing", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.videos.list({ kind: "demo" })).resolves.toEqual(expect.any(Array));
  });

  it("blocks video upload preparation for non-admin users", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "user", name: "User", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.videos.prepareUpload({ filename: "demo.mp4", contentType: "video/mp4" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns an array from the public document listing", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.documents.list({ productId: 999999 })).resolves.toEqual(expect.any(Array));
  });

  it("blocks document upload preparation for non-admin users", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "user", name: "User", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.documents.prepareUpload({ filename: "nota.pdf", contentType: "application/pdf" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns the active ambient track list publicly", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.ambient.list()).resolves.toEqual(expect.any(Array));
  });

  it("blocks ambient audio upload preparation for non-admin users", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "user", name: "User", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.ambient.prepareUpload({ filename: "guitarra.mp3", contentType: "audio/mpeg" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
