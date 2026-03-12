import { client } from ".";
import type { Variable } from "../types/variable";

export const addVariable = (sandboxId: string, name: string, value: string) =>
  client.post(
    "/xrpc/io.pocketenv.variable.addVariable",
    {
      variable: {
        sandboxId,
        name,
        value,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteVariable = (id: string) =>
  client.post(`/xrpc/io.pocketenv.variable.deleteVariable`, undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getVariables = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  client.get<{ variables: Variable[]; total: number }>(
    `/xrpc/io.pocketenv.variable.getVariables`,
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

export const getVariable = (id: string) =>
  client.get<{ variable: Variable }>(
    `/xrpc/io.pocketenv.variable.getVariable`,
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const updateVariable = (id: string, name: string, value: string) =>
  client.post(
    "/xrpc/io.pocketenv.variable.updateVariable",
    {
      id,
      variable: {
        name,
        value,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
