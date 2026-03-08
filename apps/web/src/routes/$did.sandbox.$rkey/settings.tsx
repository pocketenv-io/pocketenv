import { createFileRoute, redirect } from "@tanstack/react-router";
import SettingsPage from "../../pages/settings";

export const Route = createFileRoute("/$did/sandbox/$rkey/settings")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: SettingsPage,
});
