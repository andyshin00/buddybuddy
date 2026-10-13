CREATE TYPE "public"."notification_kind" AS ENUM('new_application', 'status_change', 'withdrawn');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"text" text NOT NULL,
	"link" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_profile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_user_id_created_at_idx" ON "notification" USING btree ("user_id","created_at");