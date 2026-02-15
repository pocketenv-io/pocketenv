import { createFileRoute } from "@tanstack/react-router";
import Sandbox from "../../pages/sandbox";

export const Route = createFileRoute("/sandbox/$id")({
  component: Sandbox,
});
