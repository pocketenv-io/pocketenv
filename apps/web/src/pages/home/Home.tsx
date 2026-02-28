import Navbar from "./Navbar";
import NewProject from "../../components/newproject";
import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { API_URL } from "../../consts";
import dayjs from "dayjs";

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
      {!isAuthenticated && (
        <>
          <div className="flex flex-col min-h-screen bg-base-100">
            <Navbar />
            <div className="flex-1">
              <div className="max-w-[77%] m-auto mt-[5%] text-center">
                <div className="flex justify-center">
                  <pre className="text-left text-primary">{banner}</pre>
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
            <footer className="mt-[80px] w-[80%] m-auto  text-[#6d6d9c] h-[50px] flex flex-row pl-[21px] pr-[21px]">
              <div className="flex justify-center items-center">
                © {dayjs().format("YYYY")} Pocketenv
              </div>
              <div className="flex justify-center items-center flex-1">
                <div>Baked with ❤️ in Antananarivo</div>
              </div>
              <div className="flex item-center justify-center">
                <a href="https://bsky.app/profile/pocketenv.io" target="_blank">
                  <span className="icon-[ri--bluesky-fill] size-7 mr-[8px] mt-[13px]"></span>
                </a>
              </div>
              <div className="flex item-center justify-center">
                <a href="https://discord.gg/9ada4pFUFS" target="_blank">
                  <span className="icon-[prime--discord] size-8 mr-[8px] mt-[12px]"></span>
                </a>
              </div>
              <div className="flex item-center justify-center">
                <a
                  href="https://github.com/pocketenv-io/pocketenv"
                  target="_blank"
                >
                  <span className="icon-[mdi--github] size-7 mt-[13px]"></span>
                </a>
              </div>
            </footer>
          </div>
          <NewProject
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}

export default Home;
