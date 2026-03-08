import { createFileRoute, redirect } from "@tanstack/react-router";
import SecretsPage from "../../pages/settings/secrets";

export const Route = createFileRoute("/$did/sandbox/$rkey/secrets")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: SecretsPage,
});
