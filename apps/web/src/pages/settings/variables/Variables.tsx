import ContentLoader from "react-content-loader";
import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import AddVariableModal from "../../../components/contextmenu/AddVariableModal";
import { useState } from "react";
import { useVariablesQuery } from "../../../hooks/useVariable";
import dayjs from "dayjs";
import Pagination from "../../../components/pagination";

const PAGE_SIZE = 10;
const SKELETON_ROWS = 8;

const VariableRowSkeleton = ({ index }: { index: number }) => (
  <ContentLoader
    speed={1.5}
    width="100%"
    height={48}
    backgroundColor="rgba(255,255,255,0.06)"
    foregroundColor="rgba(255,255,255,0.13)"
    style={{ width: "100%" }}
    uniqueKey={`variable-row-skeleton-${index}`}
  >
    {/* Name column */}
    <rect x="16" y="16" rx="6" ry="6" width="20%" height="16" />
    {/* Value column */}
    <rect x="28%" y="16" rx="6" ry="6" width="24%" height="16" />
    {/* Created At column */}
    <rect x="58%" y="16" rx="6" ry="6" width="22%" height="16" />
    {/* Action column */}
    <rect x="88%" y="12" rx="6" ry="6" width="8%" height="24" />
  </ContentLoader>
);

function Variables() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/variables", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const { data: variables, isLoading } = useVariablesQuery(
    data?.sandbox?.id,
    offset,
    PAGE_SIZE,
  );

  const totalPages = variables?.total
    ? Math.ceil(variables.total / PAGE_SIZE)
    : 1;

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/variables", "")}
    >
      <>
        <div
          className="w-[95%] m-auto relative"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Variables</h1>
            <button
              className="btn btn-primary font-semibold"
              onClick={() => setIsOpen(true)}
            >
              New Variable
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Environment variables available to your sandbox during execution.
          </p>
          <div className="w-full overflow-x-auto">
            <table className="table mb-20">
              <thead>
                <tr>
                  <th className="normal-case text-[14px]">Name</th>
                  <th className="normal-case text-[14px]">Value</th>
                  <th className="normal-case text-[14px]">Created At</th>
                  <th className="normal-case text-[14px]"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td colSpan={4} className="p-0">
                          <VariableRowSkeleton index={i} />
                        </td>
                      </tr>
                    ))
                  : variables?.variables?.map((variable) => (
                      <tr key={variable.id}>
                        <td className="normal-case text-[14px] font-medium">
                          {variable.name}
                        </td>
                        <td className="normal-case text-[14px] font-medium">
                          {variable.value}
                        </td>
                        <td className="normal-case text-[14px] font-medium">
                          {dayjs(variable.createdAt).format(
                            "M/D/YYYY, h:mm:ss A",
                          )}
                        </td>
                        <td className="normal-case text-[14px] font-medium"></td>
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
        <AddVariableModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          sandboxId={data?.sandbox?.id ?? ""}
        />
      </>
    </Main>
  );
}

export default Variables;
