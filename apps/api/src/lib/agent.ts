import { Agent, AtpAgent } from "@atproto/api";
import type { NodeOAuthClient } from "@atproto/oauth-client-node";
import { consola } from "consola";
import extractPdsFromDid from "./extractPdsFromDid";
import { ctx } from "context";

export async function createAgent(
  oauthClient: NodeOAuthClient,
  did: string,
): Promise<Agent | null> {
  let agent: Agent | null = null;
  let retry = 0;
  do {
    try {
      const result = await ctx.sqliteDb
        .selectFrom("auth_session")
        .selectAll()
        .where("key", "=", `atp:${did}`)
        .executeTakeFirst();
      if (result) {
        let pds = await ctx.redis.get(`pds:${did}`);
        if (!pds) {
          pds = await extractPdsFromDid(did);
          await ctx.redis.setEx(`pds:${did}`, 60 * 15, pds);
        }
        const atpAgent = new AtpAgent({
          service: new URL(pds),
        });

        try {
          await atpAgent.resumeSession(JSON.parse(result.session));
        } catch (e) {
          consola.info("Error resuming session");
          consola.info(did);
          consola.info(e);
          await ctx.sqliteDb
            .deleteFrom("auth_session")
            .where("key", "=", `atp:${did}`)
            .execute();
        }

        return atpAgent;
      }
      const oauthSession = await oauthClient.restore(did);
      agent = oauthSession ? new Agent(oauthSession) : null;
      if (agent === null) {
        await new Promise((r) => setTimeout(r, 1000));
        retry += 1;
      }
    } catch (e) {
      consola.info("Error creating agent");
      consola.info(did);
      consola.info(e);
      await new Promise((r) => setTimeout(r, 1000));
      retry += 1;
    }
  } while (agent === null && retry < 5);

  return agent;
}
