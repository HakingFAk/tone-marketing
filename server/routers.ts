import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { createAmbientTrack, createProduct, createProductDocument, createSale, createVideo, deleteAmbientTrack, deleteProduct, deleteProductDocument, deleteVideo, getExecutiveSummary, getProductBySlug, listAmbientTracks, listProductDocuments, listProducts, listVideos, recordAnalyticsEvent, seedAmbientTrackTests, seedMediaTests, updateAmbientTrack, updateProduct, updateProductDocument, updateVideo } from "./db.js";

import { storageCreateUploadUrl, storagePut } from "./storage.js";
import { getBrlToUsdQuote } from "./exchangeRates.js";
import { extensionForContentType, parseProductImage } from "./uploadPolicy.js";
import { shouldPublishVideo } from "./videoPolicy.js";

const categories = ["Guitarras", "Violões", "Pedais", "Amplificadores", "Acessórios"] as const;
const productInput = z.object({
  name: z.string().min(2).max(180),
  category: z.enum(categories),
  description: z.string().min(5),
  specifications: z.string().max(4000).nullable(),
  priceCents: z.number().int().nonnegative().nullable(),
  condition: z.enum(["new", "used"]),
  available: z.boolean(),
  sold: z.boolean().default(false),
  promotionActive: z.boolean().default(false),
  promotionEndsAt: z.string().datetime().nullable().default(null),
  images: z.array(z.object({ name: z.string(), dataUrl: z.string().startsWith("data:image/"), type: z.string() })).max(8),
});
const videoInput = z.object({
  productId: z.number().int().nullable(),
  kind: z.enum(["demo", "client"]),
  title: z.string().min(2).max(180),
  description: z.string().max(2000).nullable(),
  country: z.string().max(120).nullable(),
  storageKey: z.string().min(5).max(500),
  url: z.string().min(5).max(700),
  consentConfirmed: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(999).default(0),
});
const documentContentTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
const ambientContexts = ["guitar", "acoustic", "effects", "neutral"] as const;
const audioContentTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm"] as const;
const ambientTrackInput = z.object({
  context: z.enum(ambientContexts),
  title: z.string().min(2).max(180),
  description: z.string().max(1000).nullable(),
  storageKey: z.string().min(5).max(500),
  url: z.string().min(5).max(700),
  active: z.boolean(),
  isTest: z.boolean(),
});
const documentInput = z.object({
  productId: z.number().int(),
  title: z.string().min(2).max(180),
  documentType: z.enum(["invoice", "certificate", "inspection", "other"]),
  fileName: z.string().min(1).max(260),
  mimeType: z.enum(documentContentTypes),
  storageKey: z.string().min(5).max(500),
  url: z.string().min(5).max(700),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(999).default(0),
});
const analyticsEventInput = z.object({
  eventType: z.enum(["page_view", "product_view", "cart_add", "cart_checkout", "whatsapp_contact", "international_inquiry", "custom_inquiry"]),
  visitorId: z.string().min(8).max(96),
  sessionId: z.string().min(8).max(96),
  page: z.string().max(260).nullable().default(null),
  productId: z.number().int().positive().nullable().default(null),
  source: z.string().max(120).nullable().default(null),
});
const saleInput = z.object({
  productId: z.number().int().positive().nullable().default(null),
  saleType: z.enum(["catalog", "custom"]),
  amountCents: z.number().int().nonnegative().nullable().default(null),
  currency: z.string().trim().length(3).default("BRL"),
  customerCountry: z.string().trim().max(120).nullable().default(null),
  note: z.string().trim().max(2000).nullable().default(null),
  soldAt: z.string().datetime(),
});
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  return next();
});

