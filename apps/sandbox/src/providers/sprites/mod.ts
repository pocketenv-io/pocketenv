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
    await this.sprite.exec(`echo '${content}' > ${absolutePath}`);
  }

  async setupSshKeys(privateKey: string, publicKey: string): Promise<void> {
    await this.writeFile("/home/sprite/.ssh/id_ed25519", privateKey);
    await this.writeFile("/home/sprite/.ssh/id_ed25519.pub", publicKey);
    await this.sprite.exec(`chmod 600 $HOME/.ssh/id_ed25519`);
    await this.sprite.exec(`chmod 644 $HOME/.ssh/id_ed25519.pub`);
    await this.sprite.exec(
      `cat $HOME/.ssh/id_ed25519.pub >> $HOME/.ssh/authorized_keys`,
    );
    await this.sprite.exec(`chmod 644 $HOME/.ssh/authorized_keys`);
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
