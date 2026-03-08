import { createFileRoute, redirect } from "@tanstack/react-router";
import FilesPage from "../../pages/settings/files";

export const Route = createFileRoute("/$did/sandbox/$rkey/files")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: FilesPage,
});
