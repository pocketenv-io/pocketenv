import consola from "consola";
import { client } from "../client";
import { env } from "../lib/env";
import getAccessToken from "../lib/getAccessToken";
import type { Service } from "../types/service";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { c } from "../theme";
import process from "node:process";

dayjs.extend(relativeTime);

type CreateServiceOptions = {
  ports?: number[];
  description?: string;
};

export async function createService(
  sandbox: string,
  name: string,
  command: string[],
  { ports, description }: CreateServiceOptions,
) {
  const token = await getAccessToken();

  console.log(
    `Creating service ${name} in sandbox ${sandbox} with command: ${command.join(" ")}`,
  );
  console.log(`Ports: ${ports?.join(", ") || "None"}`);
  console.log(`Description: ${description || "None"}`);

  try {
  } catch (error) {
    consola.error("Failed to create service", error);
    process.exit(1);
  }
}

export async function listServices(sandboxId: string) {
  const token = await getAccessToken();

  try {
    const { data } = await client.get<{ services: Service[] }>(
      "/xrpc/io.pocketenv.service.getServices",
      {
        params: {
          sandboxId,
        },
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );

    const table = new Table({
      head: [
        c.primary("ID"),
        c.primary("NAME"),
        c.primary("COMMAND"),
        c.primary("STATUS"),
        c.primary("CREATED AT"),
      ],
      chars: {
        top: "",
        "top-mid": "",
        "top-left": "",
        "top-right": "",
        bottom: "",
        "bottom-mid": "",
        "bottom-left": "",
        "bottom-right": "",
        left: "",
        "left-mid": "",
        mid: "",
        "mid-mid": "",
        right: "",
        "right-mid": "",
        middle: " ",
      },
      style: {
        border: [],
        head: [],
      },
    });

    for (const service of data.services) {
      table.push([
        c.secondary(service.id),
        service.name,
        service.command,
        service.status === "RUNNING"
          ? c.highlight(service.status)
          : service.status,
        dayjs(service.createdAt).fromNow(),
      ]);
    }

    consola.log(table.toString());
  } catch (error) {
    consola.error("Failed to list services", error);
    process.exit(1);
  }
}

export async function restartService(id: string) {
  const token = await getAccessToken();
  try {
  } catch (error) {
    consola.error(`Failed to restart service ${id}`, error);
    process.exit(1);
  }
}

export async function startService(id: string) {
  const token = await getAccessToken();

  try {
  } catch (error) {
    consola.error(`Failed to start service ${id}`, error);
    process.exit(1);
  }
}

export async function stopService(id: string) {
  const token = await getAccessToken();

  try {
  } catch (error) {
    consola.error(`Failed to stop service ${id}`, error);
    process.exit(1);
  }
}

export async function deleteService(id: string) {
  const token = await getAccessToken();

  try {
  } catch (error) {
    consola.error(`Failed to delete service ${id}`, error);
    process.exit(1);
  }
}
