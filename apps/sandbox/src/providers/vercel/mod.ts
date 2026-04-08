import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Sandbox } from "@vercel/sandbox";
import consola from "consola";
import path from "node:path";
import { env } from "node:process";
import { Buffer } from "node:buffer";

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

  async sh(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<{
    stdout?: string | Buffer<ArrayBufferLike>;
    stderr?: string | Buffer<ArrayBufferLike>;
    exitCode: number;
  }> {
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

  async mkdir(dir: string): Promise<void> {
    await this.sh`mkdir -p ${dir}`;
  }

  async writeFile(absolutePath: string, content: string): Promise<void> {
    const basePath = path.dirname(absolutePath);
    if (basePath !== "/" && basePath != ".") {
      await this.mkdir(basePath);
    }
    await this.sh`echo '${content}' > ${absolutePath}`;
  }

  async setupSshKeys(privateKey: string, publicKey: string): Promise<void> {
    await this.writeFile("~/.ssh/id_ed25519", privateKey);
    await this.writeFile("~/.ssh/id_ed25519.pub", publicKey);
    await this.sh`chmod 600 ~/.ssh/id_ed25519`;
    await this.sh`chmod 644 ~/.ssh/id_ed25519.pub`;
    await this.sh`ssh-keyscan -t rsa tangled.org >> $HOME/.ssh/known_hosts`;
    await this.sh`ssh-keyscan -t rsa github.com >> $HOME/.ssh/known_hosts`;
  }

  async setupDefaultSshKeys(): Promise<void> {
    await this
      .sh`[ -f ~/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -q -N "" || true`;
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
    const VERSION = "v1.2.1";
    const ARCH = "amd64";
    await this
      .sh`command -v tigrisfs || ARCH=amd64 && curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION.replace("v", "")}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz`;
    await this
      .sh`command -v tigrisfs || tar -xzf /tmp/tigrisfs.tar.gz -C $HOME/.local/bin`;
    await this.sh`command -v tigrisfs || rm -rf /tmp/tigrisfs.tar.gz`;
    await this.sh`command -v tigrisfs || chmod +x $HOME/.local/bin/tigrisfs`;
    await this.sh`mkdir -p ${path} || sudo mkdir -p ${path}`;

    await this.mkdir(path);

    const bucketPath = prefix
      ? `${env.VOLUME_BUCKET}:${prefix}`
      : env.VOLUME_BUCKET;

    await this.sandbox.runCommand({
      cmd: "sh",
      args: [
        "-c",
        `tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" ${bucketPath} ${path} || sudo nohup tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" ${bucketPath} ${path} || true`,
      ],
      env: {
        AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID!,
        AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY!,
      },
      detached: true,
    });
  }

  async unmount(path: string): Promise<void> {
    await this
      .sh`fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`;
  }
}

class VercelProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const credentials = {
      token: options.vercelApiToken,
      projectId: options.vercelProjectId,
      teamId: options.vercelTeamId,
    };
    const ports = {
      ports: [...(options.ports || []), 26661],
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

  async get(id: string, options: SandboxOptions): Promise<BaseSandbox> {
    const sandbox = await Sandbox.get({
      sandboxId: id,
      token: options.vercelApiToken,
      projectId: options.vercelProjectId,
      teamId: options.vercelTeamId,
    });
    return new VercelSandbox(sandbox);
  }
}

export default VercelProvider;
