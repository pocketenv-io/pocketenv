import { useAtomValue } from "jotai";
import { useState } from "react";
import { profileAtom } from "../../atoms/profile";
import { useActorSandboxesQuery } from "../../hooks/useSandbox";
import Main from "../../layouts/Main";
import Project from "./Project";
import Pagination from "../../components/pagination";

function Projects() {
  const profile = useAtomValue(profileAtom);
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const { data, isLoading } = useActorSandboxesQuery(
    profile?.did || "",
    offset,
    PAGE_SIZE,
  );
  const totalPages = data?.total ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <Main>
      <div className="relative">
        <div
          className="w-full overflow-x-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <table className="table mb-20">
            <thead>
              <tr>
                <th className="normal-case text-[14px]">Name</th>
                <th className="normal-case text-[14px]">Base</th>
                <th className="normal-case text-[14px]">State</th>
                <th className="normal-case text-[14px]">Resources</th>
                <th className="normal-case text-[14px]">Created At</th>
                <th className="normal-case text-[14px]"></th>
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
        <div className="absolute bottom-3.75 w-full">
          <div className="flex justify-center align-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </Main>
  );
}

export default Projects;
