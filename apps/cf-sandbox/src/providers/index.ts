export const VSCODE_PORT = 1024;

export abstract class BaseSandbox {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract delete(): Promise<void>;
  abstract sh(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }>;
  abstract id(): Promise<string | null>;
  abstract setEnvs(envVars: Record<string, string>): Promise<void>;
  abstract mkdir(dir: string): Promise<void>;
  abstract writeFile(path: string, content: string): Promise<void>;
  abstract setupSshKeys(privateKey: string, publicKey: string): Promise<void>;
  abstract setupTailscale(autKey: string): Promise<void>;
  abstract clone(repoUrl: string): Promise<void>;
  abstract mount(path: string, prefix?: string): Promise<void>;
  abstract unmount(path: string): Promise<void>;
  abstract expose(port: number, hostname: string): Promise<string | null>;
  abstract unexpose(port: number): Promise<void>;
  abstract exposeVscode(hostname: string): Promise<string | null>;
  abstract unexposeVscode(): Promise<void>;
  abstract startService(command: string): Promise<string>;
  abstract stopService(id: string): Promise<void>;
  abstract backup(dir: string, ttl?: number): Promise<string>;
  abstract restore(id: string, dir: string): Promise<void>;
}

abstract class BaseProvider {
  abstract create(options: SandboxOptions): Promise<BaseSandbox>;
}

export type Provider = "cloudflare";

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
  normalizeId?: boolean;
  [key: string]: any;
}

export async function createSandbox(
  provider: Provider,
  options: SandboxOptions = {},
): Promise<BaseSandbox> {
  switch (provider) {
    case "cloudflare":
      return import("./cloudflare").then((module) =>
        new module.default().create(options),
      );
    default:
      console.log(`Provider ${provider} is not supported yet.`);
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export default BaseProvider;
