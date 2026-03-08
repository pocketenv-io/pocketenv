import { createFileRoute, redirect } from "@tanstack/react-router";
import VolumesPage from "../../pages/settings/volumes";

export const Route = createFileRoute("/$did/sandbox/$rkey/volumes")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: VolumesPage,
});
