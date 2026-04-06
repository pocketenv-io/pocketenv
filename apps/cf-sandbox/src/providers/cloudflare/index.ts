import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import BaseProvider, { BaseSandbox, SandboxOptions, VSCODE_PORT } from "..";
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

  async start(): Promise<void> {
    await this.sandbox.start();
    await this.sh`echo "Starting sandbox with ID: ${this.normalizedId}"`;
  }

  async stop(): Promise<void> {
    await this.sandbox.setKeepAlive(false);
    await this.sandbox.stop();
    await this.sandbox.destroy();
  }

  async delete(): Promise<void> {
    await this.sandbox.setKeepAlive(false);
    await this.sandbox.stop();
    await this.sandbox.destroy();
  }

  async sh(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
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
    const homeResult = await this.sh`echo $HOME`;
    const HOME = homeResult.stdout.trim() || "/root";
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

      const passwdFile = `/tmp/.passwd-s3fs-${crypto.randomUUID()}`;

      await this.writeFile(
        passwdFile,
        `${env.R2_ACCESS_KEY_ID}:${env.R2_SECRET_ACCESS_KEY}`,
      );

      await this.sh`chmod 0600 '${passwdFile}'`;

      const bucketPath = prefix
        ? `${env.VOLUME_BUCKET}:${prefix}`
        : env.VOLUME_BUCKET;

      await this
        .sh`s3fs '${bucketPath}' '${path}' -o 'passwd_file=${passwdFile},nomixupload,compat_dir,url=https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com'`;
    } catch (e) {
      console.log(e);
    }
  }

  unmount(path: string): Promise<void> {
    return this.sandbox.unmountBucket(path);
  }

  async expose(port: number, hostname: string): Promise<string | null> {
    try {
      if (port === VSCODE_PORT) {
        return await this.exposeVscode(hostname);
      }

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
    try {
      await this.sandbox.unexposePort(port);
    } catch (e) {
      console.log("Failed to unexpose port", e);
    }
  }

  async exposeVscode(hostname: string): Promise<string | null> {
    try {
      const homeResult = await this.sh`echo $HOME`;
      const HOME = homeResult.stdout.trim() || "/root";
      await this.writeFile(
        `${HOME}/.local/share/code-server/User/settings.json`,
        JSON.stringify(
          {
            "workbench.colorTheme": "6. KIROㅤㅤ(Lynx Theme)",
            "workbench.iconTheme": "lynx-pro-light",
            "editor.fontFamily": "'CaskaydiaMono Nerd Font', monospace",
            "editor.fontSize": 14,
            "terminal.integrated.fontFamily":
              "'CaskaydiaMono Nerd Font', monospace",
          },
          null,
          2,
        ),
      );

      await this.sandbox.startProcess(
        `curl http://localhost:${VSCODE_PORT} || code-server --bind-addr 0.0.0.0:${VSCODE_PORT} --auth none`,
      );

      const { url } = await this.sandbox.exposePort(VSCODE_PORT, {
        hostname: hostname.split(".").slice(-2).join("."),
        token: `vsc_${env.PREVIEW_TOKEN}`,
      });
      return url;
    } catch (e) {
      console.log("Failed to expose vscode port", e);
    }

    await this.sandbox.setKeepAlive(true);

    return null;
  }

  async unexposeVscode(): Promise<void> {
    try {
      await this.sandbox.unexposePort(VSCODE_PORT);
    } catch (e) {
      console.log("Failed to unexpose vscode port", e);
    }
  }

  async startService(command: string): Promise<string> {
    const { id } = await this.sandbox.startProcess(command);
    await this.sandbox.setKeepAlive(true);
    return id;
  }

  async stopService(id: string): Promise<void> {
    await this.sandbox.killProcess(id);
  }

  async backup(dir: string, ttl?: number): Promise<string> {
    const { id } = await this.sandbox.createBackup({ dir, ttl });
    return id;
  }

  async restore(id: string, dir: string): Promise<void> {
    await this.sandbox.restoreBackup({ id, dir });
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
