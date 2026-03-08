import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function Tailscale() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/tailscale", "").replace("sandbox", "io.pocketenv.sandbox")}`,
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
          </div>
          <p className="opacity-60 mb-5">
            Connect your Sandbox to your Tailscale network for secure private
            access to services and devices.
          </p>
          <div className="input input-bordered w-xl input-lg text-[15px] font-semibold bg-transparent">
            <input
              type="text"
              className={`grow`}
              placeholder="Enter your Tailscale Token"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          <div>
            <button className="btn btn-primary font-semibold mt-8">Save</button>
          </div>
        </div>
      </>
    </Main>
  );
}

export default Tailscale;
