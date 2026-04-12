import { Sandbox, Template } from "@hopx-ai/sdk";
import BaseProvider, { BaseSandbox, type SandboxOptions } from "..";
import { consola } from "consola";
import path from "node:path";
import { env } from "node:process";
import parseImageRef from "lib/parseImageRef";

export class HopxSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Hopx's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      await this.sandbox.kill();
    } catch (error) {
      consola.error("Error stopping hopx Sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    try {
      await this.stop();
    } catch (error) {
      consola.error("Error deleting hopx Sandbox:", error);
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
    const result = await this.sandbox.commands.run(command);

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exit_code,
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

    await this
      .sh`AWS_ACCESS_KEY_ID=${env.R2_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${env.R2_SECRET_ACCESS_KEY} nohup tigrisfs --endpoint "https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com" -o allow_other,default_permissions ${bucketPath} ${path} > /dev/null 2>&1 &`;
  }

  async unmount(path: string): Promise<void> {
    await this
      .sh`fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`;
  }
}

class HopxProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.hopxApiKey) {
      throw new Error("Hopx API KEY is required to create a sandbox");
    }

    const image = options.image || "ghcr.io/pocketenv-io/modal-openclaw:0.1.0";
    const template = new Template(image);
    const { name } = parseImageRef(image);
    const templateName = name.split("/").pop()!;

    try {
      const sandbox = await Sandbox.create({
        template: templateName,
        apiKey: options.hopxApiKey,
        region: "us-east",
      });
      return new HopxSandbox(sandbox);
    } catch (error) {
      consola.warn(
        `Sandbox with template ${templateName} not found, creating a new one...`,
      );

      template.runCmd(
        `echo "This is a custom template built from image ${image}"`,
      );

      await Template.build(template, {
        name: templateName,
        apiKey: options.hopxApiKey,
        cpu: 2,
        memory: 4096,
        diskGB: 10,
      });
      const sandbox = await Sandbox.create({
        template: templateName,
        apiKey: options.hopxApiKey,
        region: "us-east",
      });
      return new HopxSandbox(sandbox);
    }
  }

  async get(id: string, options?: SandboxOptions): Promise<BaseSandbox> {
    if (!options?.hopxApiKey) {
      throw new Error("Hopx API KEY is required to get a sandbox");
    }

    try {
      const sandbox = await Sandbox.connect(id, options.hopxApiKey);
      return new HopxSandbox(sandbox);
    } catch {
      consola.warn(`Sandbox with id ${id} not found, creating a new one...`);
      return this.create(options!);
    }
  }
}

export default HopxProvider;
