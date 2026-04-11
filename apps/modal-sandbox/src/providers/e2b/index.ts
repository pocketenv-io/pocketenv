import { Sandbox, Template } from "e2b";
import BaseProvider, { BaseSandbox, type SandboxOptions } from "..";
import { consola } from "consola";
import path from "node:path";
import { env } from "node:process";
import parseImageRef from "lib/parseImageRef";

export class E2bSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Modal's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      await this.sandbox.kill();
    } catch (error) {
      consola.error("Error stopping e2b sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    try {
      await this.stop();
    } catch (error) {
      consola.error("Error deleting e2b sandbox:", error);
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
    const result = await this.sandbox.commands.run(`bash -c ${command}`);

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
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

class E2bProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.e2bAccessToken) {
      throw new Error("E2B access token is required to create a sandbox");
    }
    const image = options.image || "ghcr.io/pocketenv-io/modal-openclaw:0.1.0";
    const template = Template().fromImage(image);
    const { name, tag } = parseImageRef(image);
    await Template.build(template, name, {
      tags: [tag],
      cpuCount: 4,
      memoryMB: 4096,
    });
    const sandbox = await Sandbox.create(`${name}:${tag}`, {
      accessToken: options.e2bAccessToken,
    });
    return new E2bSandbox(sandbox);
  }

  async get(id: string, options?: SandboxOptions): Promise<BaseSandbox> {
    try {
      if (!options?.e2bAccessToken) {
        throw new Error("E2B access token is required to get a sandbox");
      }
      const sandbox = await Sandbox.connect(id, {
        accessToken: options?.e2bAccessToken,
      });
      return new E2bSandbox(sandbox);
    } catch {
      return this.create(options!);
    }
  }
}

export default E2bProvider;
