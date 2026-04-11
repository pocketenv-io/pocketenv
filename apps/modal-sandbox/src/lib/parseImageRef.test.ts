import { describe, it, expect } from "vitest";
import parseImageRef from "./parseImageRef";

describe("parseImageRef", () => {
  it("parses a full ref with registry, namespace, name, and tag", () => {
    expect(parseImageRef("ghcr.io/pocketenv-io/modal-openclaw:0.1.0")).toEqual({
      registry: "ghcr.io",
      name: "pocketenv-io/modal-openclaw",
      tag: "0.1.0",
    });
  });

  it("parses a ref with registry and no namespace", () => {
    expect(parseImageRef("docker.io/ubuntu:22.04")).toEqual({
      registry: "docker.io",
      name: "ubuntu",
      tag: "22.04",
    });
  });

  it("parses a plain name with tag and no registry", () => {
    expect(parseImageRef("ubuntu:22.04")).toEqual({
      registry: "",
      name: "ubuntu",
      tag: "22.04",
    });
  });

  it("defaults tag to latest when no tag is provided", () => {
    expect(parseImageRef("ubuntu")).toEqual({
      registry: "",
      name: "ubuntu",
      tag: "latest",
    });
  });

  it("defaults tag to latest for a registry ref with no tag", () => {
    expect(parseImageRef("ghcr.io/pocketenv-io/modal-openclaw")).toEqual({
      registry: "ghcr.io",
      name: "pocketenv-io/modal-openclaw",
      tag: "latest",
    });
  });

  it("handles registry with port", () => {
    expect(parseImageRef("localhost:5000/myimage:latest")).toEqual({
      registry: "localhost:5000",
      name: "myimage",
      tag: "latest",
    });
  });

  it("parses a namespaced image with no registry", () => {
    expect(parseImageRef("myorg/myimage:1.0")).toEqual({
      registry: "",
      name: "myorg/myimage",
      tag: "1.0",
    });
  });
});
