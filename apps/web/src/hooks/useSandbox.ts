import { useQuery } from "@tanstack/react-query";
import { getSandboxes } from "../api/sandbox";

export const useSandboxesQuery = (offset?: number, limit?: number) =>
  useQuery({
    queryKey: ["sandboxes", offset, limit],
    queryFn: () => getSandboxes(offset, limit),
    select: (response) => response.data,
  });
