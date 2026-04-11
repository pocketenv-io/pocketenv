ALTER TABLE "e2b_auth" RENAME COLUMN "access_token" TO "api_key";--> statement-breakpoint
ALTER TABLE "e2b_auth" RENAME COLUMN "redacted_access_token" TO "redacted_api_key";