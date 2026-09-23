import { and, asc, desc, eq, gt, gte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { analyticsEvents, ambientTracks, InsertAnalyticsEvent, InsertAmbientTrack, InsertProduct, InsertProductDocument, InsertProductImage, InsertProductVideo, InsertSale, productDocuments, productImages, productVideos, products, sales, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { isPromotionLive } from "./promotionPolicy";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: typeof users.$inferInsert): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: typeof users.$inferInsert = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listProducts(input?: { category?: string; search?: string; includeUnavailable?: boolean; promotionOnly?: boolean; soldOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (input?.soldOnly) filters.push(eq(products.sold, 1));
  else if (!input?.includeUnavailable) filters.push(eq(products.available, 1), eq(products.sold, 0));
  if (input?.category && input.category !== "all") filters.push(eq(products.category, input.category));
  if (input?.search) filters.push(or(like(products.name, `%${input.search}%`), like(products.description, `%${input.search}%`)));
  if (input?.promotionOnly) filters.push(eq(products.promotionActive, 1), gt(products.promotionEndsAt, new Date()));
  const rows = await db.select().from(products).where(filters.length ? and(...filters) : undefined).orderBy(desc(products.createdAt));
  return Promise.all(rows.map(async product => ({
    ...product,
    promotionActive: isPromotionLive(product.promotionActive, product.promotionEndsAt) ? 1 : 0,
    images: await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder), asc(productImages.id)),
    documents: await db.select().from(productDocuments).where(and(eq(productDocuments.productId, product.id), eq(productDocuments.published, 1))).orderBy(asc(productDocuments.sortOrder), asc(productDocuments.id)),
  })));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (!product) return undefined;
  const images = await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
  const videos = await db.select().from(productVideos).where(and(eq(productVideos.productId, product.id), eq(productVideos.published, 1))).orderBy(asc(productVideos.sortOrder), desc(productVideos.createdAt));
  const documents = await db.select().from(productDocuments).where(and(eq(productDocuments.productId, product.id), eq(productDocuments.published, 1))).orderBy(asc(productDocuments.sortOrder), asc(productDocuments.id));
  return { ...product, images, videos, documents };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const product = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0];
  if (!product) return undefined;
  const images = await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
  const documents = await db.select().from(productDocuments).where(eq(productDocuments.productId, product.id)).orderBy(asc(productDocuments.sortOrder), asc(productDocuments.id));
  return { ...product, images, documents };
}

export async function createProduct(product: InsertProduct, images: Array<Omit<InsertProductImage, "productId">>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [created] = await db.insert(products).values(product).returning({ id: products.id });
  const id = created.id;
  if (images.length) await db.insert(productImages).values(images.map(image => ({ ...image, productId: id })));
  return getProductById(id);
}

export async function updateProduct(id: number, product: Partial<InsertProduct>, images?: Array<Omit<InsertProductImage, "productId">>, removeImageIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(products).set(product).where(eq(products.id, id));
  if (removeImageIds.length) {
    for (const imageId of removeImageIds) await db.delete(productImages).where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));
  }
  if (images?.length) await db.insert(productImages).values(images.map(image => ({ ...image, productId: id })));
  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(productDocuments).where(eq(productDocuments.productId, id));
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

