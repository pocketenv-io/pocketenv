import { Link } from "@tanstack/react-router";
import Navbar from "./Navbar";

function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar />
        <div className="flex-1">
          <div className="max-w-[77%] m-auto mt-[10%]">
            <h1 className="mb-[10px] text-7xl mb-[20px]">
              Instant Secure Prototyping.
            </h1>
            <div className="text-white/50 text-[18px] font-mono font-light mb-[80px]">
              Throw ideas into isolated sandboxes. Run commands, test prompts,
              prototype agents — all in a safe, temporary space that vanishes
              when you're finished.
            </div>

            <Link
              className="btn bg-pink-500 border-none btn-xl mr-[20px] font-bold"
              to="/signin"
            >
              Start For Free
            </Link>
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
    </>
  );
}

export default Home;
