import { useEffect, useRef, useState } from "react";
import { useSandboxesQuery } from "../../hooks/useSandbox";
import { useNavigate } from "@tanstack/react-router";

export type NewProjectProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NewProject({ isOpen, onClose }: NewProjectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useSandboxesQuery();
  const navigate = useNavigate();

  const sandboxes = data?.sandboxes.filter((sandbox) =>
    filter
      ? sandbox.displayName.toLowerCase().includes(filter.toLowerCase())
      : true,
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
        setFilter("");
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
      setFilter("");
    }
  };

  const onFilter = (value: string) => {
    setFilter(value);
  };

  const onSelect = async (id: string) => {
    await navigate({ to: `/sandbox/${id}` });
    onClose();
    setFilter("");
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
                    type="text"
                    ref={inputRef}
                    placeholder="What would you like to try?"
                    className="grow"
                    value={filter}
                    onChange={(e) => onFilter(e.target.value)}
                    autoComplete="off"
                    name="search-filter"
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              </div>
            </div>
            <div className="modal-body">
              {!isLoading &&
                sandboxes?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-white/7 cursor-pointer rounded-md"
                    onClick={() => onSelect(item.id)}
                  >
                    <div className="font-semibold">{item.displayName}</div>
                  </div>
                ))}
              {!isLoading && sandboxes?.length === 0 && (
                <div className="p-3 text-center font-semibold opacity-70">
                  No results found for <br />
                  <b>{filter}</b>
                </div>
              )}
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
          onClick={() => {
            onClose();
            setFilter("");
          }}
        ></div>
      )}
    </>
  );
}

export default NewProject;
