import { assertRejects } from "@std/assert";
import { createSandbox, getSandboxById } from "./mod.ts";

Deno.test("createSandbox - throws on unsupported provider", async () => {
  await assertRejects(
    () => createSandbox("unknown" as any),
    Error,
    "Unsupported provider: unknown",
  );
});

Deno.test("getSandboxById - throws on unsupported provider", async () => {
  await assertRejects(
    () => getSandboxById("unknown" as any, "id-123"),
    Error,
    "Unsupported provider: unknown",
  );
});
