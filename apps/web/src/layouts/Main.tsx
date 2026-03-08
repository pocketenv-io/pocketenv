import type React from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { sidebarCollapsedAtom } from "../atoms/sidebar";

type MainProps = {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  root?: string;
  rootLink?: string;
};

function Main({ children, sidebar, root, rootLink }: MainProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isCollapsed = useAtomValue(sidebarCollapsedAtom);

  const getTitle = (path: string): string => {
    if (path === "/") return "Projects";
    if (path === "/projects") return "Projects";
    if (path === "/snapshots") return "Snapshots";
    if (path === "/volumes") return "Volumes";
    if (path === "/secrets") return "Secrets";
    if (path === "/settings") return "Settings";
    if (
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/settings$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/ssh-keys$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/variables$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/volumes$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/files$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/secrets$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/integrations$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/repository$/.test(path) ||
      /^\/did:plc:[a-z0-9]+\/sandbox\/[a-z0-9]+\/tailscale$/.test(path)
    )
      return "Settings";

    return "";
  };

  const title = getTitle(pathname);

  return (
    <div className="flex min-h-screen bg-base-100">
      {sidebar ? sidebar : <Sidebar />}
      <div
        className={`flex flex-col flex-1 bg-base-100 ${
          isCollapsed ? "sm:ml-[72px]" : "sm:ml-64"
        }`}
      >
        <Navbar title={title} root={root} rootLink={rootLink} />
        <main className="flex-1 p-4 bg-base-100">{children}</main>
      </div>
    </div>
  );
}

export default Main;
