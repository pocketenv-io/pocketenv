CREATE TABLE "integrations" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"webhook_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ssh_keys" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"redacted" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailscale_tokens" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text,
	"tokens" text NOT NULL,
	"redacted" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "redacted" text;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssh_keys" ADD CONSTRAINT "ssh_keys_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_tokens" ADD CONSTRAINT "tailscale_tokens_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_integration" ON "integrations" USING btree ("sandbox_id","name");