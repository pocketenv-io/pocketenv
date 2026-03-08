import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function Tailscale() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/ssh-keys", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/tailscale", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Tailscale</h1>
            <button className="btn btn-primary font-semibold">Add Token</button>
          </div>
          <p className="opacity-60 mb-5">
            Connect your Sandbox to your Tailscale network for secure private
            access to services and devices.
          </p>
        </div>
      </>
    </Main>
  );
}

export default Tailscale;
