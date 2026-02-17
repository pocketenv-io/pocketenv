import Navbar from "./Navbar";
import NewProject from "../../components/newproject";
import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { API_URL } from "../../consts";

function Home() {
  const { did } = useSearch({ from: "/" });
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const banner = `
    ____             __        __
   / __ \\____  _____/ /_____  / /____  ____ _   __
  / /_/ / __ \\/ ___/ //_/ _ \\/ __/ _ \\/ __ \\ | / /
 / ____/ /_/ / /__/ ,< /  __/ /_/  __/ / / / |/ /
/_/    \\____/\\___/_/|_|\\___/\\__/\\___/_/ /_/|___/

    `;

  const isAuthenticated = !!localStorage.getItem("token");

  if (isAuthenticated) {
    navigate({ to: "/projects" });
  }

  useEffect(() => {
    if (did) {
      fetch(`${API_URL}/token`, {
        headers: {
          "session-did": did,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
        })
        .then(({ token }) => {
          localStorage.setItem("token", token);
          navigate({ to: "/projects" });
        });
    }
  }, [did, navigate]);
  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar />
        <div className="flex-1">
          <div className="max-w-[77%] m-auto mt-[5%] text-center">
            <div className="flex justify-center">
              <pre className="text-left">{banner}</pre>
            </div>
            <h1 className="mb-[10px] text-7xl mb-[20px] font-medium">
              A Safe Space to Try Your Ideas
            </h1>
            <div className="text-purple-200 text-[18px] mb-[80px] font-medium">
              Experiment with AI tools, prompts, and agents in a private
              sandbox. No setup, no risk - everything runs in a secure space
              that disappears when you're done.
            </div>

            <div className="flex justify-center gap-[20px]">
              <button
                className="btn bg-pink-500 border-none btn-xl font-bold"
                onClick={() => setModalOpen(true)}
              >
                Start For Free
              </button>
              <a
                href="https://docs.pocketenv.io"
                target="_blank"
                className="btn btn-outline border-white text-white btn-xl font-bold opacity-70 border-2 hover:opacity-100"
              >
                View Docs
              </a>
            </div>
          </div>
        </div>
      </div>
      <NewProject
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}

export default Home;
