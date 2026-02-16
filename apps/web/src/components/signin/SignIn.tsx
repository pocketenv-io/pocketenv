import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../consts";

export type SignInProps = {
  isOpen: boolean;
  onClose: () => void;
};

function SignIn({ isOpen, onClose }: SignInProps) {
  const [handle, setHandle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSignIn = () => {
    if (!handle) {
      return;
    }
    window.location.href = `${API_URL}/login?handle=${handle}`;
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setHandle("");
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`overlay modal modal-middle overlay-open:opacity-100 overlay-open:duration-300 open ${isOpen ? "opened" : "hidden"}`}
        role="dialog"
        style={{ outline: "none" }}
        onClick={handleBackdropClick}
      >
        <div className="overlay-animation-target modal-dialog overlay-open:mt-4 overlay-open:duration-300 mt-12 transition-all ease-out">
          <div className="modal-content">
            <div className="modal-header"></div>
            <div className="modal-body">
              <div className="flex flex-col items-center gap-6 w-[400px]">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-[15px]">Handle</span>
                  </label>
                  <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent  focus-within:border-pink-500! outline-none!">
                    <span className="label-text my-auto text-[16px] opacity-50 mr-[10px]">
                      @
                    </span>
                    <input
                      placeholder="alice.bsky.social"
                      className="grow "
                      ref={inputRef}
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
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
                <p className="text-center font-semibold text-white/70">
                  Don't have an atproto handle yet? You can create one at
                  <a
                    href={`${API_URL}/login?prompt=create`}
                    className="text-pink-400"
                  >
                    selfhosted.social
                  </a>
                  ,{" "}
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
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          id="slide-down-animated-modal-backdrop"
          data-overlay-backdrop-template=""
          style={{ zIndex: 79 }}
          className="overlay-backdrop transition duration-300 fixed inset-0 bg-base-300/60 overflow-y-auto opacity-75"
          onClick={() => {
            onClose();
          }}
        ></div>
      )}
    </>
  );
}

export default SignIn;
