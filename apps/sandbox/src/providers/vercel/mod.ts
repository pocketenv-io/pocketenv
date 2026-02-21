import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Sandbox } from "@vercel/sandbox";
import process from "node:process";
import consola from "consola";

export class VercelSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Vercel's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      consola.info("Stopping Vercel sandbox with ID:", await this.id());
      await this.sandbox.stop();
    } catch (error) {
      consola.error("Error stopping Vercel sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    await this.sandbox.stop();
    // Vercel's sandbox does not have a separate delete method, so we just stop it.
  }

  async sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    const result = await this.sandbox.runCommand("sh", ["-c", command]);

    return {
      ...result,
      stdout: await result.stdout(),
      stderr: await result.stderr(),
    };
  }

  async id(): Promise<string | null> {
    return this.sandbox.sandboxId;
  }

  async ssh(): Promise<any> {}
}

class VercelProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const credentials = {
      token: process.env.VERCEL_API_TOKEN,
      projectId: process.env.VERCEL_PROJECT_ID,
      teamId: process.env.VERCEL_TEAM_ID,
    };
    const ports = {
      ports: options.ports,
    };
    const sandbox = await Sandbox.create(
      options.snapshotId
        ? {
            source: {
              type: "snapshot",
              snapshotId: options.snapshotId,
            },
            ...credentials,
            ...ports,
          }
        : { ...ports, ...credentials },
    );

    return new VercelSandbox(sandbox);
  }

  async get(id: string): Promise<BaseSandbox> {
    const sandbox = await Sandbox.get({
      sandboxId: id,
      token: process.env.VERCEL_API_TOKEN,
      projectId: process.env.VERCEL_PROJECT_ID,
      teamId: process.env.VERCEL_TEAM_ID,
    });
    return new VercelSandbox(sandbox);
  }
}

export default VercelProvider;
