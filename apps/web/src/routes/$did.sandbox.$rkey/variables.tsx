import { createFileRoute, redirect } from "@tanstack/react-router";
import VariablesPage from "../../pages/settings/variables";

export const Route = createFileRoute("/$did/sandbox/$rkey/variables")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: VariablesPage,
});
