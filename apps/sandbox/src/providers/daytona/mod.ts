import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Daytona, Sandbox, Image } from "@daytonaio/sdk";
import process, { env } from "node:process";
import consola from "consola";
import path from "node:path";
import { Buffer } from "node:buffer";
import { images } from "../../images.ts";
import parseImageRef from "../../lib/parseImageRef.ts";

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
    const result = await this.sandbox.process.executeCommand(command);
    return {
      stdout: result.result,
      exitCode: result.exitCode,
    };
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
    const dir = repoUrl.split("/").pop()?.replace(".git", "");
    return this.sh`git clone ${repoUrl} || git -C ${dir} pull`;
  }

  async mount(path: string, prefix?: string): Promise<void> {
    const VERSION = "v1.2.1";
    const ARCH = "amd64";
    await this.sh`mkdir -p $HOME/.local/bin`;
    await this
      .sh`command -v tigrisfs || ARCH=amd64 && curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION.replace("v", "")}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz`;
    await this
      .sh`command -v tigrisfs || tar -xzf /tmp/tigrisfs.tar.gz -C $HOME/.local/bin`;
    await this.sh`command -v tigrisfs || rm -rf /tmp/tigrisfs.tar.gz`;
    await this.sh`command -v tigrisfs || chmod +x $HOME/.local/bin/tigrisfs`;
    await this
      .sh`cp $HOME/.local/bin/tigrisfs /usr/bin || sudo cp $HOME/.local/bin/tigrisfs /usr/bin || true`;
    await this.sh`mkdir -p ${path} || sudo mkdir -p ${path}`;

    await this.mkdir(path);

    const bucketPath = prefix
      ? `${env.VOLUME_BUCKET}:${prefix}`
      : env.VOLUME_BUCKET;

    await this.sandbox.process.executeCommand(
      `nohup tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path} || sudo nohup tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path} || true`,
      undefined,
      {
        AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID!,
        AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY!,
      },
    );
  }

  async unmount(path: string): Promise<void> {
    await this
      .sh`fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`;
  }
}

class DaytonaProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.organizationId) {
      throw new Error("Organisation ID is required for Daytona provider");
    }
    const daytona = new Daytona({
      organizationId: options.organizationId,
      apiKey: options.daytonaApiKey,
      apiUrl: process.env.DAYTONA_API_URL,
      _experimental: {},
    });

    const DEFAULT_IMAGE = "ghcr.io/pocketenv-io/daytona-openclaw:0.6.0";
    const name = options.image
      ? images[options.image] || DEFAULT_IMAGE
      : DEFAULT_IMAGE;
    const image = Image.base(name);
    const metadata = parseImageRef(name);
    const snapshotName = metadata.name.split("/").pop()!;
    try {
      const snapshot = await daytona.snapshot.get(snapshotName);
      if (snapshot.state !== "active") {
        consola.warn(
          "Snapshot found in Daytona but not active, activating snapshot",
          snapshotName,
        );
        await daytona.snapshot.activate(snapshot);
      }
    } catch (error) {
      consola.warn(
        "Snapshot not found in Daytona, building image and creating snapshot",
        snapshotName,
        error,
      );
      await daytona.snapshot.create({
        name: snapshotName,
        image,
        resources: {
          cpu: 2,
          memory: 4,
          disk: 8,
        },
      });
    }

    const sandbox = await daytona.create({
      language: "typescript",
      snapshot: snapshotName,
      envVars: options.envVars,
    });

    return new DaytonaSandbox(sandbox);
  }

  async get(
    id: string,
    apiKey?: string,
    organizationId?: string,
  ): Promise<BaseSandbox> {
    const daytona = new Daytona({
      apiKey,
      apiUrl: process.env.DAYTONA_API_URL,
      organizationId,
      _experimental: {},
    });

    const sandbox = await daytona.get(id);
    return new DaytonaSandbox(sandbox);
  }
}

export default DaytonaProvider;
