import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useExposePortMutation } from "../../../hooks/useSandbox";

const schema = z.object({
  port: z.coerce
    .number({ error: "Port is required" })
    .int()
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535"),
  description: z.string(),
});

export type ExposePortModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
  portId?: string;
};

function ExposePortModal({ isOpen, onClose, sandboxId }: ExposePortModalProps) {
  const { mutateAsync: exposePort, isPending: isLoading } =
    useExposePortMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "");
    e.target.value = numeric;
    setValue("port", numeric as unknown as number, { shouldValidate: true });
  };

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

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await exposePort({
      id: sandboxId,
      port: data.port,
      description: data.description || undefined,
    });
    reset();
    onClose();
  };

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
              <div className="flex-1">Expose Port</div>
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
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold mb-1 text-[14px]">
                      Port
                    </span>
                  </label>
                  <div
                    className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent`}
                  >
                    <input
                      type="text"
                      placeholder="Port Number"
                      className={`grow`}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      data-form-type="other"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("port")}
                      onChange={handlePortChange}
                    />
                  </div>
                  {errors.port && (
                    <span className="text-error text-[12px] mt-1">
                      {errors.port.message}
                    </span>
                  )}
                  <div className="mt-5">
                    <label className="label">
                      <span className="label-text font-bold mb-1 text-[14px]">
                        Description
                      </span>
                    </label>
                    <textarea
                      className={`textarea max-w-full h-[250px] text-[14px] font-semibold`}
                      aria-label="Textarea"
                      placeholder="Optional description for this port"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("description")}
                    ></textarea>
                    {errors.description && (
                      <span className="text-error text-[12px] mt-1 block">
                        {errors.description.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary w-45 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs mr-1.5"></span>
                  )}
                  Expose Port
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

export default ExposePortModal;
