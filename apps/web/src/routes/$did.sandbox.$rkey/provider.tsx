import { createFileRoute, redirect } from "@tanstack/react-router";
import ProviderPage from "../../pages/settings/provider";

export const Route = createFileRoute("/$did/sandbox/$rkey/provider")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: ProviderPage,
});
