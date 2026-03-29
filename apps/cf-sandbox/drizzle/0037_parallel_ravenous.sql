ALTER TABLE "daytona_auth" ADD COLUMN "redacted_api_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "deno_auth" ADD COLUMN "redacted_deno_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sprite_auth" ADD COLUMN "redacted_sprite_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vercel_auth" ADD COLUMN "redacted_vercel_token" text NOT NULL;