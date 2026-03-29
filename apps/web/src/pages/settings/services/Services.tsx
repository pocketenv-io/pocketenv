import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import { useServicesQuery } from "../../../hooks/useService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ContentLoader from "react-content-loader";
import { useState } from "react";
import NewServiceModal from "./NewServiceModal";
import _ from "lodash";
import DeleteServiceModal from "./DeleteServiceModal";
import type { Service } from "../../../types/service";

dayjs.extend(relativeTime);

const SKELETON_ROWS = 8;

const ServicesRowSkeleton = ({ index }: { index: number }) => (
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

function Services() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);

  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/services", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const { data: servicesData, isLoading } = useServicesQuery(
    data?.sandbox?.id || "",
  );

  const services = servicesData?.services || [];

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/services", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-1 text-xl flex-1">Services</h1>
            <button
              className="btn btn-md btn-primary font-semibold"
              onClick={() => { setEditingService(undefined); setIsNewServiceOpen(true); }}
            >
              New Service
            </button>
          </div>
          <p className="opacity-60 mb-5">
            Services are processes that run in the background of your Sandbox,
            such as databases or servers.
          </p>
          <div className="w-full overflow-x-auto">
            <table className="table mb-20">
              {!!services.length && (
                <thead>
                  <tr>
                    <th className="normal-case text-[14px]">Name</th>
                    <th className="normal-case text-[14px]">Command</th>
                    <th className="normal-case text-[14px]">Status</th>
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
                          <ServicesRowSkeleton index={i} />
                        </td>
                      </tr>
                    ))
                  : services.map((service) => (
                      <tr key={service.id}>
                        <td className="normal-case text-[14px] font-medium">
                          {service.name}
                        </td>
                        <td
                          className="normal-case text-[14px] font-medium"
                          style={{
                            fontFamily:
                              "CaskaydiaNerdFontMonoRegular, monospace",
                          }}
                        >
                          {service.command}
                        </td>
                        <td>
                          <span
                            className={`badge badge-soft ${service?.status === "RUNNING" ? "badge-success" : ""} rounded-full ${service.status === "RUNNING" ? "bg-green-400/10" : "bg-white/15 rounded"}`}
                          >
                            {_.upperFirst(_.camelCase(service.status))}
                          </span>
                        </td>
                        <td className="normal-case text-[14px] font-medium">
                          {dayjs(service.createdAt).format(
                            "M/D/YYYY, h:mm:ss A",
                          )}
                        </td>
                        <td className="normal-case text-[14px] text-right">
                          <div className="join">
                            <button
                              className="btn btn-outline join-item w-[72.63px]"
                              onClick={() => {
                                setEditingService(service);
                                setIsNewServiceOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline join-item"
                              onClick={() => {
                                setSelectedService(service.name);
                                setSelectedServiceId(service.id);
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
        </div>
      </>
      <NewServiceModal
        isOpen={isNewServiceOpen}
        onClose={() => {
          setIsNewServiceOpen(false);
          setEditingService(undefined);
        }}
        sandboxId={data?.sandbox?.id || ""}
        service={editingService}
      />
      <DeleteServiceModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        serviceId={selectedServiceId || ""}
        serviceName={selectedService || ""}
      />
    </Main>
  );
}

export default Services;
