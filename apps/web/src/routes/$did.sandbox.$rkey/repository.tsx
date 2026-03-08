import { createFileRoute, redirect } from "@tanstack/react-router";
import RepositoryPage from "../../pages/settings/repository";

export const Route = createFileRoute("/$did/sandbox/$rkey/repository")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RepositoryPage,
});
