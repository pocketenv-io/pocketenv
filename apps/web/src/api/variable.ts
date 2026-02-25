import { client } from ".";

export const addVariable = (sandboxId: string, name: string, value: string) =>
  client.post(
    "/xrpc/io.pocketenv.variable.addVariable",
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

export const deleteVariable = (id: string) =>
  client.post(
    `/xrpc/io.pocketenv.variable.deleteVariable?id=${id}`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getVariables = () =>
  client.get("/xrpc/io.pocketenv.variable.getVariables", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
