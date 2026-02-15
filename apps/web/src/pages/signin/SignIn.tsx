import { useNavigate } from "@tanstack/react-router";

function SignIn() {
  const navigate = useNavigate();

  const onSignIn = () => {
    navigate({ to: "/projects" });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-6 w-[400px]">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-[15px]">Handle</span>
            </label>
            <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent  focus-within:border-pink-500!">
              <span className="label-text my-auto text-[16px] opacity-50 mr-[10px]">
                @
              </span>
              <input
                placeholder="alice.bsky.social"
                className="grow "
                autoFocus
              />
            </div>
          </div>

          <button
            className="btn btn-lg font-bold bg-pink-500  border-none w-full"
            onClick={onSignIn}
          >
            Sign In
          </button>
          <p className="text-center text-white/70">
            Don't have an atproto handle yet? You can create one at
            <button className="text-pink-400">selfhosted.social</button>,{" "}
            <a
              href="https://bsky.app/"
              className="text-pink-400"
              target="_blank"
            >
              Bluesky
            </a>{" "}
            or any other AT Protocol service.
          </p>
        </div>
      </div>
    </>
  );
}

export default SignIn;
