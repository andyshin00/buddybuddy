CREATE TYPE "public"."link_key" AS ENUM('github', 'linkedin', 'portfolio');--> statement-breakpoint
CREATE TYPE "public"."post_duration" AS ENUM('weekend', '2-weeks', '1-month', '3-months', '3-plus-months');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('need-builders', 'ideate', 'fill-role');--> statement-breakpoint
CREATE TYPE "public"."skill_kind" AS ENUM('required', 'nice');--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "post_type" NOT NULL,
	"status" "post_status" DEFAULT 'open' NOT NULL,
	"hours_per_week" integer NOT NULL,
	"duration" "post_duration" NOT NULL,
	"timezone" text,
	"required_links" "link_key"[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_hours_per_week_range" CHECK ("post"."hours_per_week" between 1 and 168)
);
--> statement-breakpoint
CREATE TABLE "post_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"name" text NOT NULL,
	"filled" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_skill" (
	"post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"kind" "skill_kind" NOT NULL,
	CONSTRAINT "post_skill_post_id_skill_id_pk" PRIMARY KEY("post_id","skill_id")
);
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_owner_id_profile_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profile"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_role" ADD CONSTRAINT "post_role_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_skill" ADD CONSTRAINT "post_skill_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_skill" ADD CONSTRAINT "post_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_owner_id_idx" ON "post" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "post_status_created_at_idx" ON "post" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "post_role_post_id_idx" ON "post_role" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_skill_skill_id_idx" ON "post_skill" USING btree ("skill_id");