async function uploadImages(productSlug: string, images: z.infer<typeof productInput>["images"]) {
  return Promise.all(images.map(async (image, index) => {
    const buffer = parseProductImage(image.dataUrl, image.type);
    const extension = extensionForContentType(image.type);
    const { key, url } = await storagePut(`products/${productSlug}/${Date.now()}-${index}.${extension}`, buffer, image.type);
    return { storageKey: key, url, sortOrder: index };
  }));
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  currency: router({
    usdQuote: publicProcedure.query(() => getBrlToUsdQuote()),
  }),
  analytics: router({
    track: publicProcedure.input(analyticsEventInput).mutation(({ input }) => recordAnalyticsEvent(input)),
    summary: adminProcedure.input(z.object({ days: z.number().int().min(7).max(90).default(30) }).optional()).query(({ input }) => getExecutiveSummary(input?.days || 30)),
    createSale: adminProcedure.input(saleInput).mutation(({ input }) => createSale({ ...input, currency: input.currency.toUpperCase(), soldAt: new Date(input.soldAt) })),
  }),
  ambient: router({
    list: publicProcedure.query(() => listAmbientTracks({ activeOnly: true })),
    listAdmin: adminProcedure.query(() => listAmbientTracks()),
    prepareUpload: adminProcedure.input(z.object({ filename: z.string().min(1).max(180), contentType: z.enum(audioContentTypes) })).mutation(async ({ input }) => {
      const extension = extensionForContentType(input.contentType);
      return storageCreateUploadUrl(`ambient/${Date.now()}.${extension}`);
    }),
    create: adminProcedure.input(ambientTrackInput).mutation(({ input }) => createAmbientTrack({ ...input, description: input.description ?? null, active: input.active ? 1 : 0, isTest: input.isTest ? 1 : 0 })),
    update: adminProcedure.input(ambientTrackInput.extend({ id: z.number().int() })).mutation(({ input }) => updateAmbientTrack(input.id, { ...input, description: input.description ?? null, active: input.active ? 1 : 0, isTest: input.isTest ? 1 : 0 })),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteAmbientTrack(input.id)),
  }),
  testMedia: router({
    seed: adminProcedure.mutation(async () => ({ ambient: await seedAmbientTrackTests(), media: await seedMediaTests() })),
  }),
  videos: router({
    list: publicProcedure.input(z.object({ kind: z.enum(["demo", "client"]).optional(), productId: z.number().int().optional() }).optional()).query(({ input }) => listVideos(input)),
    listAdmin: adminProcedure.query(() => listVideos({ includeUnpublished: true })),
    prepareUpload: adminProcedure.input(z.object({ filename: z.string().min(1).max(180), contentType: z.string().regex(/^video\/(mp4|webm|quicktime)$/) })).mutation(async ({ input }) => {
      const extension = extensionForContentType(input.contentType);
      return storageCreateUploadUrl(`videos/${Date.now()}.${extension}`);
    }),
    create: adminProcedure.input(videoInput).mutation(({ input }) => createVideo({
      ...input,
      productId: input.productId ?? null,
      description: input.description ?? null,
      country: input.country ?? null,
      consentConfirmed: input.consentConfirmed ? 1 : 0,
      published: shouldPublishVideo(input.kind, input.consentConfirmed, input.published) ? 1 : 0,
    })),
    update: adminProcedure.input(videoInput.extend({ id: z.number().int() })).mutation(({ input }) => updateVideo(input.id, {
      productId: input.productId ?? null,
      kind: input.kind,
      title: input.title,
      description: input.description ?? null,
      country: input.country ?? null,
      storageKey: input.storageKey,
      url: input.url,
      consentConfirmed: input.consentConfirmed ? 1 : 0,
      published: shouldPublishVideo(input.kind, input.consentConfirmed, input.published) ? 1 : 0,
      sortOrder: input.sortOrder,
    })),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteVideo(input.id)),
  }),
  documents: router({
    list: publicProcedure.input(z.object({ productId: z.number().int() })).query(({ input }) => listProductDocuments(input)),
    listAdmin: adminProcedure.input(z.object({ productId: z.number().int() })).query(({ input }) => listProductDocuments({ ...input, includeUnpublished: true })),
    prepareUpload: adminProcedure.input(z.object({ filename: z.string().min(1).max(260), contentType: z.enum(documentContentTypes) })).mutation(async ({ input }) => {
      const extension = extensionForContentType(input.contentType);
      return storageCreateUploadUrl(`documents/${Date.now()}.${extension}`);
    }),
    create: adminProcedure.input(documentInput).mutation(({ input }) => createProductDocument({ ...input, published: input.published ? 1 : 0 })),
    update: adminProcedure.input(documentInput.extend({ id: z.number().int() })).mutation(({ input }) => updateProductDocument(input.id, { ...input, published: input.published ? 1 : 0 })),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProductDocument(input.id)),
  }),
  products: router({
    categories: publicProcedure.query(() => categories),
    list: publicProcedure.input(z.object({ category: z.string().optional(), search: z.string().optional(), includeUnavailable: z.boolean().optional(), promotionOnly: z.boolean().optional(), soldOnly: z.boolean().optional() }).optional()).query(({ input }) => listProducts(input)),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getProductBySlug(input.slug)),
    create: adminProcedure.input(productInput).mutation(async ({ input }) => {
      const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
      const images = await uploadImages(slug, input.images);
      return createProduct({ name: input.name, slug, category: input.category, description: input.description, specifications: input.specifications, priceCents: input.priceCents, condition: input.condition, available: input.sold ? 0 : input.available ? 1 : 0, sold: input.sold ? 1 : 0, promotionActive: input.promotionActive ? 1 : 0, promotionEndsAt: input.promotionActive && input.promotionEndsAt ? new Date(input.promotionEndsAt) : null }, images);
    }),
    update: adminProcedure.input(productInput.extend({ id: z.number().int(), removeImageIds: z.array(z.number().int()).default([]) })).mutation(async ({ input }) => {
      const currentSlug = `${slugify(input.name)}-${input.id}`;
      const images = input.images.length ? await uploadImages(currentSlug, input.images) : undefined;
      return updateProduct(input.id, { name: input.name, category: input.category, description: input.description, specifications: input.specifications, priceCents: input.priceCents, condition: input.condition, available: input.sold ? 0 : input.available ? 1 : 0, sold: input.sold ? 1 : 0, promotionActive: input.promotionActive ? 1 : 0, promotionEndsAt: input.promotionActive && input.promotionEndsAt ? new Date(input.promotionEndsAt) : null }, images, input.removeImageIds);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProduct(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
