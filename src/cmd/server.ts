import { createYoga } from "../../deps.ts";
import { schema } from "../server/graphql/schema.ts";

function server({ port }: { port?: number }) {
  const yoga = createYoga({
    schema,
  });

  console.log(`Server started on http://localhost:${port || 4090} 🚀`);

  Deno.serve({ port: port || 4090 }, yoga);
}

export default server;
