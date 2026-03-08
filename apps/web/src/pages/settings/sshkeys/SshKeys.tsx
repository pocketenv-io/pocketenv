import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function SshKeys() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/ssh-keys", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/ssh-keys", "")}
    >
      {/* Your page content goes here */}
      <></>
    </Main>
  );
}

export default SshKeys;
