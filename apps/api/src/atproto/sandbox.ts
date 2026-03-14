import type { Agent } from "@atproto/api";
import type * as Sandbox from "lexicon/types/io/pocketenv/sandbox";

export const updateSandbox = async (
  agent: Agent,
  data: {
    rkey: string;
    envs?: string[];
    volumes?: string[];
    secrets?: string[];
  },
) => {
  const res = await agent.com.atproto.repo.getRecord({
    repo: agent.assertDid,
    collection: "io.pocketenv.sandbox",
    rkey: data.rkey,
  });

  if (res.success) {
    const record = res.data.value as Sandbox.Record;
    const updatedRecord = {
      ...record,
      envs: data.envs ?? record.envs,
      volumes: data.volumes ?? record.volumes,
      secrets: data.secrets ?? record.secrets,
    };
    await agent.com.atproto.repo.putRecord({
      repo: agent.assertDid,
      collection: "io.pocketenv.sandbox",
      rkey: data.rkey,
      swapRecord: res.data.cid,
      record: updatedRecord,
    });
  }
};
