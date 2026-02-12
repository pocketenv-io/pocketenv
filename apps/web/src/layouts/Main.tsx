import type React from "react";
import { useRouterState } from "@tanstack/react-router";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

type MainProps = {
  children: React.ReactNode;
};

function Main({ children }: MainProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

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
    <>
      <div className="flex min-h-screen bg-base-100">
        <Sidebar />
        <div className="flex flex-col flex-1 sm:ml-64 bg-base-100">
          <Navbar title={title} />
          <main className="flex-1 p-4 bg-base-100">{children}</main>
        </div>
      </div>
    </>
  );
}

export default Main;
