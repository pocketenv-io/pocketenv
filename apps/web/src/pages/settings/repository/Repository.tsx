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
  const index = Math.floor(Math.random() * 7);

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/repository", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <h1 className="text-lg">Git Repository</h1>
          <p className="opacity-60 mt-1">
            Bring your project's Git repository into your Sandbox.
          </p>
          <div className="input input-bordered w-xl input-lg text-[15px] font-semibold bg-transparent mt-5">
            <input
              type="text"
              className={`grow`}
              placeholder={`e.g. ${
                [
                  "https://tangled.org/tranquil.farm/tranquil-pds",
                  "https://tangled.org/rocksky.app/rocksky",
                  "https://tangled.org/pocketenv.io/pocketenv",
                  "https://tangled.org/zat.dev/zat",
                  "https://tangled.org/pds.ls/pdsls",
                  "https://tangled.org/teal.fm/piper",
                  "https://tangled.org/tangled.org/core",
                ][index]
              }`}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          <div className="mt-8">
            <button className="btn btn-primary w-25 font-semibold">Save</button>
          </div>
        </div>
      </>
    </Main>
  );
}

export default Repository;
