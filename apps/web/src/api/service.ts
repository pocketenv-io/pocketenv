import { client } from ".";
import type { Service } from "../types/service";

export const addService = (
  sandboxId: string,
  {
    name,
    command,
    ports,
    description,
  }: {
    name: string;
    command: string;
    ports?: number[];
    description?: string;
  },
) =>
  client.post(
    `/xrpc/io.pocketenv.service.addService`,
    {
      service: {
        name,
        command,
        ports,
        description,
      },
    },
    {
      params: {
        sandboxId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteService = (serviceId: string) =>
  client.post(`/xrpc/io.pocketenv.service.deleteService`, undefined, {
    params: {
      serviceId,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getServices = (sandboxId: string) =>
  client.get<{ services: Service[] }>(
    `/xrpc/io.pocketenv.service.getServices`,
    {
      params: {
        sandboxId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const startService = (serviceId: string) =>
  client.post(`/xrpc/io.pocketenv.service.startService`, undefined, {
    params: {
      serviceId,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const stopService = (serviceId: string) =>
  client.post(`/xrpc/io.pocketenv.service.stopService`, undefined, {
    params: {
      serviceId,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateService = (
  serviceId: string,
  {
    name,
    command,
    ports,
    description,
  }: {
    name: string;
    command: string;
    ports?: number[];
    description?: string;
  },
) =>
  client.post(
    `/xrpc/io.pocketenv.service.updateService`,
    {
      service: {
        name,
        command,
        ports,
        description,
      },
    },
    {
      params: {
        serviceId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const restartService = (serviceId: string) =>
  client.post(`/xrpc/io.pocketenv.service.restartService`, undefined, {
    params: {
      serviceId,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
