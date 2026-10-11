CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"headline" text,
	"bio" text,
	"experience" "experience_level",
	"hours_per_week" integer,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_hours_per_week_range" CHECK ("profile"."hours_per_week" between 1 and 168)
);
--> statement-breakpoint
CREATE TABLE "profile_skill" (
	"user_id" text NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "profile_skill_user_id_skill_id_pk" PRIMARY KEY("user_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_skill" ADD CONSTRAINT "profile_skill_user_id_profile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skill" ADD CONSTRAINT "profile_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_username_unique" ON "profile" USING btree (lower("username"));--> statement-breakpoint
CREATE INDEX "profile_skill_skill_id_idx" ON "profile_skill" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_name_unique" ON "skill" USING btree (lower("name"));