import { client } from ".";
import type { SshKeys } from "../types/sshkeys";

export const saveSshKeys = (
  sandboxId: string,
  privateKey: string,
  publicKey: string,
  redacted: string,
) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.putSshKeys",
    {
      id: sandboxId,
      privateKey,
      publicKey,
      redacted,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getSshKeys = (sandboxId: string) =>
  client.get<SshKeys>("/xrpc/io.pocketenv.sandbox.getSshKeys", {
    params: {
      id: sandboxId,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
