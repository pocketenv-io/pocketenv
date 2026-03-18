import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import process from "node:process";
import consola from "consola";
import { Sprite, SpritesClient } from "@fly/sprites";
import path from "node:path";

export class SpriteSandbox implements BaseSandbox {
  constructor(private sprite: Sprite) {}

  async start(): Promise<void> {
    const client = new SpritesClient(process.env.SPRITE_TOKEN!);
    const name = await this.id();
    if (!name) {
      consola.error("Sprite name is not available");
      return;
    }
    const sprite = client.sprite(name);
    await sprite.exec("uname -a");
    // Sprite doesn't have a separate start method, so we do nothing here.
    // we just exec a command to make sure the sprite is running.
  }

  async stop(): Promise<void> {
    consola.info("Stopping Sprite with ID:", await this.id());
    // Sprites does not have a separate stop method, so we do nothing here.
  }

  async delete(): Promise<void> {
    await this.sprite.delete();
  }

  async sh(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    const command = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] || "");
    }, "");
    return this.sprite.exec(command);
  }

  id(): Promise<string | null> {
    return Promise.resolve(this.sprite.name);
  }

  async ssh(): Promise<any> {}

  async mkdir(dir: string): Promise<void> {
    await this.sprite.exec(`mkdir -p ${dir}`);
  }

  async writeFile(absolutePath: string, content: string): Promise<void> {
    const basePath = path.dirname(absolutePath);
    if (basePath !== "/" && basePath != ".") {
      await this.mkdir(basePath);
    }
    await this.sprite.execFile("sh", [
      "-c",
      `echo '${content}' > ${absolutePath}`,
    ]);
  }

  async setupSshKeys(privateKey: string, publicKey: string): Promise<void> {
    await this.writeFile("/home/sprite/.ssh/id_ed25519", privateKey);
    await this.writeFile("/home/sprite/.ssh/id_ed25519.pub", publicKey);
    await this.sprite.execFile("chmod", [
      "600",
      "/home/sprite/.ssh/id_ed25519",
    ]);
    await this.sprite.exec("rm -f /home/sprite/.ssh/known_hosts");
    await this.sprite.execFile("chmod", [
      "644",
      "/home/sprite/.ssh/id_ed25519.pub",
    ]);
    await this.sprite.execFile("bash", [
      "-c",
      "ssh-keyscan -t rsa tangled.org >> /home/sprite/.ssh/known_hosts",
    ]);
    await this.sprite.execFile("bash", [
      "-c",
      "ssh-keyscan -t rsa github.com >> /home/sprite/.ssh/known_hosts",
    ]);
  }

  async setupDefaultSshKeys(): Promise<void> {
    await this
      .sh`[ -f /home/sprite/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f /home/sprite/.ssh/id_ed25519 -q -N ""`;
  }

  async setupTailscale(authKey: string): Promise<void> {
    await this.sprite.execFile("bash", [
      "-c",
      "PATH=$(cat /etc/profile.d/languages_paths):$PATH type pm2 || npm install -g pm2",
    ]);
    await this.sprite.execFile("bash", [
      "-c",
      `type tailscaled || curl -fsSL https://tailscale.com/install.sh | sh `,
    ]);
    await this.sprite.execFile("bash", [
      "-c",
      `PATH=$(cat /etc/profile.d/languages_paths):$PATH pm2 start tailscaled`,
    ]);
    await this.sprite.execFile("bash", [
      "-c",
      `tailscale up --auth-key=${authKey}`,
    ]);
  }

  clone(repoUrl: string): Promise<any> {
    const dir = repoUrl.split("/").pop()?.replace(".git", "");
    return this.sprite.execFile("bash", [
      "-c",
      `git clone ${repoUrl} || git -C ${dir} pull`,
    ]);
  }
}

class SpritesProvider implements BaseProvider {
  async create(options: SandboxOptions): Promise<BaseSandbox> {
    const client = new SpritesClient(process.env.SPRITE_TOKEN!);

    if (!options.spriteName) {
      throw new Error("spriteName is required");
    }

    const sprite = await client.createSprite(options.spriteName);
    return new SpriteSandbox(sprite);
  }

  async get(id: string): Promise<BaseSandbox> {
    const client = new SpritesClient(process.env.SPRITE_TOKEN!);
    const sprite = client.sprite(id);
    return new SpriteSandbox(sprite);
  }
}

export default SpritesProvider;
