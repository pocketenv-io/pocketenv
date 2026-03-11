import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddVolumeMutation } from "../../../hooks/useVolume";
import { useNotyf } from "../../../hooks/useNotyf";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().min(1, "Path is required"),
});

type FormValues = z.infer<typeof schema>;

export type AddVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
  volumeId?: string;
};

function AddVolumeModal({
  isOpen,
  onClose,
  sandboxId,
  volumeId,
}: AddVolumeModalProps) {
  const notyf = useNotyf();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: addVolume } = useAddVolumeMutation();
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
    e.stopPropagation();
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await addVolume({
        sandboxId,
        name: data.name,
        path: data.path,
      });
      setIsLoading(false);
      reset();
      onClose();
      notyf.open("primary", "Volume added successfully");
    } catch {
      setIsLoading(false);
      reset();
      onClose();
      notyf.open("error", "Failed to add volume");
    }
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
              <div className="flex-1">
                {volumeId ? "Edit Volume" : "Add Volume"}
              </div>
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
              <div className="modal-body" style={{ height: 300 }}>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold mb-1 text-[14px]">
                      Name
                    </span>
                  </label>
                  <div
                    className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent`}
                  >
                    <input
                      type="text"
                      placeholder="Volume Name"
                      className={`grow`}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      data-form-type="other"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-error text-[12px] mt-1">
                      {errors.name.message}
                    </span>
                  )}
                  <div className="mt-5">
                    <label className="label">
                      <span className="label-text font-bold mb-1 text-[14px]">
                        Path
                      </span>
                    </label>
                    <div
                      className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent`}
                    >
                      <input
                        type="text"
                        placeholder="Mount Path, e.g /data"
                        className={`grow`}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                        {...register("path")}
                      />
                    </div>
                    {errors.path && (
                      <span className="text-error text-[12px] mt-1 block">
                        {errors.path.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary font-semibold">
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs mr-1.5"></span>
                  )}
                  {volumeId ? "Save Changes" : "Add Volume"}
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

export default AddVolumeModal;
