import type React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { sidebarCollapsedAtom } from "../atoms/sidebar";

type MainProps = {
  children: React.ReactNode;
};

function Main({ children }: MainProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const pathname = routerState.location.pathname;
  const isAuthenticated = !!localStorage.getItem("token");
  const isCollapsed = useAtomValue(sidebarCollapsedAtom);

  if (!isAuthenticated) {
    navigate({ to: "/" });
  }

  const getTitle = (path: string): string => {
    if (path === "/") return "Projects";
    if (path === "/projects") return "Projects";
    if (path === "/snapshots") return "Snapshots";
    if (path === "/volumes") return "Volumes";
    if (path === "/secrets") return "Secrets";
    if (path === "/settings") return "Settings";

    return "";
  };

  const title = getTitle(pathname);

  return (
    <div className="flex min-h-screen bg-base-100">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 bg-base-100 ${
          isCollapsed ? "sm:ml-[72px]" : "sm:ml-64"
        }`}
      >
        <Navbar title={title} />
        <main className="flex-1 p-4 bg-base-100">{children}</main>
      </div>
    </div>
  );
}

export default Main;
