import { useMutation, useQuery } from "@tanstack/react-query";
import {
  claimSandbox,
  createSandbox,
  getSandbox,
  getSandboxes,
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
