import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$did/sandbox/$rkey")({
  component: SandboxLayout,
});

function SandboxLayout() {
  return <Outlet />;
}
