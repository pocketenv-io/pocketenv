export enum Providers {
  DAYTONA = "daytona",
  DENO = "deno",
  VERCEL = "vercel",
  CLOUDFLARE = "cloudflare",
}

export type Resources = {
  vcpus: number;
  memory: number;
  disk: number;
};

export const DefaultResources: Record<Providers, Resources> = {
  daytona: {
    vcpus: 2,
    memory: 4,
    disk: 8,
  },
  deno: {
    vcpus: 2,
    memory: 4,
    disk: 10,
  },
  vercel: {
    vcpus: 2,
    memory: 4,
    disk: 8,
  },
  cloudflare: {
    vcpus: 2,
    memory: 4,
    disk: 8,
  },
};
