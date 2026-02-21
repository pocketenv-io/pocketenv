import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Daytona, Sandbox } from "@daytonaio/sdk";
import process from "node:process";
import consola from "consola";

export class DaytonaSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    await this.sandbox.start();
  }

  async stop(): Promise<void> {
    try {
      consola.info("Stopping Daytona sandbox with ID:", await this.id());
      await this.sandbox.stop();
    } catch (error) {
      consola.error("Error stopping Daytona sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    await this.sandbox.delete();
  }

  // deno-lint-ignore no-explicit-any
  sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    return Promise.resolve(this.sandbox.process.executeCommand(command));
  }

  id(): Promise<string | null> {
    return Promise.resolve(this.sandbox.id);
  }

  async ssh(): Promise<{
    username: string;
    hostname: string;
  }> {
    const sshAccess = await this.sandbox.createSshAccess();
    return {
      username: sshAccess.token,
      hostname: "ssh.app.daytona.io",
    };
  }
}

class DaytonaProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.organizationId) {
      throw new Error("Organisation ID is required for Daytona provider");
    }
    const daytona = new Daytona({
      organizationId: options.organizationId,
      apiKey: process.env.DAYTONA_API_KEY,
      apiUrl: process.env.DAYTONA_API_URL,
      _experimental: {},
    });

    const sandbox = await daytona.create({
      language: "typescript",
      snapshot: process.env.DAYTONA_SNAPSHOT,
      envVars: options.envVars,
    });

    return new DaytonaSandbox(sandbox);
  }

  async get(id: string): Promise<BaseSandbox> {
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY,
      apiUrl: process.env.DAYTONA_API_URL,
      _experimental: {},
    });

    const sandbox = await daytona.get(id);
    return new DaytonaSandbox(sandbox);
  }
}

export default DaytonaProvider;
