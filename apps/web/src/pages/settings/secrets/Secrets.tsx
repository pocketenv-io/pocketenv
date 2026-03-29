import ContentLoader from "react-content-loader";
import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import AddSecretModal from "../../../components/contextmenu/AddSecretModal";
import { useState } from "react";
import {
  useDeleteSecretMutation,
  useSecretsQuery,
} from "../../../hooks/useSecret";
import dayjs from "dayjs";
import Pagination from "../../../components/pagination";
import ConfirmDelete from "../../../components/confirmdelete/ConfirmDelete";

const PAGE_SIZE = 12;
const SKELETON_ROWS = 8;

const SecretRowSkeleton = ({ index }: { index: number }) => (
  <ContentLoader
    speed={1.5}
    width="100%"
    height={48}
    backgroundColor="rgba(255,255,255,0.06)"
    foregroundColor="rgba(255,255,255,0.13)"
    style={{ width: "100%" }}
    uniqueKey={`secret-row-skeleton-${index}`}
  >
    {/* Name column - wide */}
    <rect x="16" y="16" rx="6" ry="6" width="38%" height="16" />
    {/* Created At column */}
    <rect x="50%" y="16" rx="6" ry="6" width="22%" height="16" />
    {/* Action column */}
    <rect x="88%" y="12" rx="6" ry="6" width="8%" height="24" />
  </ContentLoader>
);

function Secrets() {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<string | undefined>(
    undefined,
  );
  const [selectedSecretId, setSelectedSecretId] = useState<string | undefined>(
    undefined,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { mutateAsync: deleteSecret } = useDeleteSecretMutation();
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/secrets", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const { data: secrets, isLoading } = useSecretsQuery(
    data?.sandbox?.id,
    offset,
    PAGE_SIZE,
  );

  const totalPages = secrets?.total ? Math.ceil(secrets.total / PAGE_SIZE) : 1;

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleConfirmDelete = async () => {
    await deleteSecret(selectedSecretId!);
    setSelectedSecret(undefined);
    setSelectedSecretId(undefined);
    setConfirmDeleteOpen(false);
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/secrets", "")}
    >
      <>
        <div
          className="w-[95%] m-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Secrets</h1>
            <button
              className="btn btn-primary font-semibold"
              onClick={() => setIsOpen(true)}
            >
              New Secret
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Sensitive environment variables (API keys, tokens, credentials)
            stored securely.
          </p>
          <div className="w-full overflow-x-auto">
            <table className="table mb-20">
              {!!secrets?.secrets?.length && (
                <thead>
                  <tr>
                    <th className="normal-case text-[14px]">Name</th>
                    <th className="normal-case text-[14px]">Created At</th>
                    <th className="normal-case text-[14px]"></th>
                  </tr>
                </thead>
              )}
              <tbody>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td colSpan={3} className="p-0">
                          <SecretRowSkeleton index={i} />
                        </td>
                      </tr>
                    ))
                  : secrets?.secrets?.map((secret) => (
                      <tr key={secret.id}>
                        <td className="normal-case text-[14px] font-medium">
                          {secret.name}
                        </td>
                        <td className="normal-case text-[14px] font-medium">
                          {dayjs(secret.createdAt).format(
                            "M/D/YYYY, h:mm:ss A",
                          )}
                        </td>
                        <td className="normal-case text-[14px] text-right">
                          <div className="join">
                            <button
                              className="btn btn-outline join-item w-[72.63px]"
                              onClick={() => {
                                setSelectedSecretId(secret.id);
                                setIsOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline join-item"
                              onClick={() => {
                                setSelectedSecret(secret.name);
                                setSelectedSecretId(secret.id);
                                setConfirmDeleteOpen(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="fixed bottom-3.75 left-0 right-0">
            <div className="flex justify-center items-center">
              {secrets && secrets.total > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              )}
            </div>
          </div>
        </div>
        <AddSecretModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedSecretId(undefined);
          }}
          sandboxId={data?.sandbox?.id ?? ""}
          secretId={selectedSecretId}
        />
        <ConfirmDelete
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          subject={"secret"}
          title={"secret?"}
          subjectId={selectedSecret}
        />
      </>
    </Main>
  );
}

export default Secrets;
