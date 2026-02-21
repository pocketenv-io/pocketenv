import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Terminal from "../../../../components/terminal";

export type TerminalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

function TerminalModal({ isOpen, onClose, title }: TerminalModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
          (document.activeElement as HTMLElement)?.blur();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, isFullscreen, onClose]);

  // Reset fullscreen when modal closes
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFullscreen(false);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleCloseButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose();
  };

  const handleFullscreenToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFullscreen((prev) => !prev);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="overlay modal modal-middle overlay-open:opacity-100 overlay-open:duration-300 open opened"
        role="dialog"
        style={{ outline: "none", zIndex: 80 }}
        onClick={handleBackdropClick}
        onMouseDown={handleBackdropClick}
      >
        <div
          className={`overlay-animation-target modal-dialog overlay-open:duration-300 transition-all ease-out ${
            isFullscreen
              ? "fixed inset-0 !m-0 !max-w-none !w-screen !h-screen !rounded-none"
              : "modal-dialog-xl overlay-open:mt-4 mt-12"
          }`}
          onClick={handleContentClick}
          onMouseDown={handleContentClick}
          style={isFullscreen ? { maxHeight: "100vh" } : undefined}
        >
          <div
            className={`modal-content ${isFullscreen ? "!rounded-none h-full" : ""}`}
          >
            <div className="modal-header">
              <div className="flex-1 text-center">{title}</div>
              <button
                type="button"
                className="btn btn-text btn-circle btn-sm absolute start-2 top-3"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={handleFullscreenToggle}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span
                  className={
                    isFullscreen
                      ? "icon-[qlementine-icons--fullscreen-exit-16] size-4.5"
                      : "icon-[qlementine-icons--fullscreen-16] size-4.5"
                  }
                ></span>
              </button>
              <button
                type="button"
                className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
                aria-label="Close"
                onClick={handleCloseButton}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span className="icon-[tabler--x] size-4"></span>
              </button>
            </div>
            <div
              className="modal-body p-0 pl-2"
              style={
                isFullscreen
                  ? { height: "calc(100vh - 56px)" }
                  : { height: "60vh" }
              }
            >
              <Terminal />
            </div>
          </div>
        </div>
      </div>

      <div
        data-overlay-backdrop-template=""
        style={{ zIndex: 79 }}
        className="overlay-backdrop transition duration-300 fixed inset-0 bg-base-300/60 overflow-y-auto opacity-75"
        onClick={handleBackdropClick}
        onMouseDown={(e) => e.stopPropagation()}
      ></div>
    </>,
    document.body,
  );
}

export default TerminalModal;
