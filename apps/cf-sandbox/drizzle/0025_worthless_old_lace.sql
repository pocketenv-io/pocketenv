CREATE TABLE "tailscale_auth_keys" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"auth_key" text NOT NULL,
	"redacted" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "tailscale_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "tailscale_auth_keys" ADD CONSTRAINT "tailscale_auth_keys_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;