export async function listVideos(input?: { kind?: "demo" | "client"; productId?: number; includeUnpublished?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (!input?.includeUnpublished) filters.push(eq(productVideos.published, 1));
  if (input?.kind) filters.push(eq(productVideos.kind, input.kind));
  if (input?.productId) filters.push(eq(productVideos.productId, input.productId));
  return db.select().from(productVideos).where(filters.length ? and(...filters) : undefined).orderBy(asc(productVideos.sortOrder), desc(productVideos.createdAt));
}

export async function createVideo(video: InsertProductVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [created] = await db.insert(productVideos).values(video).returning({ id: productVideos.id });
  const id = created.id;
  return (await db.select().from(productVideos).where(eq(productVideos.id, id)).limit(1))[0];
}

export async function updateVideo(id: number, video: Partial<InsertProductVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(productVideos).set(video).where(eq(productVideos.id, id));
  return (await db.select().from(productVideos).where(eq(productVideos.id, id)).limit(1))[0];
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(productVideos).where(eq(productVideos.id, id));
  return { success: true };
}

export async function listProductDocuments(input: { productId: number; includeUnpublished?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const filters = [eq(productDocuments.productId, input.productId)];
  if (!input.includeUnpublished) filters.push(eq(productDocuments.published, 1));
  return db.select().from(productDocuments).where(and(...filters)).orderBy(asc(productDocuments.sortOrder), asc(productDocuments.id));
}

export async function createProductDocument(document: InsertProductDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [created] = await db.insert(productDocuments).values(document).returning({ id: productDocuments.id });
  const id = created.id;
  return (await db.select().from(productDocuments).where(eq(productDocuments.id, id)).limit(1))[0];
}

export async function updateProductDocument(id: number, document: Partial<InsertProductDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(productDocuments).set(document).where(eq(productDocuments.id, id));
  return (await db.select().from(productDocuments).where(eq(productDocuments.id, id)).limit(1))[0];
}

export async function deleteProductDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(productDocuments).where(eq(productDocuments.id, id));
  return { success: true };
}

export async function listAmbientTracks(input?: { activeOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ambientTracks).where(input?.activeOnly ? eq(ambientTracks.active, 1) : undefined).orderBy(asc(ambientTracks.context), desc(ambientTracks.updatedAt));
}

export async function createAmbientTrack(track: InsertAmbientTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (track.active) await db.update(ambientTracks).set({ active: 0 }).where(eq(ambientTracks.context, track.context));
  const [created] = await db.insert(ambientTracks).values(track).returning({ id: ambientTracks.id });
  const id = created.id;
  return (await db.select().from(ambientTracks).where(eq(ambientTracks.id, id)).limit(1))[0];
}

export async function updateAmbientTrack(id: number, track: Partial<InsertAmbientTrack>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const current = (await db.select().from(ambientTracks).where(eq(ambientTracks.id, id)).limit(1))[0];
  if (!current) return undefined;
  const context = track.context || current.context;
  if (track.active) await db.update(ambientTracks).set({ active: 0 }).where(eq(ambientTracks.context, context));
  await db.update(ambientTracks).set(track).where(eq(ambientTracks.id, id));
  return (await db.select().from(ambientTracks).where(eq(ambientTracks.id, id)).limit(1))[0];
}

export async function deleteAmbientTrack(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(ambientTracks).where(eq(ambientTracks.id, id));
  return { success: true };
}

export async function seedAmbientTrackTests() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const tracks: Array<InsertAmbientTrack> = [
    { context: "guitar", title: "Teste — Guitarras leves", description: "Faixa de teste para guitarras elétricas. Pode ser substituída ou removida.", storageKey: "tone-electric-guitar-context_63a3e573.mp3", url: "/media/tone-electric-guitar-context_63a3e573.mp3", active: 1, isTest: 1 },
    { context: "acoustic", title: "Teste — Violão leve", description: "Faixa de teste para violões. Pode ser substituída ou removida.", storageKey: "tone-acoustic-guitar-context_dfc7a9d1.mp3", url: "/media/tone-acoustic-guitar-context_dfc7a9d1.mp3", active: 1, isTest: 1 },
    { context: "effects", title: "Teste — Efeitos e amplificadores", description: "Faixa de teste para pedais e amplificadores. Pode ser substituída ou removida.", storageKey: "tone-effects-amp-context_a4eed5be.mp3", url: "/media/tone-effects-amp-context_a4eed5be.mp3", active: 1, isTest: 1 },
  ];
  const existing = await db.select().from(ambientTracks);
  for (const track of tracks) {
    if (existing.some(item => item.context === track.context && item.isTest === 1)) continue;
    const hasActive = existing.some(item => item.context === track.context && item.active === 1);
    await db.insert(ambientTracks).values({ ...track, active: hasActive ? 0 : 1 });
  }
  return listAmbientTracks();
}

