import { assertEquals } from "@std/assert";
import { pullSchema } from "./pull.ts";

Deno.test("pullSchema - valid input", () => {
  const result = pullSchema.parse({
    uuid: "abc-123",
    directoryPath: "/workspace/project",
  });
  assertEquals(result.uuid, "abc-123");
  assertEquals(result.directoryPath, "/workspace/project");
});

Deno.test("pullSchema - missing uuid fails", () => {
  const result = pullSchema.safeParse({ directoryPath: "/workspace" });
  assertEquals(result.success, false);
});

Deno.test("pullSchema - missing directoryPath fails", () => {
  const result = pullSchema.safeParse({ uuid: "abc-123" });
  assertEquals(result.success, false);
});

Deno.test("pullSchema - empty object fails", () => {
  const result = pullSchema.safeParse({});
  assertEquals(result.success, false);
});
