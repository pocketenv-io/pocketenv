import { Memory } from "@deno/sandbox";

export abstract class BaseSandbox {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract delete(): Promise<void>;
  abstract sh(strings: TemplateStringsArray, ...values: any[]): Promise<any>;
  abstract id(): Promise<string | null>;
}

abstract class BaseProvider {
  abstract create(options: SandboxOptions): Promise<BaseSandbox>;
}

export type Provider = "daytona" | "deno" | "vercel";

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
        return createSandbox("deno", { id });
      }
    }
    case "vercel":
      return import("./vercel/mod.ts").then((module) =>
        new module.default().get(id),
      );
    default:
      console.log(`Provider ${provider} is not supported yet.`);
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export default BaseProvider;
