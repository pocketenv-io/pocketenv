import Navbar from "./Navbar";
import NewProject from "../../components/newproject";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";

type InstallTab = "bash" | "npm" | "brew";

const installCommands: Record<
  InstallTab,
  { prefix: string; highlight: string; suffix?: string }
> = {
  bash: {
    prefix: "curl -fsSL ",
    highlight: "https://cli.pocketenv.io",
    suffix: " | bash",
  },
  npm: { prefix: "npm install -g ", highlight: "@pocketenv/cli" },
  brew: { prefix: "brew install ", highlight: "pocketenv-io/tap/pocketenv" },
};

const banner = [
  "██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗███████╗███╗   ██╗██╗   ██╗",
  "██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗  ██║██║   ██║",
  "██████╔╝██║   ██║██║     █████╔╝ █████╗     ██║   █████╗  ██╔██╗ ██║██║   ██║",
  "██╔═══╝ ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝",
  "██║     ╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   ███████╗██║ ╚████║ ╚████╔╝ ",
  "╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝  ╚═══╝ ",
].join("\n");

function Home() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InstallTab>("bash");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cmd = installCommands[activeTab];
    navigator.clipboard.writeText(
      cmd.prefix + cmd.highlight + (cmd.suffix ?? ""),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthenticated = !!localStorage.getItem("token");

  if (isAuthenticated) {
    navigate({ to: "/projects" });
  }

  return (
    <>
      {!isAuthenticated && (
        <>
          <div className="flex flex-col min-h-screen bg-base-100">
            <Navbar />
            <div className="flex-1 flex justify-center px-4">
              <div className="flex flex-col items-center mt-32 text-center w-full max-w-[700px]">
                <pre
                  className="text-primary mb-9 w-full"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "clamp(5px, 2vw, 13px)",
                    lineHeight: 1.2,
                    whiteSpace: "pre",
                    overflowX: "hidden",
                    textAlign: "center",
                  }}
                >
                  {banner}
                </pre>
                <div
                  className="text-purple-200 text-[18px] mb-[40px] font-medium opacity-80 max-w-[590px]"
                  style={{
                    fontFamily:
                      '"CaskaydiaNerdFontMonoRegular", "Cascadia Code", "JetBrains Mono", "Fira Code", "monospace", "ui-monospace"',
                  }}
                >
                  Experiment with AI tools, prompts, and agents in a private
                  sandbox. No setup, no risk - everything runs in a secure space
                  that disappears when you're done.
                </div>

                <div className="w-full max-w-[560px] mb-[40px]">
                  <div className="w-full">
                    <div
                      className="tabs tabs-bordered justify-center mb-0"
                      role="tablist"
                    >
                      {(["bash", "npm", "brew"] as InstallTab[]).map((tab) => (
                        <button
                          key={tab}
                          role="tab"
                          className={`tab font-semibold uppercase tracking-wide text-sm ${activeTab === tab ? "tab-active text-primary" : "text-purple-300 opacity-60"}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 bg-[#12182dad] rounded-xl px-5 py-3 mt-0">
                      <span className=" text-purple-300">$</span>
                      <span className="text-purple-200 font-mono text-sm flex-1 text-left truncate select-all text-[14px]">
                        {installCommands[activeTab].prefix}
                        <span className="text-[#5e2af7]">
                          {installCommands[activeTab].highlight}
                        </span>
                        {installCommands[activeTab].suffix ?? ""}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="btn btn-sm btn-circle shrink-0 text-purple-300 hover:text-white bg-transparent border-none"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <span className="icon-[tabler--check] size-5 text-green-400"></span>
                        ) : (
                          <span className="icon-[tabler--copy] size-5"></span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-[20px]">
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
            <footer className="mt-[80px] w-[90%] md:w-[80%] m-auto text-[#6d6d9c] py-4 px-4 md:px-[21px] flex flex-col md:flex-row md:h-[50px] gap-3 md:gap-0 items-center">
              <div className="flex justify-center items-center">
                © {dayjs().format("YYYY")} Pocketenv
              </div>
              <div className="flex justify-center items-center md:flex-1">
                <div>Baked with ❤️ in Antananarivo</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <a href="https://bsky.app/profile/pocketenv.io" target="_blank">
                  <span className="icon-[ri--bluesky-fill] size-7"></span>
                </a>
                <a href="https://discord.gg/9ada4pFUFS" target="_blank">
                  <span className="icon-[prime--discord] size-8"></span>
                </a>
                <a
                  href="https://github.com/pocketenv-io/pocketenv"
                  target="_blank"
                >
                  <span className="icon-[mdi--github] size-7"></span>
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
