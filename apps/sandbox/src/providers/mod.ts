import { Memory } from "@deno/sandbox";
import { Buffer } from "node:buffer";
import process from "node:process";

export abstract class BaseSandbox {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract delete(): Promise<void>;
  abstract sh(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<{
    stdout?: string | Buffer<ArrayBufferLike>;
    stderr?: string | Buffer<ArrayBufferLike>;
    exitCode: number;
  }>;
  abstract id(): Promise<string | null>;
  abstract ssh(): Promise<any>;
  abstract mkdir(dir: string): Promise<void>;
  abstract writeFile(path: string, content: string): Promise<void>;
  abstract setupSshKeys(privateKey: string, publicKey: string): Promise<void>;
  abstract setupTailscale(authKey: string): Promise<void>;
  abstract clone(repoUrl: string): Promise<any>;
  abstract setupDefaultSshKeys(): Promise<void>;
  abstract mount(path: string, prefix?: string): Promise<void>;
  abstract unmount(path: string): Promise<void>;
}

abstract class BaseProvider {
  abstract create(options: SandboxOptions): Promise<BaseSandbox>;
}

export type Provider = "daytona" | "deno" | "vercel" | "sprites";

export interface SandboxOptions {
  id?: string;
  keepAlive?: boolean;
  sleepAfter?: string;
  envVars?: Record<string, string>;
  secretVars?: Record<string, string>;
  snapshotId?: string;
  ports?: number[];
  snapshotRoot?: string;
  port?: number;
  memory?: Memory;
  spriteName?: string;
  [key: string]: any;
}

export async function createSandbox(
  provider: Provider,
  options: SandboxOptions = {},
): Promise<BaseSandbox> {
  switch (provider) {
    case "daytona":
      return import("./daytona/mod.ts").then((module) =>
        new module.default().create(options),
      );
    case "deno":
      return import("./deno/mod.ts").then((module) =>
        new module.default().create(options),
      );
    case "vercel":
      return import("./vercel/mod.ts").then((module) =>
        new module.default().create(options),
      );
    case "sprites":
      return import("./sprites/mod.ts").then((module) =>
        new module.default().create(options),
      );
    default:
      console.log(`Provider ${provider} is not supported yet.`);
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function getSandboxById(
  provider: Provider,
  id: string,
): Promise<BaseSandbox> {
  switch (provider) {
    case "daytona":
      return import("./daytona/mod.ts").then((module) =>
        new module.default().get(id),
      );
    case "deno": {
      const module = await import("./deno/mod.ts");
      try {
        return await new module.default().get(id);
      } catch (err) {
        console.error(`Error getting Deno sandbox with ID ${id}:`, err);
        return createSandbox("deno", {
          id,
          snapshotRoot: process.env.DENO_SNAPSHOT_ROOT,
        });
      }
    }
    case "vercel":
      return import("./vercel/mod.ts").then((module) =>
        new module.default().get(id),
      );
    case "sprites":
      return import("./sprites/mod.ts").then((module) =>
        new module.default().get(id),
      );
    default:
      console.log(`Provider ${provider} is not supported yet.`);
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export default BaseProvider;
