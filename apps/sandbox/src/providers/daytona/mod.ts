import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Daytona, Sandbox } from "@daytonaio/sdk";
import process, { env } from "node:process";
import consola from "consola";
import path from "node:path";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";

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
    await this
      .sh`type s3fs || apt-get update && apt-get install -y s3fs || sudo apt-get update && sudo apt-get install -y s3fs || true`;
    await this.sh`mkdir -p ${path} || sudo mkdir -p ${path}`;

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

    const sandbox = await daytona.create({
      language: "typescript",
      // snapshot: process.env.DAYTONA_SNAPSHOT,
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
