import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { API_URL } from "../../consts";

export type SignInProps = {
  isOpen: boolean;
  onClose: () => void;
};

const signInSchema = z.object({
  handle: z.string().trim().min(1, { message: "Handle is required" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function SignIn({ isOpen, onClose }: SignInProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      handle: "",
    },
  });

  const { ref: registerRef, ...registerRest } = register("handle");

  const onSubmit = (data: SignInFormValues) => {
    window.location.href = `${API_URL}/login?handle=${data.handle}`;
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, handleClose]);

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
                onClick={handleClose}
              >
                <span className="icon-[tabler--x] size-4"></span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col items-center gap-6 w-[400px]">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-[15px]">Handle</span>
                    </label>
                    <div
                      className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent ${errors.handle ? "input-error" : ""}`}
                    >
                      <span className="label-text my-auto text-[16px] opacity-50 mr-[10px]">
                        @
                      </span>
                      <input
                        {...registerRest}
                        ref={(el) => {
                          registerRef(el);
                          (
                            inputRef as React.MutableRefObject<HTMLInputElement | null>
                          ).current = el;
                        }}
                        placeholder="alice.bsky.social"
                        className="grow"
                        autoFocus
                      />
                    </div>
                    {errors.handle && (
                      <span className="label-text text-error text-sm mt-1">
                        {errors.handle.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg font-bold btn-primary border-none w-full"
                  >
                    Sign In
                  </button>
                  <p className="text-center font-semibold text-white/70">
                    Don't have an atproto handle yet? You can create one at{" "}
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
              </form>
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
          onClick={handleClose}
        ></div>
      )}
    </>
  );
}

export default SignIn;
