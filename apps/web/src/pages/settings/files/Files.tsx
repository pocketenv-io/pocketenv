import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import AddFileModal from "../../../components/contextmenu/AddFileModal";
import { useState } from "react";
import { useFilesQuery } from "../../../hooks/useFile";
import dayjs from "dayjs";
import Pagination from "../../../components/pagination";

const PAGE_SIZE = 12;

function Files() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/files", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const { data: files } = useFilesQuery(data?.sandbox?.id, offset, PAGE_SIZE);

  const totalPages = files?.total ? Math.ceil(files.total / PAGE_SIZE) : 1;

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/files", "")}
    >
      <>
        <div
          className="w-[95%] m-auto relative"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Files</h1>
            <button
              className="btn btn-primary font-semibold"
              onClick={() => setIsOpen(true)}
            >
              New File
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Files (encrypted) that are automatically injected into the sandbox
            filesystem.
          </p>
          <div className="w-full overflow-x-auto">
            <table className="table mb-20">
              <thead>
                <tr>
                  <th className="normal-case text-[14px]">Path</th>
                  <th className="normal-case text-[14px]">Created At</th>
                  <th className="normal-case text-[14px]"></th>
                </tr>
              </thead>
              <tbody>
                {files?.files?.map((file) => (
                  <tr key={file.id}>
                    <td className="normal-case text-[14px] font-medium">
                      {file.path}
                    </td>
                    <td className="normal-case text-[14px] font-medium">
                      {dayjs(file.createdAt).format("M/D/YYYY, h:mm:ss A")}
                    </td>
                    <td className="normal-case text-[14px]"></td>
                  </tr>
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
        <AddFileModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          sandboxId={data?.sandbox?.id ?? ""}
        />
      </>
    </Main>
  );
}

export default Files;
