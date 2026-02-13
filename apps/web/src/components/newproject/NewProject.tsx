import { useEffect, useRef } from "react";

export type NewProjectProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NewProject({ isOpen, onClose }: NewProjectProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log("Attempting to focus input:", inputRef.current);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
              <div className="form-control w-full">
                <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent  focus-within:border-pink-500!">
                  <input
                    ref={inputRef}
                    placeholder="What would you like to try?"
                    className="grow"
                  />
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">OpenClaw</div>
              </div>
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">Claude Code</div>
              </div>
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">OpenAI Codex CLI</div>
              </div>
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">GitHub Copilot CLI</div>
              </div>
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">Gemini CLI</div>
              </div>
              <div className="p-3 hover:bg-white/7 cursor-pointer rounded-md">
                <div className="font-semibold">OpenCode</div>
              </div>

              <div className="p-3 hover:bg-white/7 cursor-pointer rounted-md">
                <div className="font-semibold">Aider</div>
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
          onClick={onClose}
        ></div>
      )}
    </>
  );
}

export default NewProject;
