CREATE TABLE "e2b_auth" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"redacted_access_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "e2b_auth" ADD CONSTRAINT "e2b_auth_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e2b_auth" ADD CONSTRAINT "e2b_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_e2b_auth" ON "e2b_auth" USING btree ("sandbox_id","user_id");