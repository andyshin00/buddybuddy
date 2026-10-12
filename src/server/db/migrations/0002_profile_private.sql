CREATE TABLE "profile_private" (
	"user_id" text PRIMARY KEY NOT NULL,
	"real_name" text,
	"github_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"github_public" boolean DEFAULT false NOT NULL,
	"linkedin_public" boolean DEFAULT false NOT NULL,
	"portfolio_public" boolean DEFAULT false NOT NULL,
	"email" text,
	"discord" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_private" ADD CONSTRAINT "profile_private_user_id_profile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("user_id") ON DELETE cascade ON UPDATE no action;