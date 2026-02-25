import { client } from ".";

export const addSecret = (sandboxId: string, name: string, value: string) =>
  client.post(
    "/xrpc/io.pocketenv.secret.addSecret",
    {
      sandboxId,
      name,
      value,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteSecret = (id: string) =>
  client.post(`/xrpc/io.pocketenv.secret.deleteSecret?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getSecrets = () =>
  client.get("/xrpc/io.pocketenv.secret.getSecrets", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
