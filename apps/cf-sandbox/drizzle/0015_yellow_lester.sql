CREATE UNIQUE INDEX "unique_sandbox_file" ON "sandbox_files" USING btree ("sandbox_id","file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_file_path" ON "sandbox_files" USING btree ("sandbox_id","path");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_volume" ON "sandbox_volumes" USING btree ("sandbox_id","volume_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sandbox_volume_path" ON "sandbox_volumes" USING btree ("sandbox_id","path");