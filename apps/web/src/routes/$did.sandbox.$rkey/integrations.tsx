import { createFileRoute, redirect } from "@tanstack/react-router";
import IntegrationsPage from "../../pages/settings/integrations";

export const Route = createFileRoute("/$did/sandbox/$rkey/integrations")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: IntegrationsPage,
});
