import { useAtomValue } from "jotai";
import { profileAtom } from "../../atoms/profile";
import { useActorSandboxesQuery } from "../../hooks/useSandbox";
import Main from "../../layouts/Main";
import _ from "lodash";
import Project from "./Project";

function Projects() {
  const profile = useAtomValue(profileAtom);
  const { data, isLoading } = useActorSandboxesQuery(profile?.did || "");
  return (
    <Main>
      <div>
        <div className="w-full overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="normal-case text-[14px]">Name</th>
                <th className="normal-case text-[14px]">State</th>
                <th className="normal-case text-[14px]">Resources</th>
                <th className="normal-case text-[14px]">Created At</th>
                <th className="normal-case text-[14px]"></th>{" "}
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.sandboxes?.map((sandbox) => (
                  <Project sandbox={sandbox} key={sandbox.id} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Main>
  );
}

export default Projects;
