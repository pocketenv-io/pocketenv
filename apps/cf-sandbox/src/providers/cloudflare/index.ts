import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import BaseProvider, { BaseSandbox, SandboxOptions } from "..";
import { env } from "cloudflare:workers";
import path from "node:path";

export class CloudflareSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 15,
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

  async setEnvs(envVars: Record<string, string>): Promise<void> {
    await this.sandbox.setEnvVars(envVars);
  }

  async mkdir(dir: string): Promise<void> {
    await this.sandbox.mkdir(dir, { recursive: true });
  }

  async writeFile(absolutePath: string, content: string): Promise<void> {
    const basePath = path.dirname(absolutePath);
    if (basePath !== "/" && basePath != ".") {
      await this.sandbox.mkdir(basePath, { recursive: true });
    }
    await this.sandbox.writeFile(absolutePath, content, { encoding: "utf-8" });
  }

  async setupSshKeys(privateKey: string, publicKey: string): Promise<void> {
    const HOME = "/root";
    await this.sh`mkdir -p $HOME/.ssh`;
    await this.writeFile(`${HOME}/.ssh/id_ed25519`, privateKey);
    await this.writeFile(`${HOME}/.ssh/id_ed25519.pub`, publicKey);
    await this.sh`chmod 600 $HOME/.ssh/id_ed25519`;
  }

  async setupTailscale(authKey: string): Promise<void> {
    await this
      .sh`type tailscaled || curl -fsSL https://tailscale.com/install.sh | sh || true`;
    await this.sh`pm2 start tailscaled || true`;
    await this.sh`tailscale up --auth-key=${authKey} || true`;
  }

  clone(repoUrl: string): Promise<any> {
    return this.sh`git clone ${repoUrl}`;
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