export async function seedMediaTests() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const samples = [
    { name: "TESTE — Guitarra rubi", slug: "teste-guitarra-rubi", category: "Guitarras", description: "Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.", image: "/media/tone-test-electric-guitar_b06a1d37.jpg", key: "tone-test-electric-guitar_b06a1d37.jpg" },
    { name: "TESTE — Violão âmbar", slug: "teste-violao-ambar", category: "Violões", description: "Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.", image: "/media/tone-test-acoustic-guitar_f341f228.jpg", key: "tone-test-acoustic-guitar_f341f228.jpg" },
    { name: "TESTE — Pedalboard violeta", slug: "teste-pedalboard-violeta", category: "Pedais", description: "Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.", image: "/media/tone-test-pedal-rig_53bb84fb.jpg", key: "tone-test-pedal-rig_53bb84fb.jpg" },
  ];
  for (const sample of samples) {
    let product = (await db.select().from(products).where(eq(products.slug, sample.slug)).limit(1))[0];
    if (!product) {
      const [created] = await db.insert(products).values({ name: sample.name, slug: sample.slug, category: sample.category, description: sample.description, specifications: "Item de demonstração. Gerencie fotos, disponibilidade e dados livremente.", priceCents: null, condition: "new", available: 0 }).returning({ id: products.id });
      product = (await db.select().from(products).where(eq(products.id, created.id)).limit(1))[0];
    }
    const images = await db.select().from(productImages).where(eq(productImages.productId, product.id));
    if (!images.length) await db.insert(productImages).values({ productId: product.id, storageKey: sample.key, url: sample.image, sortOrder: 0 });
  }
  const hasTestVideo = (await db.select().from(productVideos).where(eq(productVideos.title, "TESTE — Demonstração de guitarra"))).length > 0;
  if (!hasTestVideo) await db.insert(productVideos).values({ productId: null, kind: "demo", title: "TESTE — Demonstração de guitarra", description: "Vídeo de teste para experimentar publicação, edição e remoção no painel.", country: null, storageKey: "tone-guitar-demo_a74eef2a.mp4", url: "/media/tone-guitar-demo_a74eef2a.mp4", consentConfirmed: 1, published: 0, sortOrder: 99 });
  return { products: samples.length, videoCreated: !hasTestVideo };
}

export async function recordAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return undefined;
  const [created] = await db.insert(analyticsEvents).values(event).returning({ id: analyticsEvents.id });
  return created.id;
}

export async function createSale(sale: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [created] = await db.insert(sales).values(sale).returning({ id: sales.id });
  const id = created.id;
  return (await db.select().from(sales).where(eq(sales.id, id)).limit(1))[0];
}

