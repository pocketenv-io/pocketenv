import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function Integrations() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/integrations", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/integrations", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-1 text-xl flex-1">Integrations</h1>
            <button className="btn btn-md btn-primary font-semibold">
              New Webhook
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Integrations are third-party services that you can connect to your
            sandbox by adding a webhook.
          </p>
          <table className="table mb-20">
            <thead>
              <tr>
                <th className="normal-case text-[14px]">Name</th>
                <th className="normal-case text-[14px]"></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </>
    </Main>
  );
}

export default Integrations;
