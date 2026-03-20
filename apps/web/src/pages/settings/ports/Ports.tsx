import ContentLoader from "react-content-loader";
import { useRouterState } from "@tanstack/react-router";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import {
  useExposedPortsQuery,
  useSandboxQuery,
  useUnexposePortMutation,
} from "../../../hooks/useSandbox";
import ExposePortModal from "../../../components/contextmenu/ExposePortModal";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const SKELETON_ROWS = 4;

const PortRowSkeleton = ({ index }: { index: number }) => (
  <ContentLoader
    speed={1.5}
    width="100%"
    height={48}
    backgroundColor="rgba(255,255,255,0.06)"
    foregroundColor="rgba(255,255,255,0.13)"
    style={{ width: "100%" }}
    uniqueKey={`port-row-skeleton-${index}`}
  >
    {/* Port column */}
    <rect x="16" y="16" rx="6" ry="6" width="8%" height="16" />
    {/* Preview URL column */}
    <rect x="18%" y="16" rx="6" ry="6" width="32%" height="16" />
    {/* Description column */}
    <rect x="55%" y="16" rx="6" ry="6" width="22%" height="16" />
    {/* Action column */}
    <rect x="88%" y="12" rx="6" ry="6" width="8%" height="24" />
  </ContentLoader>
);

function Ports() {
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/ports", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const [isExposePortModalOpen, setIsExposePortModalOpen] = useState(false);
  const [unexposingPort, setUnexposingPort] = useState<number | null>(null);
  const { data: exposedPorts, isLoading } = useExposedPortsQuery(
    data?.sandbox?.id ?? "",
  );
  const { mutateAsync: unexposePort } = useUnexposePortMutation();

  const handleUnexpose = async (port: number) => {
    setUnexposingPort(port);
    await unexposePort({ id: data?.sandbox?.id ?? "", port });
    queryClient.invalidateQueries({ queryKey: ["exposedPorts"] });
    setUnexposingPort(null);
  };

  return (
    <>
      <Main
        sidebar={<Sidebar />}
        root={data?.sandbox?.name}
        rootLink={pathname.replace("/ports", "")}
      >
        <>
          <div className="w-[95%] m-auto">
            <div className="flex flex-row items-center">
              <h1 className="mb-1 text-xl flex-1">Ports</h1>
              <button
                className="btn btn-md btn-primary font-semibold"
                onClick={() => setIsExposePortModalOpen(true)}
              >
                Expose Port
              </button>
            </div>
            <p className="opacity-60 mb-5">
              Expose sandbox ports to make internal HTTP services accessible
              from outside the sandbox.
            </p>
            <div className="w-full overflow-x-auto">
              <table className="table mb-20">
                {!!exposedPorts?.ports?.length && (
                  <thead>
                    <tr>
                      <th className="normal-case text-[14px]">Port</th>
                      <th className="normal-case text-[14px]">Preview URL</th>
                      <th className="normal-case text-[14px]">Description</th>
                      <th className="normal-case text-[14px]"></th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {isLoading
                    ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          <td colSpan={4} className="p-0">
                            <PortRowSkeleton index={i} />
                          </td>
                        </tr>
                      ))
                    : exposedPorts?.ports?.map((p) => (
                        <tr key={p.port}>
                          <td className="normal-case text-[14px] font-medium">
                            {p.port}
                          </td>
                          <td className="normal-case text-[14px] font-medium">
                            {p.previewUrl ? (
                              <a
                                href={p.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                              >
                                {p.previewUrl}
                              </a>
                            ) : (
                              <span className="opacity-40">—</span>
                            )}
                          </td>
                          <td className="normal-case text-[14px] font-medium">
                            {p.description ?? (
                              <span className="opacity-40">—</span>
                            )}
                          </td>
                          <td className="normal-case text-[14px] text-right">
                            <button
                              className="btn btn-outline"
                              onClick={() => handleUnexpose(p.port)}
                              disabled={unexposingPort === p.port}
                            >
                              {unexposingPort === p.port && (
                                <span className="loading loading-spinner loading-xs" />
                              )}
                              Unexpose
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <ExposePortModal
            isOpen={isExposePortModalOpen}
            onClose={() => setIsExposePortModalOpen(false)}
            sandboxId={data?.sandbox?.id ?? ""}
          />
        </>
      </Main>
    </>
  );
}

export default Ports;
