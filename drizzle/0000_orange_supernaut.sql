CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"highlights" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"image" text NOT NULL,
	"type" text NOT NULL,
	"period" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"website" text,
	"source" text,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"email" text NOT NULL,
	"github_username" text NOT NULL,
	"github" text NOT NULL,
	"linkedin" text NOT NULL,
	"instagram" text NOT NULL,
	"resume" text NOT NULL,
	"logo" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
