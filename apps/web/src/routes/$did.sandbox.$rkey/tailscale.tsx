import { createFileRoute } from "@tanstack/react-router";
import TailscalePage from "../../pages/settings/tailscale";

export const Route = createFileRoute("/$did/sandbox/$rkey/tailscale")({
  component: TailscalePage,
});
