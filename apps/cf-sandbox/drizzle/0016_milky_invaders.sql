ALTER TABLE "sandbox_secrets" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "sandbox_variables" ADD COLUMN "name" text;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_secret_by_name" ON "sandbox_secrets" USING btree ("sandbox_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_variables_by_name" ON "sandbox_variables" USING btree ("sandbox_id","name");