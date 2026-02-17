import { Link, useNavigate } from "@tanstack/react-router";
import "flyonui/dist/dropdown.js";
import "flyonui/dist/overlay.js";
import { useState, useEffect, useRef } from "react";
import NewProject from "../newproject";
import Logo from "../../assets/logo.png";
import SignIn from "../signin";
import { useCurrentProfileQuery } from "../../hooks/useProfile";

export type NavbarProps = {
  title: string;
  project?: string;
  withLogo?: boolean;
};

function Navbar({ title, project, withLogo }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCurrentProfileQuery();

  const toggleDropdown = () => setOpen(!open);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const onSignOut = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate({ to: "/" });
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

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <nav className="navbar bg-base-100 h-[65px]">
      <div className="flex flex-1 items-center">
        {withLogo && (
          <Link to="/">
            <img src={Logo} className="max-h-[40px] mr-[15px]" />
          </Link>
        )}
        <div className="text-base-content link-neutral  font-semibold no-underline text-[23px]">
          {title}
        </div>
        <div className="text-[15px]">{project}</div>
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
        {isAuthenticated && (
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
                  {profile?.avatar && (
                    <img src={profile.avatar} alt="avatar 1" />
                  )}
                  {!profile?.avatar && (
                    <span className="icon-[tabler--user] size-5 "></span>
                  )}
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
                    {profile?.avatar && (
                      <img src={profile.avatar} alt="avatar 1" />
                    )}
                    {!profile?.avatar && (
                      <span className="icon-[tabler--user] size-5 "></span>
                    )}
                  </div>
                </div>
                <div>
                  {profile?.displayName && (
                    <h6 className="text-base-content text-base font-semibold">
                      {profile.displayName}
                    </h6>
                  )}
                  <small className="text-base-content/50">
                    @{profile?.handle}
                  </small>
                </div>
              </li>
              <li>
                <Link className="dropdown-item" to="/projects">
                  <span className="icon-[tabler--layout-dashboard]"></span>
                  Dashboard
                </Link>
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
                <button
                  className="btn btn-primary btn-block"
                  onClick={onSignOut}
                >
                  <span className="icon-[tabler--logout]"></span>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => setSignInModalOpen(true)}
            className="btn btn-block  bg-blue-600/20 border-none text-blue-500 font-extrabold w-[100px]"
          >
            Sign in
          </button>
        )}
      </div>
      <NewProject
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      />
      <SignIn
        isOpen={signInModalOpen}
        onClose={() => {
          setSignInModalOpen(false);
        }}
      />
    </nav>
  );
}

export default Navbar;
