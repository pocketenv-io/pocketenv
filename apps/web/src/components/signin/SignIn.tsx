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
            <div className="modal-header">
              <button
                type="button"
                className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
                aria-label="Close"
                onClick={() => {
                  onClose();
                  setHandle("");
                }}
              >
                <span className="icon-[tabler--x] size-4"></span>
              </button>
            </div>
            <div className="modal-body">
              <div className="flex flex-col items-center gap-6 w-[400px]">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-[15px]">Handle</span>
                  </label>
                  <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent">
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
                  className="btn btn-lg font-bold btn-primary  border-none w-full"
                  onClick={onSignIn}
                >
                  Sign In
                </button>
                <p className="text-center font-semibold text-white/70">
                  Don't have an atproto handle yet? You can create one at
                  <a
                    href={`${API_URL}/login?prompt=create`}
                    className="text-primary"
                  >
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
            setHandle("");
            onClose();
          }}
        ></div>
      )}
    </>
  );
}

export default SignIn;
