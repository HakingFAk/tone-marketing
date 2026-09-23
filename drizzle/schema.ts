import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const productCondition = pgEnum("product_condition", ["new", "used"]);
export const videoKind = pgEnum("video_kind", ["demo", "client"]);
export const documentType = pgEnum("document_type", ["invoice", "certificate", "inspection", "other"]);
export const ambientContext = pgEnum("ambient_context", ["guitar", "acoustic", "effects", "neutral"]);
export const analyticsEventType = pgEnum("analytics_event_type", ["page_view", "product_view", "cart_add", "cart_checkout", "whatsapp_contact", "international_inquiry", "custom_inquiry"]);
export const saleKind = pgEnum("sale_kind", ["catalog", "custom"]);
const updated = () => timestamp("updatedAt", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull();

export const users = pgTable("users", { id: serial("id").primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(), name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), role: userRole("role").notNull().default("user"), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(), updatedAt: updated(), lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull() });
export const products = pgTable("products", { id: serial("id").primaryKey(), name: varchar("name", { length: 180 }).notNull(), slug: varchar("slug", { length: 220 }).notNull().unique(), category: varchar("category", { length: 80 }).notNull(), description: text("description").notNull(), specifications: text("specifications"), priceCents: integer("priceCents"), condition: productCondition("condition").notNull().default("new"), available: integer("available").notNull().default(1), sold: integer("sold").notNull().default(0), promotionActive: integer("promotionActive").notNull().default(0), promotionEndsAt: timestamp("promotionEndsAt", { withTimezone: true }), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(), updatedAt: updated() });
export const productImages = pgTable("productImages", { id: serial("id").primaryKey(), productId: integer("productId").notNull(), storageKey: varchar("storageKey", { length: 500 }).notNull(), url: varchar("url", { length: 700 }).notNull(), sortOrder: integer("sortOrder").notNull().default(0), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull() });
export const productVideos = pgTable("productVideos", { id: serial("id").primaryKey(), productId: integer("productId"), kind: videoKind("kind").notNull(), title: varchar("title", { length: 180 }).notNull(), description: text("description"), country: varchar("country", { length: 120 }), storageKey: varchar("storageKey", { length: 500 }).notNull(), url: varchar("url", { length: 700 }).notNull(), consentConfirmed: integer("consentConfirmed").notNull().default(0), published: integer("published").notNull().default(0), sortOrder: integer("sortOrder").notNull().default(0), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(), updatedAt: updated() });
export const productDocuments = pgTable("productDocuments", { id: serial("id").primaryKey(), productId: integer("productId").notNull(), title: varchar("title", { length: 180 }).notNull(), documentType: documentType("documentType").notNull().default("other"), fileName: varchar("fileName", { length: 260 }).notNull(), mimeType: varchar("mimeType", { length: 120 }).notNull(), storageKey: varchar("storageKey", { length: 500 }).notNull(), url: varchar("url", { length: 700 }).notNull(), published: integer("published").notNull().default(1), sortOrder: integer("sortOrder").notNull().default(0), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(), updatedAt: updated() });
export const ambientTracks = pgTable("ambientTracks", { id: serial("id").primaryKey(), context: ambientContext("context").notNull(), title: varchar("title", { length: 180 }).notNull(), description: text("description"), storageKey: varchar("storageKey", { length: 500 }).notNull(), url: varchar("url", { length: 700 }).notNull(), active: integer("active").notNull().default(1), isTest: integer("isTest").notNull().default(0), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(), updatedAt: updated() });
export const analyticsEvents = pgTable("analyticsEvents", { id: serial("id").primaryKey(), eventType: analyticsEventType("eventType").notNull(), visitorId: varchar("visitorId", { length: 96 }).notNull(), sessionId: varchar("sessionId", { length: 96 }).notNull(), page: varchar("page", { length: 260 }), productId: integer("productId"), source: varchar("source", { length: 120 }), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull() });
export const sales = pgTable("sales", { id: serial("id").primaryKey(), productId: integer("productId"), saleType: saleKind("saleType").notNull().default("catalog"), amountCents: integer("amountCents"), currency: varchar("currency", { length: 3 }).notNull().default("BRL"), customerCountry: varchar("customerCountry", { length: 120 }), note: text("note"), soldAt: timestamp("soldAt", { withTimezone: true }).defaultNow().notNull(), createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull() });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;
export type ProductVideo = typeof productVideos.$inferSelect;
export type InsertProductVideo = typeof productVideos.$inferInsert;
export type ProductDocument = typeof productDocuments.$inferSelect;
export type InsertProductDocument = typeof productDocuments.$inferInsert;
export type AmbientTrack = typeof ambientTracks.$inferSelect;
export type InsertAmbientTrack = typeof ambientTracks.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;
