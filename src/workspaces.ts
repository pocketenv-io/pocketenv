import { POCKETENV_KV_PREFIX } from "./consts.ts";
import { Workspace } from "./type.ts";
import { _ } from "../deps.ts";

const kv = await Deno.openKv();

export async function save(path: string, data: Workspace) {
  await kv.set([POCKETENV_KV_PREFIX, "workspaces", path], data);
  await kv.set([POCKETENV_KV_PREFIX, "workspaces", data.name], data);
}

export async function get(path: string) {
  const { value } = await kv.get<Workspace>([
    POCKETENV_KV_PREFIX,
    "workspaces",
    path,
  ]);
  return value;
}

export async function list() {
  const iter = kv.list<Workspace>({
    prefix: [POCKETENV_KV_PREFIX, "workspaces"],
  });
  const workspaces = [];
  for await (const res of iter) workspaces.push(res);
  return _.uniqBy(workspaces, (x: Deno.KvEntry<Workspace>) => x.value.path);
}
