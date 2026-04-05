import { assertEquals } from "@std/assert";
import { buildCredentials, AuthParams } from "./sandbox-helpers.ts";

Deno.test("buildCredentials - all undefined auth params", () => {
  const auth: AuthParams = {};
  const creds = buildCredentials(auth);
  assertEquals(creds.daytonaApiKey, undefined);
  assertEquals(creds.organizationId, undefined);
  assertEquals(creds.spriteToken, undefined);
  assertEquals(creds.denoDeployToken, undefined);
  assertEquals(creds.vercelApiToken, undefined);
  assertEquals(creds.vercelProjectId, undefined);
  assertEquals(creds.vercelTeamId, undefined);
});

Deno.test("buildCredentials - null auth params fields", () => {
  const auth: AuthParams = {
    spriteAuthParams: null,
    daytonaAuthParams: null,
    denoAuthParams: null,
    vercelAuthParams: null,
  };
  const creds = buildCredentials(auth);
  assertEquals(creds.daytonaApiKey, undefined);
  assertEquals(creds.spriteToken, undefined);
  assertEquals(creds.denoDeployToken, undefined);
  assertEquals(creds.vercelApiToken, undefined);
});

Deno.test("buildCredentials - passes through non-encrypted fields directly", () => {
  const auth: AuthParams = {
    daytonaAuthParams: { organizationId: "org-abc" },
    vercelAuthParams: { projectId: "prj_xyz", teamId: "team_1" },
  };
  const creds = buildCredentials(auth);
  assertEquals(creds.organizationId, "org-abc");
  assertEquals(creds.vercelProjectId, "prj_xyz");
  assertEquals(creds.vercelTeamId, "team_1");
});
