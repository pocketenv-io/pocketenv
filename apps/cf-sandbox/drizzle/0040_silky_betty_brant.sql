CREATE TABLE "sandbox_cp" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"copy_uuid" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_cp_copy_uuid_unique" UNIQUE("copy_uuid")
);
