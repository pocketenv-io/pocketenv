import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "../pages/home";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
