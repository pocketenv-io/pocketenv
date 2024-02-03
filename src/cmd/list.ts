import { Table, dayjs } from "../../deps.ts";
import * as workspaces from "../workspaces.ts";

async function list() {
  const results = await workspaces.list();
  const table = new Table();

  table.header(["NAME", "STATUS", "CONTAINER ID", "CREATED", "UPDATED"]);

  for (const item of results) {
    table.push([
      item.value.name,
      item.value.status,
      item.value.containerId.slice(0, 12),
      dayjs(item.value.createdAt).fromNow(),
      dayjs(item.value.updatedAt).fromNow(),
    ]);
  }

  table.render();
}

export default list;
