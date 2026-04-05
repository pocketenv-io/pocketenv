import { describe, it, expect } from "vitest";
import { expandRepo } from "./expandRepo.ts";

describe("expandRepo", () => {
  describe("github: shorthand", () => {
    it("expands to a GitHub URL", () => {
      expect(expandRepo("github:owner/repo")).toBe(
        "https://github.com/owner/repo",
      );
    });

    it("preserves the owner and repo name exactly", () => {
      expect(expandRepo("github:my-org/my-repo-123")).toBe(
        "https://github.com/my-org/my-repo-123",
      );
    });

    it("does not expand if more than one slash after github:", () => {
      expect(expandRepo("github:owner/repo/extra")).toBe(
        "github:owner/repo/extra",
      );
    });

    it("does not expand if no slash after github:", () => {
      expect(expandRepo("github:owner")).toBe("github:owner");
    });
  });

  describe("tangled: shorthand", () => {
    it("expands to a Tangled URL", () => {
      expect(expandRepo("tangled:owner/repo")).toBe(
        "https://tangled.org/owner/repo",
      );
    });
  });

  describe("gitlab: shorthand", () => {
    it("expands to a GitLab URL", () => {
      expect(expandRepo("gitlab:owner/repo")).toBe(
        "https://gitlab.com/owner/repo",
      );
    });
  });

  describe("passthrough (no shorthand)", () => {
    it("returns a full HTTPS URL unchanged", () => {
      expect(expandRepo("https://github.com/owner/repo")).toBe(
        "https://github.com/owner/repo",
      );
    });

    it("returns an SSH URL unchanged", () => {
      expect(expandRepo("git@github.com:owner/repo.git")).toBe(
        "git@github.com:owner/repo.git",
      );
    });

    it("returns an arbitrary string unchanged", () => {
      expect(expandRepo("notascheme")).toBe("notascheme");
    });
  });
});
