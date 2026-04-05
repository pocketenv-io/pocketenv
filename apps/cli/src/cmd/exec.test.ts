import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { exec } from "./exec";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("exec", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  let mockStdoutWrite: ReturnType<typeof vi.spyOn>;
  let mockStderrWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStdoutWrite = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    mockStderrWrite = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
  });

  it("writes stdout and exits with 0 on success", async () => {
    const mockSandbox = {
      exec: vi.fn().mockResolvedValue({
        stdout: "hello world\n",
        stderr: "",
        exitCode: 0,
      }),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exec("my-sandbox", ["echo", "hello world"]);

    expect(mockSandbox.exec).toHaveBeenCalledWith("echo hello world");
    expect(mockStdoutWrite).toHaveBeenCalledWith("hello world\n");
    expect(mockStderrWrite).not.toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it("writes stderr and exits with non-zero code on failure", async () => {
    const mockSandbox = {
      exec: vi.fn().mockResolvedValue({
        stdout: "",
        stderr: "command not found",
        exitCode: 127,
      }),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exec("my-sandbox", ["badcmd"]);

    expect(mockStderrWrite).toHaveBeenCalledWith("command not found\n");
    expect(consola.error).toHaveBeenCalledWith(
      "Command exited with code 127",
    );
    expect(mockExit).toHaveBeenCalledWith(127);
  });

  it("appends newline to stdout when missing", async () => {
    const mockSandbox = {
      exec: vi.fn().mockResolvedValue({
        stdout: "output without newline",
        stderr: "",
        exitCode: 0,
      }),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exec("my-sandbox", ["cmd"]);

    expect(mockStdoutWrite).toHaveBeenCalledWith("output without newline\n");
  });

  it("logs error when execution fails", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("API error"));

    await exec("my-sandbox", ["cmd"]);

    expect(consola.error).toHaveBeenCalledWith(
      "Failed to execute command:",
      expect.any(Error),
    );
  });
});