export async function getExecutiveSummary(days = 30) {
  const db = await getDb();
  const safeDays = Math.min(Math.max(days, 7), 90);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - safeDays + 1);
  if (!db) return { rangeDays: safeDays, start, kpis: emptyExecutiveKpis(), daily: [], topProducts: [], recentSales: [] };

  const [events, confirmedSales, catalog] = await Promise.all([
    db.select().from(analyticsEvents).where(gte(analyticsEvents.createdAt, start)),
    db.select().from(sales).where(gte(sales.soldAt, start)).orderBy(desc(sales.soldAt)),
    db.select({ id: products.id, name: products.name, category: products.category }).from(products),
  ]);
  const pageViews = events.filter(event => event.eventType === "page_view");
  const productViews = events.filter(event => event.eventType === "product_view");
  const cartAdds = events.filter(event => event.eventType === "cart_add");
  const cartCheckouts = events.filter(event => event.eventType === "cart_checkout");
  const contacts = events.filter(event => ["whatsapp_contact", "international_inquiry", "custom_inquiry"].includes(event.eventType));
  const visitorIds = new Set(pageViews.map(event => event.visitorId));
  const revenueCents = confirmedSales.reduce((total, sale) => total + (sale.amountCents || 0), 0);
  const kpis = {
    uniqueVisitors: visitorIds.size,
    pageViews: pageViews.length,
    productViews: productViews.length,
    cartAdds: cartAdds.length,
    cartCheckouts: cartCheckouts.length,
    whatsappContacts: contacts.length,
    confirmedSales: confirmedSales.length,
    revenueCents,
    contactRate: pageViews.length ? Number(((contacts.length / pageViews.length) * 100).toFixed(1)) : 0,
    saleConversion: contacts.length ? Number(((confirmedSales.length / contacts.length) * 100).toFixed(1)) : 0,
  };

  const productMap = new Map(catalog.map(product => [product.id, product]));
  const productStats = new Map<number, { views: number; cartAdds: number; contacts: number; sales: number; revenueCents: number }>();
  const addToProduct = (productId: number | null, key: "views" | "cartAdds" | "contacts") => {
    if (!productId) return;
    const current = productStats.get(productId) || { views: 0, cartAdds: 0, contacts: 0, sales: 0, revenueCents: 0 };
    current[key] += 1;
    productStats.set(productId, current);
  };
  productViews.forEach(event => addToProduct(event.productId, "views"));
  cartAdds.forEach(event => addToProduct(event.productId, "cartAdds"));
  contacts.forEach(event => addToProduct(event.productId, "contacts"));
  confirmedSales.forEach(sale => {
    if (!sale.productId) return;
    const current = productStats.get(sale.productId) || { views: 0, cartAdds: 0, contacts: 0, sales: 0, revenueCents: 0 };
    current.sales += 1;
    current.revenueCents += sale.amountCents || 0;
    productStats.set(sale.productId, current);
  });
  const topProducts = Array.from(productStats.entries()).map(([productId, stats]) => ({ productId, name: productMap.get(productId)?.name || "Produto removido", category: productMap.get(productId)?.category || "", ...stats })).sort((a, b) => (b.contacts + b.cartAdds + b.views + b.sales * 4) - (a.contacts + a.cartAdds + a.views + a.sales * 4)).slice(0, 8);

  const dailyMap = new Map<string, { date: string; visitors: Set<string>; views: number; carts: number; contacts: number; sales: number }>();
  for (let offset = 0; offset < safeDays; offset += 1) {
    const day = new Date(start);
    day.setDate(day.getDate() + offset);
    const date = day.toISOString().slice(0, 10);
    dailyMap.set(date, { date, visitors: new Set(), views: 0, carts: 0, contacts: 0, sales: 0 });
  }
  events.forEach(event => {
    const date = event.createdAt.toISOString().slice(0, 10);
    const day = dailyMap.get(date);
    if (!day) return;
    if (event.eventType === "page_view") { day.visitors.add(event.visitorId); day.views += 1; }
    if (event.eventType === "cart_add") day.carts += 1;
    if (["whatsapp_contact", "international_inquiry", "custom_inquiry"].includes(event.eventType)) day.contacts += 1;
  });
  confirmedSales.forEach(sale => {
    const day = dailyMap.get(sale.soldAt.toISOString().slice(0, 10));
    if (day) day.sales += 1;
  });
  const daily = Array.from(dailyMap.values()).map(day => ({ date: day.date, visitors: day.visitors.size, views: day.views, carts: day.carts, contacts: day.contacts, sales: day.sales }));
  return { rangeDays: safeDays, start, kpis, daily, topProducts, recentSales: confirmedSales.slice(0, 8) };
}

function emptyExecutiveKpis() {
  return { uniqueVisitors: 0, pageViews: 0, productViews: 0, cartAdds: 0, cartCheckouts: 0, whatsappContacts: 0, confirmedSales: 0, revenueCents: 0, contactRate: 0, saleConversion: 0 };
}
