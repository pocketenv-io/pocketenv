import { createFileRoute } from "@tanstack/react-router";
import VolumesPage from "../pages/volumes";

export const Route = createFileRoute("/volumes")({
  component: VolumesPage,
});
