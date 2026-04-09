CREATE TABLE "modal_auth" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"user_id" text NOT NULL,
	"token_id" text NOT NULL,
	"redacted_token_id" text NOT NULL,
	"token_secret" text NOT NULL,
	"redacted_token_secret" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "modal_auth" ADD CONSTRAINT "modal_auth_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modal_auth" ADD CONSTRAINT "modal_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_modal_auth" ON "modal_auth" USING btree ("sandbox_id","user_id");