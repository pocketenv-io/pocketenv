import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

function Secrets() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/secrets", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/secrets", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Secrets</h1>
            <button className="btn btn-primary font-semibold">
              New Secret
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Sensitive environment variables (API keys, tokens, credentials)
            stored securely.
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

export default Secrets;
