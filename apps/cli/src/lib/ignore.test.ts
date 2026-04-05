import { describe, it, expect } from "vitest";
import ignore from "ignore";
import { makeIsIgnored, type IgnoreContext } from "./ignore.ts";

function ctx(patterns: string, dir: string = ""): IgnoreContext {
  const ig = ignore();
  ig.add(patterns);
  return { dir, ig };
}

describe("makeIsIgnored", () => {
  describe("directory pattern with trailing slash (node_modules/)", () => {
    const isIgnored = makeIsIgnored([ctx("node_modules/\n")]);

    it("ignores root-level directory", () => {
      expect(isIgnored("node_modules")).toBe(true);
    });

    it("ignores nested directory at any depth", () => {
      expect(isIgnored("apps/api/node_modules")).toBe(true);
      expect(isIgnored("a/b/c/node_modules")).toBe(true);
    });

    it("ignores files inside root-level directory", () => {
      expect(isIgnored("node_modules/express/index.js")).toBe(true);
    });

    it("ignores files inside nested directory", () => {
      expect(isIgnored("apps/api/node_modules/express/index.js")).toBe(true);
    });

    it("does not ignore unrelated files", () => {
      expect(isIgnored("src/index.ts")).toBe(false);
      expect(isIgnored("apps/api/src/index.ts")).toBe(false);
    });
  });

  describe("pattern without trailing slash (node_modules)", () => {
    const isIgnored = makeIsIgnored([ctx("node_modules\n")]);

    it("ignores root-level directory", () => {
      expect(isIgnored("node_modules")).toBe(true);
    });

    it("ignores nested directory at any depth", () => {
      expect(isIgnored("apps/api/node_modules")).toBe(true);
    });

    it("ignores files inside nested directory", () => {
      expect(isIgnored("apps/api/node_modules/express/index.js")).toBe(true);
    });
  });

  describe("root-anchored pattern (/node_modules)", () => {
    const isIgnored = makeIsIgnored([ctx("/node_modules\n")]);

    it("ignores root-level directory", () => {
      expect(isIgnored("node_modules")).toBe(true);
    });

    it("ignores files inside root-level directory", () => {
      expect(isIgnored("node_modules/express/index.js")).toBe(true);
    });

    // Known trade-off: the suffix approach checks each path suffix independently,
    // so `apps/api/node_modules` eventually checks `ig.ignores('node_modules')`
    // which matches the anchored pattern `/node_modules` (since there's no parent
    // context). Root-anchored patterns are treated as global for this copy tool,
    // which is conservative but safe — it's better to exclude too much than to
    // accidentally include node_modules in a 1GB tar.
    it("also ignores nested directory (conservative — anchoring is not preserved)", () => {
      expect(isIgnored("apps/api/node_modules")).toBe(true);
      expect(isIgnored("apps/api/node_modules/express/index.js")).toBe(true);
    });
  });

  describe("glob pattern (*.log)", () => {
    const isIgnored = makeIsIgnored([ctx("*.log\n")]);

    it("ignores matching file at root", () => {
      expect(isIgnored("error.log")).toBe(true);
    });

    it("ignores matching file in nested directory", () => {
      expect(isIgnored("apps/api/logs/error.log")).toBe(true);
    });

    it("does not ignore non-matching files", () => {
      expect(isIgnored("src/index.ts")).toBe(false);
    });
  });

  describe("real-world root .gitignore (node_modules/, .DS_Store, result)", () => {
    const isIgnored = makeIsIgnored([ctx("node_modules/\n.DS_Store\nresult\n")]);

    it("ignores node_modules at root", () => {
      expect(isIgnored("node_modules")).toBe(true);
    });

    it("ignores node_modules in monorepo packages", () => {
      expect(isIgnored("apps/api/node_modules")).toBe(true);
      expect(isIgnored("apps/web/node_modules")).toBe(true);
    });

    it("ignores files deep inside nested node_modules", () => {
      expect(
        isIgnored("apps/api/node_modules/express/lib/router/index.js"),
      ).toBe(true);
    });

    it("ignores .DS_Store at any depth", () => {
      expect(isIgnored(".DS_Store")).toBe(true);
      expect(isIgnored("apps/api/.DS_Store")).toBe(true);
    });

    it("does not ignore regular source files", () => {
      expect(isIgnored("apps/api/src/index.ts")).toBe(false);
      expect(isIgnored("apps/web/src/app/page.tsx")).toBe(false);
    });
  });

  describe("nested ignore files (multi-directory contexts)", () => {
    // Simulates: root .gitignore has node_modules/, apps/api/.gitignore has dist/
    const isIgnored = makeIsIgnored([
      ctx("node_modules/\n", ""),
      ctx("dist/\n", "apps/api"),
    ]);

    it("root pattern applies at any depth", () => {
      expect(isIgnored("node_modules")).toBe(true);
      expect(isIgnored("apps/api/node_modules")).toBe(true);
      expect(isIgnored("apps/web/node_modules")).toBe(true);
    });

    it("nested pattern applies within its directory", () => {
      expect(isIgnored("apps/api/dist")).toBe(true);
      expect(isIgnored("apps/api/dist/index.js")).toBe(true);
    });

    it("nested pattern does not apply outside its directory", () => {
      expect(isIgnored("dist")).toBe(false);
      expect(isIgnored("apps/web/dist")).toBe(false);
      expect(isIgnored("apps/web/dist/index.js")).toBe(false);
    });

    it("does not ignore regular source files", () => {
      expect(isIgnored("apps/api/src/index.ts")).toBe(false);
      expect(isIgnored("apps/web/src/index.ts")).toBe(false);
    });
  });

  describe("multiple nested ignore files", () => {
    // Simulates a monorepo where each package has its own .gitignore
    const isIgnored = makeIsIgnored([
      ctx("node_modules/\n.DS_Store\n", ""),
      ctx("dist/\nbuild/\n", "apps/api"),
      ctx("dist/\n.next/\n", "apps/web"),
    ]);

    it("apps/api dist is ignored", () => {
      expect(isIgnored("apps/api/dist/bundle.js")).toBe(true);
      expect(isIgnored("apps/api/build/output.js")).toBe(true);
    });

    it("apps/web dist and .next are ignored", () => {
      expect(isIgnored("apps/web/dist/bundle.js")).toBe(true);
      expect(isIgnored("apps/web/.next/cache")).toBe(true);
    });

    it("apps/api build pattern does not leak into apps/web", () => {
      expect(isIgnored("apps/web/build/output.js")).toBe(false);
    });

    it("apps/web .next pattern does not leak into apps/api", () => {
      expect(isIgnored("apps/api/.next/cache")).toBe(false);
    });

    it("root node_modules pattern still applies everywhere", () => {
      expect(isIgnored("node_modules")).toBe(true);
      expect(isIgnored("apps/api/node_modules")).toBe(true);
      expect(isIgnored("apps/web/node_modules")).toBe(true);
    });
  });
});
