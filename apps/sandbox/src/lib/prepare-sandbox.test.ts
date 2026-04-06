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
  // The if-condition uses `[ ! -f ... ] || ! command -v ...` style.
  // When setup IS already done: the condition returns exitCode 1 (not needed) → skip.
  class AlreadySetupMock extends MockSandbox {
    override sh(strings: TemplateStringsArray, ...values: any[]) {
      const cmd = String.raw({ raw: strings }, ...values);
      this.calls.push(cmd);
      // Condition checks return exitCode 1 = setup already done → skip step
      const exitCode = cmd.trimStart().startsWith("[") ? 1 : 0;
      return Promise.resolve({ exitCode, stdout: "", stderr: "" });
    }
  }

  const sandbox = new AlreadySetupMock();
  await prepareSandbox(sandbox, "nix");
  // The nix install command is inside a conditional step and must NOT have run
  const ranNixInstall = sandbox.calls.some((cmd) =>
    cmd.includes("install.determinate.systems/nix")
  );
  assertEquals(ranNixInstall, false);
});

Deno.test("prepareSandbox - executes run commands when condition not met", async () => {
  // The if-condition uses `[ ! -f ... ] || ! command -v ...` style.
  // When setup is NOT yet done: the condition returns exitCode 0 (needed) → run.
  // MockSandbox always returns exitCode 0, simulating a fresh environment.
  const sandbox = new MockSandbox();
  await prepareSandbox(sandbox, "nix");
  // With conditions saying "setup needed", conditional run commands should have executed
  const ranNixInstall = sandbox.calls.some((cmd) =>
    cmd.includes("install.determinate.systems/nix")
  );
  assertEquals(ranNixInstall, true);
});
