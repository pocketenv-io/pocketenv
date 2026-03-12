import BaseProvider, { BaseSandbox, SandboxOptions } from "../mod.ts";
import process from "node:process";
import consola from "consola";
import { Sprite, SpritesClient } from "@fly/sprites";

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
