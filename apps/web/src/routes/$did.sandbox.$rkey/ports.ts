import { createFileRoute } from "@tanstack/react-router";
import PortsPage from "../../pages/settings/ports";

export const Route = createFileRoute("/$did/sandbox/$rkey/ports")({
  component: PortsPage,
});
