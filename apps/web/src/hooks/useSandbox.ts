import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimSandbox,
  createSandbox,
  deleteSandbox,
  getActorSandboxes,
  getSandbox,
  getSandboxes,
  startSandbox,
  stopSandbox,
  getExposedPorts,
  exposePort,
  unexposePort,
  exposeVscode,
} from "../api/sandbox";
import type { Provider } from "../types/providers";

export const useActorSandboxesQuery = (
  did: string,
  offset?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["actorSandboxes", did, offset, limit],
    queryFn: () => getActorSandboxes(did, offset, limit),
    select: (response) => response.data,
    enabled: !!did,
  });

export const useSandboxesQuery = (offset?: number, limit?: number) =>
  useQuery({
    queryKey: ["sandboxes", offset, limit],
    queryFn: () => getSandboxes(offset, limit),
    select: (response) => response.data,
  });

export const useSandboxQuery = (id: string) =>
  useQuery({
    queryKey: ["sandbox", id],
    queryFn: () => getSandbox(id),
    select: (response) => response.data,
  });

export const useCreateSandboxMutation = () =>
  useMutation({
    mutationKey: ["createSandbox"],
    mutationFn: async (params: {
      base: string;
      provider: Provider;
      challenge: string | null;
      repo?: string;
    }) => createSandbox(params),
  });

export const useClaimSandboxMutation = () =>
  useMutation({
    mutationKey: ["claimSandbox"],
    mutationFn: async (id: string) =>
      claimSandbox({
        id,
      }),
  });

export const useStopSandboxMutation = () =>
  useMutation({
    mutationKey: ["stopSandbox"],
    mutationFn: async (id: string) => stopSandbox(id),
  });

export const useDeleteSandboxMutation = () =>
  useMutation({
    mutationKey: ["deleteSandbox"],
    mutationFn: async (id: string) => deleteSandbox(id),
  });

export const useStartSandboxMutation = () =>
  useMutation({
    mutationKey: ["startSandbox"],
    mutationFn: async (id: string) => startSandbox(id),
  });

export const useExposedPortsQuery = (id: string) =>
  useQuery({
    queryKey: ["exposedPorts", id],
    queryFn: () => getExposedPorts(id),
    select: (response) => response.data,
    enabled: !!id,
  });

export const useExposePortMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["exposePort"],
    mutationFn: async (params: {
      id: string;
      port: number;
      description?: string;
    }) =>
      exposePort(params.id, {
        port: params.port,
        description: params.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exposedPorts"] });
    },
  });
};

export const useUnexposePortMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["unexposePort"],
    mutationFn: async (params: { id: string; port: number }) =>
      unexposePort(params.id, params.port),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exposedPorts"] });
    },
  });
};

export const useExposeVscodeMutation = () => {
  return useMutation({
    mutationKey: ["exposeVscode"],
    mutationFn: async (id: string) => exposeVscode(id),
  });
};
