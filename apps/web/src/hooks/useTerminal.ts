import { useQuery } from "@tanstack/react-query";
import { getTerminalToken } from "../api/terminal";

export const useTerminalTokenQuery = () =>
  useQuery({
    queryKey: ["terminalToken"],
    queryFn: () => getTerminalToken(),
    select: (response) => response.data,
  });
