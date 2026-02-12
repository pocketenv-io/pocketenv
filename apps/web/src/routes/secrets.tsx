import { createFileRoute } from "@tanstack/react-router";
import SecretsPage from "../pages/secrets";

export const Route = createFileRoute("/secrets")({
  component: SecretsPage,
});
