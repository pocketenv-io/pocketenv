import { createFileRoute } from "@tanstack/react-router";
import Sandbox from "../pages/sandbox";

export const Route = createFileRoute("/$did/sandbox/$rkey")({
  component: Sandbox,
});
