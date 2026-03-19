CREATE TABLE "sandbox_ports" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"exposed_port" integer NOT NULL,
	"preview_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sandbox_ports" ADD CONSTRAINT "sandbox_ports_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_port" ON "sandbox_ports" USING btree ("sandbox_id","exposed_port");