CREATE OR REPLACE FUNCTION service_id()
RETURNS text AS $$
SELECT 'svc_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

CREATE TABLE "services" (
	"id" text PRIMARY KEY DEFAULT service_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"name" text NOT NULL,
	"command" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sandbox_ports" ADD COLUMN "service_id" text;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_service" ON "services" USING btree ("name","sandbox_id");--> statement-breakpoint
ALTER TABLE "sandbox_ports" ADD CONSTRAINT "sandbox_ports_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
