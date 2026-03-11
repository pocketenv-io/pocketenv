import { client } from ".";
import type { File } from "../types/file";

export const addFile = (sandboxId: string, path: string, content: string) =>
  client.post(
    "/xrpc/io.pocketenv.file.addFile",
    {
      file: {
        sandboxId,
        path,
        content,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteFile = (id: string) =>
  client.post(`/xrpc/io.pocketenv.file.deleteFile`, undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getFiles = (sandboxId?: string, offset?: number, limit?: number) =>
  client.get<{ files: File[]; total: number }>(
    `/xrpc/io.pocketenv.file.getFiles`,
    {
      params: {
        sandboxId,
        offset: offset ?? 0,
        limit: limit ?? 30,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getFile = (id: string) =>
  client.get<{ file: File }>(`/xrpc/io.pocketenv.file.getFile?id=${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
