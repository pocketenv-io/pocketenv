import { Workspace } from "../../type.ts";

export type KV = {
  workspace: {
    save: (path: string, data: Workspace) => Promise<void>;
    get: (path: string) => Promise<Workspace>;
    list: () => Promise<Workspace[]>;
  };
};

export type Context = {
  kv: KV;
};
