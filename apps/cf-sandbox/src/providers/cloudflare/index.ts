import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import BaseProvider, { BaseSandbox, SandboxOptions } from "..";
import { env } from "cloudflare:workers";

export class CloudflareSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    initialDelayMs: number = 500,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (i < maxRetries - 1) {
          const delayMs = initialDelayMs * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  async start(): Promise<void> {
    await this.retryWithBackoff(() => this.sandbox.start());
  }

  async stop(): Promise<void> {
    await this.sandbox.stop();
    await this.sandbox.destroy();
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
      normalizeId: true,
    });
    return new CloudflareSandbox(sandbox);
  }
}

export default CloudflareProvider;
