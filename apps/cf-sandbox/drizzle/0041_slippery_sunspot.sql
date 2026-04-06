CREATE TABLE "backups" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"backup_id" text NOT NULL,
	"directory" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "backups" ADD CONSTRAINT "backups_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;