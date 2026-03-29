import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  useAddServiceMutation,
  useUpdateServiceMutation,
} from "../../../../hooks/useService";
import type { Service } from "../../../../types/service";

const schema = z.object({
  name: z.string().trim().min(1, "Service name is required"),
  command: z.string().trim().min(1, "Command is required"),
  ports: z.array(
    z.coerce
      .number()
      .int()
      .min(1025, "Port must be between 1025 and 65535")
      .max(65535, "Port must be between 1025 and 65535"),
  ),
  description: z.string().optional(),
});

export type NewServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
  service?: Service;
};

function NewServiceModal({
  isOpen,
  onClose,
  sandboxId,
  service,
}: NewServiceModalProps) {
  const isEdit = !!service;
  const { mutateAsync: addService, isPending: isAdding } =
    useAddServiceMutation();
  const { mutateAsync: updateService, isPending: isUpdating } =
    useUpdateServiceMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ports: [] as number[] },
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
          name: service.name,
          command: service.command,
          ports: service.ports ?? [],
          description: service.description ?? "",
        });
      } else {
        reset({ name: "", command: "", ports: [], description: "" });
      }
    }
  }, [isOpen, service, reset]);

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

  const handlePortsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    setValue("ports", parsed);
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (isEdit) {
      await updateService({ serviceId: service.id, ...data });
    } else {
      await addService({ sandboxId, ...data });
    }
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
              <div className="flex-1">
                {isEdit ? "Edit Service" : "New Service"}
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
              <div className="modal-body">
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
                      placeholder="Service name"
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
                        Command
                      </span>
                    </label>
                    <div
                      className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent`}
                    >
                      <input
                        type="text"
                        placeholder="e.g. npx serve -l 3001"
                        className={`grow`}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                        {...register("command")}
                      />
                    </div>
                    {errors.command && (
                      <span className="text-error text-[12px] mt-1">
                        {errors.command.message}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="label">
                      <span className="label-text font-bold mb-1 text-[14px]">
                        Ports
                      </span>
                    </label>
                    <div
                      className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent`}
                    >
                      <input
                        type="text"
                        placeholder="e.g. 3001, 8081"
                        className={`grow`}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                        key={isOpen ? (service?.id ?? "new") : "closed"}
                        defaultValue={service?.ports?.join(", ") ?? ""}
                        onChange={handlePortsChange}
                      />
                    </div>
                    {errors.ports && (
                      <span className="text-error text-[12px] mt-1">
                        {errors.ports.message}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="label">
                      <span className="label-text font-bold mb-1 text-[14px]">
                        Description
                      </span>
                    </label>
                    <textarea
                      className={`textarea max-w-full h-[150px] text-[14px] font-semibold`}
                      aria-label="Textarea"
                      placeholder="Optional description for this service"
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
                  {isEdit ? "Save Changes" : "Create Service"}
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

export default NewServiceModal;
