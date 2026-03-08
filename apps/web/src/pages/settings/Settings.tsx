import { useRouterState } from "@tanstack/react-router";
import Main from "../../layouts/Main";
import Sidebar from "./sidebar/Sidebar";
import { useSandboxQuery } from "../../hooks/useSandbox";

function Settings() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/settings", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/settings", "")}
    >
      <>
        <div className="form-control w-[95%] m-auto">
          <label className="label">
            <span className="label-text font-bold mb-1 text-[14px]">Name</span>
          </label>
          <div className="input input-bordered w-md input-lg text-[15px] font-semibold bg-transparent">
            <input
              type="text"
              className={`grow`}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          <div className="mt-8">
            <label className="label">
              <span className="label-text font-bold mb-1 text-[14px]">
                Description
              </span>
            </label>
            <textarea
              className={`textarea max-w-full h-[150px] text-[14px] font-semibold`}
              aria-label="Textarea"
            ></textarea>
          </div>
          <div className="mt-8">
            <label className="label">
              <span className="label-text font-bold mb-1 text-[14px]">
                Topics
              </span>
            </label>
            <span className="ml-1.25 opacity-50">
              List of topics separated by spaces.
            </span>
            <textarea
              className={`textarea max-w-full h-25 text-[14px] font-semibold mt-2`}
              aria-label="Textarea"
            ></textarea>
          </div>
          <div className="mt-8">
            <button className="btn btn-primary w-25">Save</button>
          </div>
        </div>
      </>
    </Main>
  );
}

export default Settings;
