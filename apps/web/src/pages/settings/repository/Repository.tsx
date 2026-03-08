import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function Repository() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/repository", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/repository", "")}
    >
      {/* Your page content goes here */}
      <></>
    </Main>
  );
}

export default Repository;
