import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import { Sandbox } from "@deno/sandbox";
import process from "node:process";
import consola from "consola";
import path from "node:path";

export class DenoSandbox implements BaseSandbox {
  constructor(private sandbox: Sandbox) {}

  async start(): Promise<void> {
    // Deno's sandbox starts immediately upon creation, so we can just return here.
  }

  async stop(): Promise<void> {
    try {
      consola.info("Stopping Deno sandbox with ID:", await this.id());
      await this.sandbox.close();
      await this.sandbox.kill();
    } catch (error) {
      consola.error("Error killing sandbox:", error);
    }
  }

  async delete(): Promise<void> {
    await this.sandbox.close();
    await this.sandbox.kill();
  }

  async sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    const result = await this.sandbox.spawn("sh", {
      args: ["-c", command],
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });
    const output = await result.output();
    return output;
  }

  id(): Promise<string | null> {
    return Promise.resolve(this.sandbox.id);
  }

  async ssh(): Promise<{
    username: string;
    hostname: string;
  }> {
    const HOME = await this.sandbox.env.get("HOME");
    const PATH = await this.sandbox.env.get("PATH");
    await this.sandbox.env.set(
      "PATH",
      `${HOME}/.npm-global/bin:/usr/bin:${PATH}`,
    );
    return this.sandbox.exposeSsh();
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
}

class DenoProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const sandbox = await Sandbox.create({
      root: options.snapshotRoot,
      port: options.port,
      memory: options.memory,
      env: options.envVars,
      token: process.env.DENO_DEPLOY_TOKEN,
    });

    return new DenoSandbox(sandbox);
  }

  async get(id: string): Promise<BaseSandbox> {
    const sandbox = await Sandbox.connect(id);
    return new DenoSandbox(sandbox);
  }
}

export default DenoProvider;
