import { client } from ".";

export const addFile = (sandboxId: string, path: string, content: string) =>
  client.post(
    "/xrpc/io.pocketenv.file.addFile",
    {
      sandboxId,
      path,
      content,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteFile = (id: string) =>
  client.post(`/xrpc/io.pocketenv.file.deleteFile?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getFiles = () =>
  client.get("/xrpc/io.pocketenv.file.getFiles", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
