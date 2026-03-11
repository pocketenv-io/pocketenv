import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getTailscaleAuthKey,
  saveTailscaleAuthKey,
} from "../api/tailscale-auth-key";

export const useTailscaleAuthKeyQuery = (sandboxId: string) =>
  useQuery({
    queryKey: ["tailscale-auth-key", sandboxId],
    queryFn: () => getTailscaleAuthKey(sandboxId),
    enabled: !!sandboxId,
  });

export const useSaveTailscaleAuthKeyMutation = () =>
  useMutation({
    mutationFn: (variables: {
      sandboxId: string;
      authKey: string;
      redacted: string;
    }) =>
      saveTailscaleAuthKey(
        variables.sandboxId,
        variables.authKey,
        variables.redacted,
      ),
  });
