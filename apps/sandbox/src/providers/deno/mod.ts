import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Sandbox } from "@deno/sandbox";
import process from "node:process";
import consola from "consola";

export class DenoSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Deno's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      consola.info("Stopping Deno sandbox with ID:", await this.id());
      await this.sandbox.close();
      await this.sandbox.kill();
    } catch (error) {
      consola.error("Error killing sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    await this.sandbox.close();
    await this.sandbox.kill();
  }

  async sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    const result = await this.sandbox.spawn("sh", {
      args: ["-c", command],
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });
    const output = await result.output();
    return output;
  }

  id(): Promise<string | null> {
    return Promise.resolve(this.sandbox.id);
  }

  async ssh(): Promise<{
    username: string;
    hostname: string;
  }> {
    const HOME = await this.sandbox.env.get("HOME");
    const PATH = await this.sandbox.env.get("PATH");
    await this.sandbox.env.set(
      "PATH",
      `${HOME}/.npm-global/bin:/usr/bin:${PATH}`,
    );
    return this.sandbox.exposeSsh();
  }
}

class DenoProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const sandbox = await Sandbox.create({
      root: options.snapshotRoot,
      port: options.port,
      memory: options.memory,
      env: options.envVars,
      token: process.env.DENO_DEPLOY_TOKEN,
    });

    return new DenoSandbox(sandbox);
  }

  async get(id: string): Promise<BaseSandbox> {
    const sandbox = await Sandbox.connect(id);
    return new DenoSandbox(sandbox);
  }
}

export default DenoProvider;
