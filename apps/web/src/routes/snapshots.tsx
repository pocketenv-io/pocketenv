import { createFileRoute } from "@tanstack/react-router";
import SnapshotsPage from "../pages/snapshots";

export const Route = createFileRoute("/snapshots")({
  component: SnapshotsPage,
});
