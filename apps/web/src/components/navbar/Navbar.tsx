import { Link, useNavigate } from "@tanstack/react-router";
import "flyonui/dist/dropdown.js";
import "flyonui/dist/overlay.js";
import { useState, useEffect, useRef } from "react";
import NewProject from "../newproject";

export type NavbarProps = {
  title: string;
};

function Navbar({ title }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setOpen(!open);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const onSignOut = () => {
    setOpen(false);
    navigate({ to: "/signin" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <nav className="navbar bg-base-100">
      <div className="flex flex-1 items-center">
        <div className="text-base-content link-neutral  font-semibold no-underline text-[23px]">
          {title}
        </div>
      </div>
      <div className="navbar-end flex items-center gap-4">
        <div>
          <button
            className="btn btn-primary btn-block"
            aria-haspopup="dialog"
            aria-expanded={modalOpen}
            onClick={toggleModal}
          >
            <span className="icon-[tabler--plus] size-5"></span>
          </button>
        </div>
        <div className="ml-[10px]">
          <a
            href="https://github.com/pocketenv-io/pocketenv/issues/new"
            className="text-[15px]"
            target="_blank"
          >
            Feedback
          </a>
        </div>
        <div className="ml-[10px]">
          <a
            href="https://docs.pocketenv.io"
            className="text-[15px]"
            target="_blank"
          >
            Docs
          </a>
        </div>
        <div
          ref={dropdownRef}
          className={`dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end] ${
            open ? "open" : ""
          }`}
        >
          <button
            id="dropdown-scrollable"
            type="button"
            className="dropdown-toggle flex items-center"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            aria-label="Dropdown"
            onClick={toggleDropdown}
          >
            <div className="avatar avatar-placeholder">
              <div className="bg-secondary/10  w-10 rounded-full flex items-center justify-center">
                {true && (
                  <img
                    src="https://cdn.bsky.app/img/avatar/plain/did:plc:7vdlgi2bflelz7mmuxoqjfcr/bafkreiebrezrvxt3istx4i4x3wqsfyle4shfetwq6nmlykoputyyqqe5ri@jpeg"
                    alt="avatar 1"
                  />
                )}
                {false && <span className="icon-[tabler--user] size-5 "></span>}
              </div>
            </div>
          </button>
          <ul
            className={`dropdown-menu dropdown-open:opacity-100 absolute right-0 top-full mt-2 min-w-60 z-50 ${
              open ? "" : "hidden"
            }`}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="dropdown-avatar"
          >
            <li className="dropdown-header gap-2">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img
                    src="https://cdn.bsky.app/img/avatar/plain/did:plc:7vdlgi2bflelz7mmuxoqjfcr/bafkreiebrezrvxt3istx4i4x3wqsfyle4shfetwq6nmlykoputyyqqe5ri@jpeg"
                    alt="avatar"
                  />
                </div>
              </div>
              <div>
                <h6 className="text-base-content text-base font-semibold">
                  Tsiry Sandratraina
                </h6>
                <small className="text-base-content/50">
                  @tsiry-sandratraina.com
                </small>
              </div>
            </li>
            <li>
              <a className="dropdown-item" href="/">
                <span className="icon-[tabler--layout-dashboard]"></span>
                Dashboard
              </a>
            </li>
            <li>
              <Link className="dropdown-item" to="/settings">
                <span className="icon-[tabler--settings]"></span>
                Settings
              </Link>
            </li>
            <li>
              <a className="dropdown-item" href="/faqs">
                <span className="icon-[tabler--help-triangle]"></span>
                FAQs
              </a>
            </li>
            <li className="dropdown-footer gap-2">
              <button className="btn btn-primary btn-block" onClick={onSignOut}>
                <span className="icon-[tabler--logout]"></span>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
      <NewProject
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </nav>
  );
}

export default Navbar;
