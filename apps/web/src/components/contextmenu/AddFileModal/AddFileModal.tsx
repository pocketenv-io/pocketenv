import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddFileMutation } from "../../../hooks/useFile";

const schema = z.object({
  path: z.string().min(1, "Path is required"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof schema>;

export type AddFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
};

function AddFileModal({ isOpen, onClose, sandboxId }: AddFileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync } = useAddFileMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        reset();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, reset]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      reset();
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleCloseButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    reset();
    e.stopPropagation();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    await mutateAsync({
      sandboxId,
      path: data.path,
      content: data.content,
    });
    setIsLoading(false);
    reset();
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
          className={`overlay-animation-target modal-dialog overlay-open:duration-300 transition-all ease-out modal-dialog-lg overlay-open:mt-4 mt-12`}
          onClick={handleContentClick}
          onMouseDown={handleContentClick}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="flex-1">Add File</div>
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <label className="label">
                  <span className="label-text font-bold mb-1 text-[14px]">
                    Path
                  </span>
                </label>
                <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent">
                  <input
                    type="text"
                    placeholder="File Mount Path, e.g /root/.openclaw/openclaw.json"
                    className={`grow ${errors.path ? "is-invalid" : ""}`}
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                    {...register("path")}
                  />
                </div>
                {errors.path && (
                  <span className="text-error text-[12px] mt-1">
                    {errors.path.message}
                  </span>
                )}
                <div className="mt-5">
                  <label className="label">
                    <span className="label-text font-bold mb-1 text-[14px]">
                      Content
                    </span>
                  </label>
                  <textarea
                    className={`textarea max-w-full h-[250px] text-[14px] font-semibold ${errors.content ? "is-invalid" : ""}`}
                    aria-label="Textarea"
                    placeholder="File Content"
                    {...register("content")}
                  ></textarea>
                  {errors.content && (
                    <span className="helper-text text-[12px] mt-1 block">
                      {errors.content.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary w-36 font-semibold"
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs mr-1.5"></span>
                  )}
                  Add File
                </button>
              </div>
            </form>
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

export default AddFileModal;
