CREATE TYPE "public"."question_type" AS ENUM('short', 'long', 'dropdown', 'multi', 'yesno');--> statement-breakpoint
CREATE TABLE "post_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "question_type" NOT NULL,
	"label" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_question" ADD CONSTRAINT "post_question_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_question_post_id_idx" ON "post_question" USING btree ("post_id");