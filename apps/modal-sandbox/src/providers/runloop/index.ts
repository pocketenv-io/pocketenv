import { RunloopSDK, Devbox } from "@runloop/api-client";
import BaseProvider, { BaseSandbox, type SandboxOptions } from "..";
import { consola } from "consola";
import path from "node:path";
import { env } from "node:process";
import parseImageRef from "lib/parseImageRef";

export class RunloopSandbox implements BaseSandbox {
  constructor(private sandbox: Devbox) {}

  async start(): Promise<void> {
    // Runloop's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      await this.sandbox.shutdown();
    } catch (error) {
      consola.error("Error stopping Runloop Sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    try {
      await this.stop();
    } catch (error) {
      consola.error("Error deleting Runloop Sandbox:", error);
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
    const result = await this.sandbox.cmd.exec(`bash -c ${command}`);

    return {
      stdout: await result.stdout(),
      stderr: await result.stderr(),
      exitCode: result.exitCode || 0,
    };
  }

  async id(): Promise<string | null> {
    return this.sandbox.id;
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

    await this
      .sh`AWS_ACCESS_KEY_ID=${env.R2_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${env.R2_SECRET_ACCESS_KEY} nohup tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path} > /dev/null 2>&1 &`;
  }

  async unmount(path: string): Promise<void> {
    await this
      .sh`fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`;
  }
}

class RunloopProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.runloopApiKey) {
      throw new Error("Runloop API KEY is required to create a sandbox");
    }
    const image = options.image || "ghcr.io/pocketenv-io/modal-openclaw:0.1.0";
    const { name } = parseImageRef(image);
    const templateName = name.split("/").pop()!;
    const sdk = new RunloopSDK({
      bearerToken: options.runloopApiKey,
    });

    try {
      const sandbox = await sdk.devbox.create({
        blueprint_name: templateName,
      });
      return new RunloopSandbox(sandbox);
    } catch (error) {
      consola.warn(
        `Runloop blueprint ${templateName} not found, creating a new one...`,
      );
      await sdk.blueprint.create({
        name: templateName,
        dockerfile: `FROM ${image}`,
        launch_parameters: {
          user_parameters: {
            username: "modal",
            uid: 1995,
          },
          resource_size_request: "MEDIUM",
        },
      });
      const sandbox = await sdk.devbox.create({
        blueprint_name: templateName,
      });
      return new RunloopSandbox(sandbox);
    }
  }

  async get(id: string, options?: SandboxOptions): Promise<BaseSandbox> {
    if (!options?.runloopApiKey) {
      throw new Error("Runloop API KEY is required to get a sandbox");
    }
    try {
      const sdk = new RunloopSDK({
        bearerToken: options?.runloopApiKey,
      });
      const sandbox = sdk.devbox.fromId(id);
      return new RunloopSandbox(sandbox);
    } catch {
      return this.create(options!);
    }
  }
}

export default RunloopProvider;
