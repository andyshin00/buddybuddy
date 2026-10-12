CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"applicant_id" text NOT NULL,
	"role_id" uuid,
	"role_name" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_applicant_id_profile_user_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."profile"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_role_id_post_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."post_role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_post_applicant_unique" ON "application" USING btree ("post_id","applicant_id");--> statement-breakpoint
CREATE INDEX "application_applicant_id_idx" ON "application" USING btree ("applicant_id");