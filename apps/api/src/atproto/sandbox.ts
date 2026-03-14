import type { Agent } from "@atproto/api";
import type * as Sandbox from "lexicon/types/io/pocketenv/sandbox";

export const updateSandbox = async (
  agent: Agent,
  data: {
    rkey: string;
    envs?: string[];
    volumes?: string[];
    secrets?: string[];
    name?: string;
    description?: string | null;
    topics?: string[];
    repo?: string | null;
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
      name: data.name ?? record.name,
      description: data.description ?? record.description,
      topics: data.topics ?? record.topics,
      repo: data.repo ?? record.repo,
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
