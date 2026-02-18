import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { API_URL } from "../../consts";

function SignIn() {
  const [handle, setHandle] = useState("");

  const onSignIn = () => {
    if (!handle) {
      return;
    }
    window.location.href = `${API_URL}/login?handle=${handle}`;
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-6 w-[400px]">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-[15px]">Handle</span>
            </label>
            <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent  ">
              <span className="label-text my-auto text-[16px] opacity-50 mr-[10px]">
                @
              </span>
              <input
                placeholder="alice.bsky.social"
                className="grow "
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <button
            className="btn btn-lg font-bold btn-primary border-none w-full"
            onClick={onSignIn}
          >
            Sign In
          </button>
          <p className="text-center text-white/70">
            Don't have an atproto handle yet? You can create one at
            <a href={`${API_URL}/login?prompt=create`} className="text-primary">
              selfhosted.social
            </a>
            ,{" "}
            <a
              href="https://bsky.app/"
              className="text-primary"
              target="_blank"
            >
              Bluesky
            </a>{" "}
            or any other{" "}
            <a
              href={"https://atproto.com"}
              className="text-primary"
              target="_blank"
            >
              AT Protocol
            </a>{" "}
            service.
          </p>
        </div>
      </div>
    </>
  );
}

export default SignIn;
