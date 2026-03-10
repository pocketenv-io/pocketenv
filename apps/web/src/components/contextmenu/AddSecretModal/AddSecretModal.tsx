import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddSecretMutation } from "../../../hooks/useSecret";
import { useSodium } from "../../../hooks/useSodium";
import { PUBLIC_KEY } from "../../../consts";
import { useNotyf } from "../../../hooks/useNotyf";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof schema>;

export type AddSecretModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sandboxId: string;
};

function AddSecretModal({ isOpen, onClose, sandboxId }: AddSecretModalProps) {
  const sodium = useSodium();
  const notyf = useNotyf();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: addSecret } = useAddSecretMutation();
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
    const sealed = sodium.cryptoBoxSeal(
      sodium.fromString(data.value),
      sodium.fromHex(PUBLIC_KEY),
    );
    try {
      await addSecret({
        sandboxId,
        name: data.name,
        value: sodium.toBase64(
          sealed,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        ),
      });
      setIsLoading(false);
      reset();
      onClose();
      notyf.open("primary", "Secret added successfully!");
    } catch {
      notyf.open("error", "Failed to add secret!");
      setIsLoading(false);
      reset();
      onClose();
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
              <div className="flex-1">Add Secret</div>
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
                    className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent ${errors.name ? "input-error" : ""}`}
                  >
                    <input
                      type="text"
                      placeholder="YOUR_SECRET_NAME"
                      className={`grow ${errors.name ? "is-invalid" : ""}`}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      data-form-type="other"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <span className="helper-text text-[12px] mt-1">
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
                      className={`textarea max-w-full h-[250px] text-[14px] font-semibold ${errors.value ? "is-invalid" : ""}`}
                      aria-label="Textarea"
                      placeholder="Secret Value"
                      style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                      {...register("value")}
                    ></textarea>
                    {errors.value && (
                      <span className="helper-text text-[12px] mt-1 block">
                        {errors.value.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs mr-1.5"></span>
                  )}
                  Add Secret
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

export default AddSecretModal;
