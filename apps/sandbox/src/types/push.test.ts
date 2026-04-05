import { assertEquals } from "@std/assert";
import { pushSchema } from "./push.ts";

Deno.test("pushSchema - valid input", () => {
  const result = pushSchema.parse({ directoryPath: "/workspace/project" });
  assertEquals(result.directoryPath, "/workspace/project");
});

Deno.test("pushSchema - missing directoryPath fails", () => {
  const result = pushSchema.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("pushSchema - empty string directoryPath is allowed", () => {
  const result = pushSchema.safeParse({ directoryPath: "" });
  assertEquals(result.success, true);
});
