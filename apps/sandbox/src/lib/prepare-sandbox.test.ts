import { assertEquals } from "@std/assert";
import { BaseSandbox } from "../providers/mod.ts";
import prepareSandbox from "./prepare-sandbox.ts";

class MockSandbox extends BaseSandbox {
  calls: string[] = [];

  sh(strings: TemplateStringsArray, ...values: any[]) {
    const cmd = String.raw({ raw: strings }, ...values);
    this.calls.push(cmd);
    return Promise.resolve({ exitCode: 0, stdout: "", stderr: "" });
  }

  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  delete() { return Promise.resolve(); }
  id() { return Promise.resolve(null); }
  ssh() { return Promise.resolve(null); }
  mkdir(_dir: string) { return Promise.resolve(); }
  writeFile(_path: string, _content: string) { return Promise.resolve(); }
  setupSshKeys(_priv: string, _pub: string) { return Promise.resolve(); }
  setupTailscale(_authKey: string) { return Promise.resolve(); }
  clone(_repoUrl: string) { return Promise.resolve(null); }
  setupDefaultSshKeys() { return Promise.resolve(); }
  mount(_path: string, _prefix?: string) { return Promise.resolve(); }
  unmount(_path: string) { return Promise.resolve(); }
}

Deno.test("prepareSandbox - unknown base skips execution", async () => {
  const sandbox = new MockSandbox();
  await prepareSandbox(sandbox, "nonexistent");
  assertEquals(sandbox.calls.length, 0);
});

Deno.test("prepareSandbox - runs commands for known preset", async () => {
  // exitCode 0 → conditions "already met" → conditional steps skipped
  // Only unconditional steps (e.g. Install Dependencies) run their commands
  const sandbox = new MockSandbox();
  await prepareSandbox(sandbox, "nix");
  const ranAptGet = sandbox.calls.some((cmd) => cmd.includes("apt-get update"));
  assertEquals(ranAptGet, true);
});

Deno.test("prepareSandbox - skips step when condition is already met", async () => {
  // exitCode 0 → condition IS met → conditional run blocks are skipped
  const sandbox = new MockSandbox();
  await prepareSandbox(sandbox, "nix");
  // The nix install command is inside a conditional step and must NOT have run
  const ranNixInstall = sandbox.calls.some((cmd) =>
    cmd.includes("install.determinate.systems/nix")
  );
  assertEquals(ranNixInstall, false);
});

Deno.test("prepareSandbox - executes run commands when condition not met", async () => {
  class ConditionFailMock extends MockSandbox {
    override sh(strings: TemplateStringsArray, ...values: any[]) {
      const cmd = String.raw({ raw: strings }, ...values);
      this.calls.push(cmd);
      // Only if-condition checks (starting with "[") return non-zero exit code,
      // meaning the condition is NOT met → run block executes.
      // All subsequent run commands return 0 (success).
      const exitCode = cmd.trimStart().startsWith("[") ? 1 : 0;
      return Promise.resolve({ exitCode, stdout: "", stderr: "" });
    }
  }

  const sandbox = new ConditionFailMock();
  await prepareSandbox(sandbox, "nix");
  // With conditions never met, conditional run commands should have executed
  const ranNixInstall = sandbox.calls.some((cmd) =>
    cmd.includes("install.determinate.systems/nix")
  );
  assertEquals(ranNixInstall, true);
});
