ALTER TABLE "sandbox_files" DROP CONSTRAINT "sandbox_files_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "sandbox_ports" DROP CONSTRAINT "sandbox_ports_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "sandbox_secrets" DROP CONSTRAINT "sandbox_secrets_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "sandbox_variables" DROP CONSTRAINT "sandbox_variables_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "sandbox_volumes" DROP CONSTRAINT "sandbox_volumes_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "ssh_keys" DROP CONSTRAINT "ssh_keys_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "tailscale_auth_keys" DROP CONSTRAINT "tailscale_auth_keys_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_sandbox_id_sandboxes_id_fk";
--> statement-breakpoint
ALTER TABLE "sandbox_files" ADD CONSTRAINT "sandbox_files_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_ports" ADD CONSTRAINT "sandbox_ports_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_secrets" ADD CONSTRAINT "sandbox_secrets_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_variables" ADD CONSTRAINT "sandbox_variables_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_volumes" ADD CONSTRAINT "sandbox_volumes_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssh_keys" ADD CONSTRAINT "ssh_keys_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_auth_keys" ADD CONSTRAINT "tailscale_auth_keys_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;