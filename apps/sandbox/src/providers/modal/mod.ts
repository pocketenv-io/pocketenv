import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { ModalClient, Sandbox } from "modal";
import consola from "consola";
import path from "node:path";
import { env } from "node:process";
import { Buffer } from "node:buffer";
import {
  adjectives,
  generateUniqueAsync,
  nouns,
} from "unique-username-generator";

export class ModalSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Modal's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      consola.info("Stopping Modal sandbox with ID:", await this.id());
      await this.sandbox.terminate();
    } catch (error) {
      consola.error("Error stopping Modal sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    // Modal's sandbox does not have a separate delete method, so we just stop it.
    try {
      consola.info("Deleting Modal sandbox with ID:", await this.id());
      await this.stop();
    } catch (error) {
      consola.error("Error deleting Modal sandbox:", error);
    }
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
    const result = await this.sandbox.exec(["bash", "-c", command]);

    return {
      ...result,
      stdout: await result.stdout.readText(),
      stderr: await result.stderr.readText(),
      exitCode: await result.wait(),
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
    await this.sh`mkdir -p $HOME/.local/bin`;
    await this
      .sh`command -v tigrisfs || ARCH=amd64 && curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION.replace("v", "")}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz`;
    await this
      .sh`command -v tigrisfs || tar -xzf /tmp/tigrisfs.tar.gz -C ~/.local/bin`;
    await this.sh`command -v tigrisfs || rm -rf /tmp/tigrisfs.tar.gz`;
    await this.sh`command -v tigrisfs || chmod +x ~/.local/bin/tigrisfs`;
    await this
      .sh`cp ~/.local/bin/tigrisfs /usr/bin || sudo cp ~/.local/bin/tigrisfs /usr/bin || true`;
    await this.sh`mkdir -p ${path} || sudo mkdir -p ${path}`;
    // install fuse ?

    await this.mkdir(path);

    const bucketPath = prefix
      ? `${env.VOLUME_BUCKET}:${prefix}`
      : env.VOLUME_BUCKET;

    await this.sandbox.exec(
      [
        "sh",
        "-c",
        `tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path} || sudo tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path}`,
      ],
      {
        env: {
          AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID!,
          AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY!,
        },
      },
    );
  }

  async unmount(path: string): Promise<void> {
    await this
      .sh`fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`;
  }
}

class ModalProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const suffix = Math.random().toString(36).substring(2, 6);
    let modalAppName = await generateUniqueAsync(
      { dictionaries: [adjectives, nouns], separator: "-" },
      () => false,
    );
    modalAppName = `${modalAppName}-${suffix}`;
    const modal = new ModalClient({
      tokenId: options.modalTokenId || env.MODAL_TOKEN_ID!,
      tokenSecret: options.modalTokenSecret || env.MODAL_TOKEN_SECRET!,
    });
    const app = await modal.apps.fromName(
      options.modalAppName || modalAppName,
      {
        createIfMissing: true,
      },
    );
    const image = modal.images.fromRegistry(
      options.image || "node:lts-trixie-slim",
    );
    const sandbox = await modal.sandboxes.create(app, image);

    return new ModalSandbox(sandbox);
  }

  async get(id: string, options?: SandboxOptions): Promise<BaseSandbox> {
    const modal = new ModalClient({
      tokenId: options?.modalTokenId || env.MODAL_TOKEN_ID!,
      tokenSecret: options?.modalTokenSecret || env.MODAL_TOKEN_SECRET!,
    });
    const sandbox = await modal.sandboxes.fromId(id);
    return new ModalSandbox(sandbox);
  }
}

export default ModalProvider;
