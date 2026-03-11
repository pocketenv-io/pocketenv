import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddVariableMutation } from "../../../hooks/useVariable";
import { useNotyf } from "../../../hooks/useNotyf";

const UPPER_SNAKE_CASE_REGEX = /^[A-Z][A-Z0-9_]*$/;

const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(
      UPPER_SNAKE_CASE_REGEX,
      "Name must be in UPPER_SNAKE_CASE (e.g. MY_VARIABLE)",
    ),
  value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof schema>;

export type AddEnvironmentVariableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
  variableId?: string;
};

function AddEnvironmentVariableModal({
  isOpen,
  onClose,
  sandboxId,
  variableId,
}: AddEnvironmentVariableModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const notyf = useNotyf();
  const { mutateAsync: addVariable } = useAddVariableMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const transformed = e.target.value
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "");
    setValue("name", transformed, { shouldValidate: true });
  };

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
    try {
      await addVariable({
        sandboxId,
        name: data.name,
        value: data.value,
      });
      setIsLoading(false);
      reset();
      onClose();
      notyf.open("primary", "Variable added successfully!");
    } catch {
      notyf.open("error", "Failed to add variable!");
      setIsLoading(false);
      reset();
      onClose();
      return;
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
                {variableId ? "Edit Variable" : "Add Variable"}
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
                  <div className="input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent">
                    <input
                      type="text"
                      placeholder="YOUR_VARIABLE_NAME"
                      className={`grow`}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      data-form-type="other"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("name", { onChange: handleNameChange })}
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
                        Value
                      </span>
                    </label>
                    <textarea
                      className={`textarea max-w-full h-[250px] text-[14px] font-semibold`}
                      aria-label="Textarea"
                      placeholder="Variable Value"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("value")}
                    ></textarea>
                    {errors.value && (
                      <span className="text-error text-[12px] mt-1 block">
                        {errors.value.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary w-45 font-semibold"
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs mr-1.5"></span>
                  )}
                  {variableId ? "Save Changes" : "Add Variable"}
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

export default AddEnvironmentVariableModal;
