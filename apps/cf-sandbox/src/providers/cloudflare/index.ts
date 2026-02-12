import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import BaseProvider, { BaseSandbox, SandboxOptions } from "..";
import { env } from "cloudflare:workers";

export class CloudflareSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    await this.sandbox.start();
  }

  async stop(): Promise<void> {
    await this.sandbox.stop();
  }

  async delete(): Promise<void> {
    await this.sandbox.stop();
    await this.sandbox.destroy();
  }

  async sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    const result = await this.sandbox.exec(command);
    return result;
  }

  async id(): Promise<string | null> {
    return null;
  }
}

class CloudflareProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.id) {
      throw new Error("Sandbox ID is required for Cloudflare provider");
    }

    const sandbox = getSandbox(env.Sandbox, options.id, {
      keepAlive: options.keepAlive,
      sleepAfter: options.sleepAfter,
    });
    return new CloudflareSandbox(sandbox);
  }
}

export default CloudflareProvider;
