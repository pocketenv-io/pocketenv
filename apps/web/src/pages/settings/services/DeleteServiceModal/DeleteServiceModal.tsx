import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDeleteServiceMutation } from "../../../../hooks/useService";

export type DeleteServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName?: string;
};

function DeleteServiceModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
}: DeleteServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: deleteService } = useDeleteServiceMutation();
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

  const onDeleteService = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    await deleteService(serviceId);
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
              <div className="flex-1">Delete "{serviceName}"</div>
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
                Are you sure you want to delete this service?
              </p>
              <p className="text-center ">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-error font-semibold"
                onClick={onDeleteService}
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-xs mr-1.5"></span>
                )}
                Delete Service
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

export default DeleteServiceModal;
