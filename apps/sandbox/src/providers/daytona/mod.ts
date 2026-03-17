import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Daytona, Sandbox } from "@daytonaio/sdk";
import process from "node:process";
import consola from "consola";
import path from "node:path";

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
  sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    return this.sandbox.process.executeCommand(command);
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
}

class DaytonaProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    if (!options.organizationId) {
      throw new Error("Organisation ID is required for Daytona provider");
    }
    const daytona = new Daytona({
      organizationId: options.organizationId,
      apiKey: process.env.DAYTONA_API_KEY,
      apiUrl: process.env.DAYTONA_API_URL,
      _experimental: {},
    });

    const sandbox = await daytona.create({
      language: "typescript",
      snapshot: process.env.DAYTONA_SNAPSHOT,
      envVars: options.envVars,
    });

    return new DaytonaSandbox(sandbox);
  }

  async get(id: string): Promise<BaseSandbox> {
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY,
      apiUrl: process.env.DAYTONA_API_URL,
      _experimental: {},
    });

    const sandbox = await daytona.get(id);
    return new DaytonaSandbox(sandbox);
  }
}

export default DaytonaProvider;
