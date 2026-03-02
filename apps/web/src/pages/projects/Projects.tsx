import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { profileAtom } from "../../atoms/profile";
import { useActorSandboxesQuery } from "../../hooks/useSandbox";
import Main from "../../layouts/Main";
import Project from "./Project";
import Pagination from "../../components/pagination";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { API_URL } from "../../consts";

function Projects() {
  const { did } = useSearch({ from: "/projects" });
  const navigate = useNavigate();
  const profile = useAtomValue(profileAtom);
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // When this is an OAuth callback, we must wait until the token is stored
  // before mounting <Main> (which checks localStorage for auth).
  const [tokenReady, setTokenReady] = useState(() => {
    // If there's no OAuth `did` param, the token should already be present.
    if (!did) return true;
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    if (!did) return;

    fetch(`${API_URL}/token`, {
      headers: {
        "session-did": did,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch token");
      })
      .then(({ token }) => {
        localStorage.setItem("token", token);
        navigate({ to: "/projects" });
        setTokenReady(true);
      })
      .catch(() => {
        // Token fetch failed — still unblock rendering so the route guard
        // can redirect the user back to "/" via the next navigation.
        setTokenReady(true);
      });
  }, [did]);

  const { data, isLoading } = useActorSandboxesQuery(
    profile?.did || "",
    offset,
    PAGE_SIZE,
  );

  const totalPages = data?.total ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!tokenReady) {
    return null;
  }

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
