import { useState } from "react";
import Navbar from "../../components/navbar";
import SignIn from "../../components/signin/Signin";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useSandboxQuery } from "../../hooks/useSandbox";
import { consola } from "consola";

function New() {
  const isAuthenticated = !!localStorage.getItem("token");
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSandboxIdFromPath = () => {
    const path = location.pathname;

    const didMatch = path.match(/\/(did:[^/]+)\/sandbox\/([^/]+)/);
    if (didMatch) {
      const did = didMatch[1];
      const rkey = didMatch[2];
      return `at://${did}/io.pocketenv.sandbox/${rkey}`;
    }

    const idMatch = path.match(/\/sandbox\/([^/]+)/);
    if (idMatch) {
      return idMatch[1];
    }

    return "";
  };

  const { data, isLoading } = useSandboxQuery(getSandboxIdFromPath());

  consola.info("Sandbox data:", data, isLoading);

  const onClaim = () => {
    if (isAuthenticated) {
      navigate({
        to: "/did:plc:pyzvvyrh6eudle55nhqe62tv/sandbox/3mezx5ymmjs26",
      });
      return;
    }
    setSignInModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar withLogo title="" project={data?.sandbox?.name} />
        {data?.sandbox && !isLoading && (
          <>
            {location.pathname.startsWith("/sandbox") && (
              <div
                className="alert alert-soft alert-warning flex items-center bg-warning/10 border-none"
                role="alert"
              >
                <div className="flex-1">
                  This is a temporary project (what's this?) and will be deleted
                  in 24 hours. Claim it to make it yours.
                </div>

                <button
                  onClick={onClaim}
                  className="btn btn-md btn-primary font-semibold ml-4"
                >
                  Claim Project
                </button>
              </div>
            )}
            <div className="p-10">
              <div className="mt-[50px] flex space-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-xl mr-3 mt-[-5px]">
                      {data?.sandbox?.id}
                    </div>
                    <span className="badge bg-white/15 rounded-full text-white/80 border-none">
                      Sandbox
                    </span>
                  </div>

                  <div className="w-[50%] overflow-x-auto mt-5 ml-[-18px]">
                    <table className="table-borderless table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Started</th>
                          <th>Timeout</th>
                          <th>Resources</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span className="badge badge-soft badge-success rounded-full bg-green-400/10">
                              Running
                            </span>
                          </td>
                          <td>1 minute ago</td>
                          <td>5m</td>
                          <td>
                            <span className="badge badge-soft badge-primary bg-blue-400/10 rounded-full">
                              1 CPU
                            </span>
                            <span className="badge badge-soft badge-primary bg-blue-400/10 rounded-full ml-2">
                              4 GiB RAM
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <button className="btn btn-outline btn-lg hover:text-white">
                  <span className="icon-[tabler--player-stop-filled] size-5 shrink-0"></span>
                  Stop Sandbox
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <SignIn
        isOpen={signInModalOpen}
        onClose={() => {
          setSignInModalOpen(false);
        }}
      />
    </>
  );
}

export default New;
