import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subject: string;
  title?: string;
};

function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  subject,
  title,
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
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

  const onDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    e.stopPropagation();
    onClose();
  };

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
          className={`overlay-animation-target modal-dialog overlay-open:duration-300 transition-all ease-out modal-dialog-md overlay-open:mt-4 mt-12`}
          onClick={handleContentClick}
          onMouseDown={handleContentClick}
        >
          <div className="modal-content">
            <div className="modal-header pb-0">
              <div className="flex-1">Delete {title}</div>
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
            <div className="modal-body p-0 pl-2 h-[100px] flex flex-col justify-center">
              <p className="font-semibold text-center">
                Are you sure you want to delete this {subject}?
              </p>
              <p className="text-center ">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-error font-semibold"
                onClick={onDelete}
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-xs mr-1.5"></span>
                )}
                Yes, delete
              </button>
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

export default ConfirmDeleteModal;
