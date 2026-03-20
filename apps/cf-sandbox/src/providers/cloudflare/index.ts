import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import BaseProvider, { BaseSandbox, SandboxOptions } from "..";
import { env } from "cloudflare:workers";
import path from "node:path";

export class CloudflareSandbox implements BaseSandbox {
  private normalizedId: string | null;

  constructor(
    private sandbox: Sandbox,
    normalizedId?: string,
  ) {
    this.normalizedId = normalizedId ?? null;
  }

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
    return this.normalizedId;
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
    await this.sandbox.writeFile(absolutePath, content + "\n", {
      encoding: "utf-8",
    });
  }

  async setupSshKeys(privateKey: string, publicKey: string): Promise<void> {
    const HOME = "/root";
    await this.sh`mkdir -p $HOME/.ssh`;
    await this.writeFile(`${HOME}/.ssh/id_ed25519`, privateKey);
    await this.writeFile(`${HOME}/.ssh/id_ed25519.pub`, publicKey);
    await this.sh`chmod 600 $HOME/.ssh/id_ed25519`;
    await this.sh`ssh-keyscan -t rsa tangled.org >> $HOME/.ssh/known_hosts`;
    await this.sh`ssh-keyscan -t rsa github.com >> $HOME/.ssh/known_hosts`;
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

  async mount(path: string, prefix?: string): Promise<void> {
    try {
      await this.mkdir(path);
      await this.sandbox.mountBucket(env.VOLUME_BUCKET, path, {
        endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
        prefix,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  unmount(path: string): Promise<void> {
    return this.sandbox.unmountBucket(path);
  }

  async expose(port: number, hostname: string): Promise<string | null> {
    try {
      const { url } = await this.sandbox.exposePort(port, {
        hostname: hostname.split(".").slice(-2).join("."),
        token: env.PREVIEW_TOKEN,
      });
      return url;
    } catch (e) {
      console.log("Failed to expose port", e);
    }
    return null;
  }

  async unexpose(port: number): Promise<void> {
    await this.sandbox.unexposePort(port);
  }
}

class CloudflareProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.id) {
      throw new Error("Sandbox ID is required for Cloudflare provider");
    }

    const normalize = options.normalizeId ?? false;
    const normalizedId = normalize ? options.id.toLowerCase() : options.id;

    const sandbox = getSandbox(env.Sandbox, options.id, {
      keepAlive: options.keepAlive,
      sleepAfter: options.sleepAfter,
      normalizeId: normalize,
    });
    return new CloudflareSandbox(sandbox, normalizedId);
  }
}

export default CloudflareProvider;
