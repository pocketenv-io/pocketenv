import { useMutation, useQuery } from "@tanstack/react-query";
import {
  claimSandbox,
  createSandbox,
  deleteSandbox,
  getSandbox,
  getSandboxes,
  startSandbox,
  stopSandbox,
} from "../api/sandbox";

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
    mutationFn: async (base: string) =>
      createSandbox({
        base,
      }),
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
