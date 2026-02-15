CREATE TABLE "authorized_keys" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text,
	"public_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "readme" text;--> statement-breakpoint
ALTER TABLE "authorized_keys" ADD CONSTRAINT "authorized_keys_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;