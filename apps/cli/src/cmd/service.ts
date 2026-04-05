import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { c } from "../theme";
import process from "node:process";
import { configureSdk } from "../lib/sdk";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { env } from "../lib/env";

dayjs.extend(relativeTime);

type CreateServiceOptions = {
  ports?: string[];
  description?: string;
};

export async function createService(
  sandboxId: string,
  name: string,
  command: string[],
  { ports, description }: CreateServiceOptions,
) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxId);
    await sandbox.service.add(name, command.join(" "), {
      description,
      ports: ports?.map((port) => parseInt(port)),
    });

    consola.success(`Service ${c.highlight(name)} created successfully`);
  } catch (error) {
    consola.error("Failed to create service", error);
    process.exit(1);
  }
}

export async function listServices(sandboxId: string) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxId);
    const { services } = await sandbox.service.list();

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

    for (const service of services) {
      table.push([
        c.secondary(service.id),
        service.name,
        service.command,
        service.status === "RUNNING"
          ? c.highlight(service.status)
          : service.status ?? "",
        dayjs(service.createdAt).fromNow(),
      ]);
    }

    consola.log(table.toString());
  } catch (error) {
    consola.error("Failed to list services", error);
    process.exit(1);
  }
}

export async function restartService(serviceId: string) {
  const token = await getAccessToken();
  try {
    await client.post("/xrpc/io.pocketenv.service.restartService", undefined, {
      params: { serviceId },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
  } catch (error) {
    consola.error(`Failed to restart service ${serviceId}`, error);
    process.exit(1);
  }
}

export async function startService(serviceId: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.service.startService", undefined, {
      params: { serviceId },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
  } catch (error) {
    consola.error(`Failed to start service ${serviceId}`, error);
    process.exit(1);
  }
}

export async function stopService(serviceId: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.service.stopService", undefined, {
      params: { serviceId },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
  } catch (error) {
    consola.error(`Failed to stop service ${serviceId}`, error);
    process.exit(1);
  }
}

export async function deleteService(serviceId: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.service.deleteService", undefined, {
      params: { serviceId },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
    consola.success(`Service ${c.highlight(serviceId)} deleted successfully`);
  } catch (error) {
    consola.error(`Failed to delete service ${serviceId}`, error);
    process.exit(1);
  }
}
