import { describe, expect, it } from "vitest";
import { DefaultResources, Providers, VSCODE_PORT } from "../consts";

describe("VSCODE_PORT", () => {
  it("is 1024", () => {
    expect(VSCODE_PORT).toBe(1024);
  });
});

describe("Providers", () => {
  it("has all expected provider values", () => {
    expect(Providers.DAYTONA).toBe("daytona");
    expect(Providers.DENO).toBe("deno");
    expect(Providers.VERCEL).toBe("vercel");
    expect(Providers.CLOUDFLARE).toBe("cloudflare");
    expect(Providers.SPRITE).toBe("sprite");
    expect(Providers.MODAL).toBe("modal");
    expect(Providers.E2B).toBe("e2b");
    expect(Providers.HOPX).toBe("hopx");
    expect(Providers.RUNLOOP).toBe("runloop");
    expect(Providers.BLAXEL).toBe("blaxel");
  });

  it("has exactly 10 providers", () => {
    const values = Object.values(Providers);
    expect(values).toHaveLength(10);
  });
});

describe("DefaultResources", () => {
  it("has a resource entry for every provider", () => {
    for (const provider of Object.values(Providers)) {
      expect(DefaultResources).toHaveProperty(provider);
    }
  });

  it("each resource entry has vcpus, memory, and disk", () => {
    for (const provider of Object.values(Providers)) {
      const r = DefaultResources[provider];
      expect(typeof r.vcpus).toBe("number");
      expect(typeof r.memory).toBe("number");
      expect(typeof r.disk).toBe("number");
    }
  });

  it("cloudflare has the highest memory allocation", () => {
    const memories = Object.values(DefaultResources).map((r) => r.memory);
    expect(DefaultResources[Providers.CLOUDFLARE].memory).toBe(
      Math.max(...memories),
    );
  });

  it("sprite has the largest disk allocation", () => {
    const disks = Object.values(DefaultResources).map((r) => r.disk);
    expect(DefaultResources[Providers.SPRITE].disk).toBe(Math.max(...disks));
  });
});
