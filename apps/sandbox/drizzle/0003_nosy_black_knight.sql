ALTER TABLE "secrets" DROP CONSTRAINT "secrets_name_unique";--> statement-breakpoint
ALTER TABLE "variables" DROP CONSTRAINT "variables_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_secret" ON "sandbox_secrets" USING btree ("sandbox_id","secret_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_variables" ON "sandbox_variables" USING btree ("sandbox_id","variable_id");