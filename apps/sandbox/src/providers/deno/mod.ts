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
      await this.sandbox.kill();
    } catch (error) {
      consola.error("Error killing sandbox:", error);
    }
  }

  async delete(): Promise<void> {
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

  async id(): Promise<string | null> {
    return this.sandbox.id;
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
