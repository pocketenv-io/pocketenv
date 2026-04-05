import { assertEquals, assertThrows } from "@std/assert";
import { SandboxConfigSchema, StartSandboxInputSchema } from "./sandbox.ts";

Deno.test("SandboxConfigSchema - defaults", () => {
  const result = SandboxConfigSchema.parse({
    provider: "deno",
    denoDeployToken: "tok",
    redactedDenoDeployToken: "redacted",
  });
  assertEquals(result.provider, "deno");
  assertEquals(result.base, "openclaw");
  assertEquals(result.keepAlive, false);
  assertEquals(result.vcpus, 2);
  assertEquals(result.memory, 4);
  assertEquals(result.disk, 3);
  assertEquals(result.secrets, []);
  assertEquals(result.variables, []);
});

Deno.test("SandboxConfigSchema - deno provider requires tokens", () => {
  const result = SandboxConfigSchema.safeParse({ provider: "deno" });
  assertEquals(result.success, false);
  const issues = (result as any).error.issues.map((i: any) => i.path[0]);
  assertEquals(issues.includes("denoDeployToken"), true);
  assertEquals(issues.includes("redactedDenoDeployToken"), true);
});

Deno.test("SandboxConfigSchema - sprites provider requires spriteToken", () => {
  const result = SandboxConfigSchema.safeParse({ provider: "sprites" });
  assertEquals(result.success, false);
  const issues = (result as any).error.issues.map((i: any) => i.path[0]);
  assertEquals(issues.includes("spriteToken"), true);
  assertEquals(issues.includes("redactedSpriteToken"), true);
});

Deno.test("SandboxConfigSchema - daytona provider requires apiKey and orgId", () => {
  const result = SandboxConfigSchema.safeParse({ provider: "daytona" });
  assertEquals(result.success, false);
  const issues = (result as any).error.issues.map((i: any) => i.path[0]);
  assertEquals(issues.includes("daytonaApiKey"), true);
  assertEquals(issues.includes("redactedDaytonaApiKey"), true);
  assertEquals(issues.includes("daytonaOrganizationId"), true);
});

Deno.test("SandboxConfigSchema - vercel provider requires token and projectId", () => {
  const result = SandboxConfigSchema.safeParse({ provider: "vercel" });
  assertEquals(result.success, false);
  const issues = (result as any).error.issues.map((i: any) => i.path[0]);
  assertEquals(issues.includes("vercelApiKey"), true);
  assertEquals(issues.includes("vercelProjectId"), true);
});

Deno.test("SandboxConfigSchema - valid daytona config", () => {
  const result = SandboxConfigSchema.parse({
    provider: "daytona",
    daytonaApiKey: "key",
    redactedDaytonaApiKey: "redacted",
    daytonaOrganizationId: "org-123",
  });
  assertEquals(result.provider, "daytona");
  assertEquals(result.daytonaApiKey, "key");
  assertEquals(result.daytonaOrganizationId, "org-123");
});

Deno.test("SandboxConfigSchema - valid sprites config", () => {
  const result = SandboxConfigSchema.parse({
    provider: "sprites",
    spriteToken: "tok",
    redactedSpriteToken: "redacted",
  });
  assertEquals(result.provider, "sprites");
  assertEquals(result.spriteToken, "tok");
});

Deno.test("SandboxConfigSchema - valid vercel config", () => {
  const result = SandboxConfigSchema.parse({
    provider: "vercel",
    vercelApiToken: "vt_abc",
    redactedVercelApiToken: "redacted",
    vercelProjectId: "prj_123",
  });
  assertEquals(result.provider, "vercel");
  assertEquals(result.vercelApiToken, "vt_abc");
  assertEquals(result.vercelProjectId, "prj_123");
});

Deno.test("SandboxConfigSchema - sleepAfter valid formats", () => {
  for (const valid of ["1h", "30m", "15s", "100s"]) {
    const result = SandboxConfigSchema.safeParse({
      provider: "deno",
      denoDeployToken: "tok",
      redactedDenoDeployToken: "r",
      sleepAfter: valid,
    });
    assertEquals(result.success, true, `Expected ${valid} to be valid`);
  }
});

Deno.test("SandboxConfigSchema - sleepAfter invalid format", () => {
  const result = SandboxConfigSchema.safeParse({
    provider: "deno",
    denoDeployToken: "tok",
    redactedDenoDeployToken: "r",
    sleepAfter: "2hours",
  });
  assertEquals(result.success, false);
});

Deno.test("SandboxConfigSchema - rejects duplicate secret names", () => {
  assertThrows(
    () =>
      SandboxConfigSchema.safeParse({
        provider: "deno",
        denoDeployToken: "tok",
        redactedDenoDeployToken: "r",
        secrets: [
          { name: "API_KEY", value: "a" },
          { name: "API_KEY", value: "b" },
        ],
      }),
    Error,
    "Duplicate names found",
  );
});

Deno.test("SandboxConfigSchema - rejects duplicate variable names", () => {
  assertThrows(
    () =>
      SandboxConfigSchema.safeParse({
        provider: "deno",
        denoDeployToken: "tok",
        redactedDenoDeployToken: "r",
        variables: [
          { name: "PORT", value: "3000" },
          { name: "PORT", value: "4000" },
        ],
      }),
    Error,
    "Duplicate names found",
  );
});

Deno.test("SandboxConfigSchema - accepts unique secrets and variables", () => {
  const result = SandboxConfigSchema.parse({
    provider: "deno",
    denoDeployToken: "tok",
    redactedDenoDeployToken: "r",
    secrets: [
      { name: "DB_URL", value: "postgres://..." },
      { name: "API_KEY", value: "secret" },
    ],
    variables: [
      { name: "PORT", value: "3000" },
      { name: "HOST", value: "localhost" },
    ],
  });
  assertEquals(result.secrets.length, 2);
  assertEquals(result.variables.length, 2);
});

Deno.test("SandboxConfigSchema - rejects unsupported provider", () => {
  const result = SandboxConfigSchema.safeParse({ provider: "aws" });
  assertEquals(result.success, false);
});

Deno.test("StartSandboxInputSchema - optional repo", () => {
  assertEquals(StartSandboxInputSchema.parse({}).repo, undefined);
  assertEquals(
    StartSandboxInputSchema.parse({ repo: "https://github.com/x/y" }).repo,
    "https://github.com/x/y",
  );
});
