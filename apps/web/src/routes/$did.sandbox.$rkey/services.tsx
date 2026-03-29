import { createFileRoute, redirect } from "@tanstack/react-router";
import ServicesPage from "../../pages/settings/services/Services";

export const Route = createFileRoute("/$did/sandbox/$rkey/services")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: ServicesPage,
});
