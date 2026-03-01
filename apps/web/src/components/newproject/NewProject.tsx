import { useEffect, useRef, useState } from "react";
import ContentLoader from "react-content-loader";
import {
  useCreateSandboxMutation,
  useSandboxesQuery,
} from "../../hooks/useSandbox";
import { useNavigate } from "@tanstack/react-router";
import { Turnstile, useTurnstile } from "react-turnstile";
import { CF_SITE_KEY } from "../../consts";
import numeral from "numeral";

export type NewProjectProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NewProject({ isOpen, onClose }: NewProjectProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useSandboxesQuery();
  const navigate = useNavigate();
  const { mutateAsync } = useCreateSandboxMutation();
  const turnstile = useTurnstile();
  const [challenge, setChallenge] = useState<string | null>(null);

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
        turnstile.reset();
        setChallenge(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, turnstile]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
      setFilter("");
      turnstile.reset();
      setChallenge(null);
    }
  };

  const onFilter = (value: string) => {
    setFilter(value);
  };

  const onSelect = async (id: string) => {
    setSelected(id);
    const res = await mutateAsync({
      base: id,
      provider: "cloudflare",
      challenge,
    });
    await navigate({
      to: res.data?.uri
        ? `/${res.data?.uri.split("at://")[1].replace("io.pocketenv.", "")}`
        : `/sandbox/${res.data?.id}`,
    });
    setSelected(null);
    onClose();
    setFilter("");
    turnstile.reset();
    setChallenge(null);
  };

  return (
    <>
      <div
        className={`overlay modal modal-middle overlay-open:opacity-100 overlay-open:duration-300 open ${isOpen ? "opened" : "hidden"}`}
        role="dialog"
        style={{ outline: "none" }}
        onClick={handleBackdropClick}
      >
        <div className="overlay-animation-target modal-dialog overlay-open:mt-4 overlay-open:duration-300 mt-12 transition-all ease-out h-[65%]">
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
            <div className="modal-body h-[400px] overflow-y-auto">
              {isOpen && (
                <Turnstile
                  sitekey={CF_SITE_KEY}
                  onVerify={(token) => {
                    setChallenge(token);
                  }}
                />
              )}
              {!isLoading &&
                challenge &&
                sandboxes?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-white/7 cursor-pointer rounded-md flex"
                    onClick={() => onSelect(item.uri)}
                  >
                    <div className="font-semibold flex-1">
                      {item.displayName}
                    </div>
                    {selected === item.uri && (
                      <span className="loading loading-spinner loading-md text-pink-500"></span>
                    )}
                    {item.installs > 0 && selected !== item.uri && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="icon-[prime--download] size-5 mr-1"></span>
                        <span className="mt-1.25">
                          {numeral(item.installs).format("0,0")}{" "}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              {isLoading ||
                (!challenge && (
                  <div className="flex flex-col gap-2 p-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <ContentLoader
                        key={i}
                        speed={1.5}
                        width="100%"
                        height={44}
                        backgroundColor="#ffffff10"
                        foregroundColor="#ffffff20"
                      >
                        <rect
                          x="0"
                          y="10"
                          rx="6"
                          ry="6"
                          width="70%"
                          height="14"
                        />
                        <rect
                          x="0"
                          y="30"
                          rx="4"
                          ry="4"
                          width="25%"
                          height="8"
                        />
                      </ContentLoader>
                    ))}
                  </div>
                ))}
              {!isLoading && !challenge && sandboxes?.length === 0 && (
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
            turnstile.reset();
            setChallenge(null);
          }}
        ></div>
      )}
    </>
  );
}

export default NewProject;
