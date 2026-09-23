CREATE TYPE "public"."ambient_context" AS ENUM('guitar', 'acoustic', 'effects', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'product_view', 'cart_add', 'cart_checkout', 'whatsapp_contact', 'international_inquiry', 'custom_inquiry');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('invoice', 'certificate', 'inspection', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'used');--> statement-breakpoint
CREATE TYPE "public"."sale_kind" AS ENUM('catalog', 'custom');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."video_kind" AS ENUM('demo', 'client');--> statement-breakpoint
CREATE TABLE "ambientTracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"context" "ambient_context" NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"storageKey" varchar(500) NOT NULL,
	"url" varchar(700) NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"isTest" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analyticsEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventType" "analytics_event_type" NOT NULL,
	"visitorId" varchar(96) NOT NULL,
	"sessionId" varchar(96) NOT NULL,
	"page" varchar(260),
	"productId" integer,
	"source" varchar(120),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"documentType" "document_type" DEFAULT 'other' NOT NULL,
	"fileName" varchar(260) NOT NULL,
	"mimeType" varchar(120) NOT NULL,
	"storageKey" varchar(500) NOT NULL,
	"url" varchar(700) NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productImages" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"storageKey" varchar(500) NOT NULL,
	"url" varchar(700) NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productVideos" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"kind" "video_kind" NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"country" varchar(120),
	"storageKey" varchar(500) NOT NULL,
	"url" varchar(700) NOT NULL,
	"consentConfirmed" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 0 NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"category" varchar(80) NOT NULL,
	"description" text NOT NULL,
	"specifications" text,
	"priceCents" integer,
	"condition" "product_condition" DEFAULT 'new' NOT NULL,
	"available" integer DEFAULT 1 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"promotionActive" integer DEFAULT 0 NOT NULL,
	"promotionEndsAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"saleType" "sale_kind" DEFAULT 'catalog' NOT NULL,
	"amountCents" integer,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"customerCountry" varchar(120),
	"note" text,
	"soldAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
