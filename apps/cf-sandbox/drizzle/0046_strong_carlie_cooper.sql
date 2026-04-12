CREATE TABLE "hopx_auth" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"user_id" text NOT NULL,
	"api_key" text NOT NULL,
	"redacted_api_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runloop_auth" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"user_id" text NOT NULL,
	"api_key" text NOT NULL,
	"redacted_api_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hopx_auth" ADD CONSTRAINT "hopx_auth_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hopx_auth" ADD CONSTRAINT "hopx_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runloop_auth" ADD CONSTRAINT "runloop_auth_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runloop_auth" ADD CONSTRAINT "runloop_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_hopx_auth" ON "hopx_auth" USING btree ("sandbox_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_runloop_auth" ON "runloop_auth" USING btree ("sandbox_id","user_id");