import { Link, useNavigate } from "@tanstack/react-router";
import "flyonui/dist/dropdown.js";
import "flyonui/dist/overlay.js";
import { useState, useEffect, useRef } from "react";
import NewProject from "../newproject";
import Logo from "../../assets/logo.png";
import SignIn from "../signin";
import { useCurrentProfileQuery } from "../../hooks/useProfile";
import { useAtom } from "jotai";
import { profileAtom } from "../../atoms/profile";

export type NavbarProps = {
  title: string;
  project?: string;
  withLogo?: boolean;
};

function Navbar({ title, project, withLogo }: NavbarProps) {
  const [, setProfile] = useAtom(profileAtom);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: profile } = useCurrentProfileQuery();

  const toggleDropdown = () => setOpen(!open);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setMobileMenuOpen(false);
  };

  const onSignOut = () => {
    localStorage.removeItem("token");
    setOpen(false);
    setMobileMenuOpen(false);
    navigate({ to: "/" });
  };

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <nav className="navbar bg-base-100 h-[65px] relative">
      {/* Left: Logo + Title */}
      <div className="flex flex-1 items-center min-w-0">
        {withLogo && (
          <Link to="/">
            <img src={Logo} className="max-h-[40px] mr-[15px] flex-shrink-0" />
          </Link>
        )}
        <div className="text-base-content font-semibold no-underline text-[23px] truncate">
          {title}
        </div>
        {project && (
          <div className="text-[15px] ml-1 truncate hidden sm:block">
            {project}
          </div>
        )}
      </div>

      {/* Desktop nav-end */}
      <div className="navbar-end hidden md:flex items-center gap-4">
        <button
          className="btn btn-primary"
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          onClick={toggleModal}
        >
          <span className="icon-[tabler--plus] size-5"></span>
        </button>

        <a
          href="https://github.com/pocketenv-io/pocketenv/issues/new"
          className="text-[15px]"
          target="_blank"
        >
          Feedback
        </a>

        <a
          href="https://docs.pocketenv.io"
          className="text-[15px]"
          target="_blank"
        >
          Docs
        </a>

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
                <div className="bg-secondary/10 w-10 rounded-full flex items-center justify-center">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="avatar" />
                  ) : (
                    <span className="icon-[tabler--user] size-5"></span>
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
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="avatar" />
                    ) : (
                      <span className="icon-[tabler--user] size-5"></span>
                    )}
                  </div>
                </div>
                <div>
                  {profile?.displayName && (
                    <h6 className="text-base-content text-base font-semibold">
                      {profile.displayName}
                    </h6>
                  )}
                  <a
                    href={`https://bsky.app/profile/${profile?.handle}`}
                    target="_blank"
                  >
                    <small className="text-base-content/50">
                      @{profile?.handle}
                    </small>
                  </a>
                </div>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  to="/projects"
                  onClick={() => setOpen(false)}
                >
                  <span className="icon-[tabler--layout-dashboard]"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="https://docs.pocketenv.io/faqs"
                  target="_blank"
                >
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
            className="btn btn-block bg-blue-600/20 border-none text-blue-500 font-extrabold w-[100px]"
          >
            Sign in
          </button>
        )}
      </div>

      <div className="flex md:hidden items-center" ref={mobileMenuRef}>
        <button
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <span className="icon-[tabler--x] size-6"></span>
          ) : (
            <span className="icon-[tabler--menu-2] size-6"></span>
          )}
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-[65px] left-0 right-0 bg-base-100 border-t border-base-300 shadow-lg z-50 flex flex-col py-3 px-4 gap-3">
            {/* New Project */}
            <button
              className="btn btn-primary w-full"
              aria-haspopup="dialog"
              aria-expanded={modalOpen}
              onClick={toggleModal}
            >
              <span className="icon-[tabler--plus] size-5"></span>
              New Project
            </button>

            <a
              href="https://github.com/pocketenv-io/pocketenv/issues/new"
              className="flex items-center gap-2 text-[15px] py-2 px-3 rounded-lg hover:bg-base-200 transition-colors"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="icon-[tabler--message-circle] size-5"></span>
              Feedback
            </a>

            <a
              href="https://docs.pocketenv.io"
              className="flex items-center gap-2 text-[15px] py-2 px-3 rounded-lg hover:bg-base-200 transition-colors"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="icon-[tabler--book] size-5"></span>
              Docs
            </a>

            <div className="divider my-1"></div>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="avatar avatar-placeholder">
                    <div className="bg-secondary/10 w-10 rounded-full flex items-center justify-center">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="avatar" />
                      ) : (
                        <span className="icon-[tabler--user] size-5"></span>
                      )}
                    </div>
                  </div>
                  <div>
                    {profile?.displayName && (
                      <p className="text-base-content font-semibold text-sm">
                        {profile.displayName}
                      </p>
                    )}
                    <a
                      href={`https://bsky.app/profile/${profile?.handle}`}
                      target="_blank"
                    >
                      <small className="text-base-content/50">
                        @{profile?.handle}
                      </small>
                    </a>
                  </div>
                </div>

                <Link
                  className="flex items-center gap-2 text-[15px] py-2 px-3 rounded-lg hover:bg-base-200 transition-colors"
                  to="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="icon-[tabler--layout-dashboard] size-5"></span>
                  Dashboard
                </Link>

                <a
                  className="flex items-center gap-2 text-[15px] py-2 px-3 rounded-lg hover:bg-base-200 transition-colors"
                  href="https://docs.pocketenv.io/faqs"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="icon-[tabler--help-triangle] size-5"></span>
                  FAQs
                </a>

                <button
                  className="btn btn-primary btn-block mt-1"
                  onClick={onSignOut}
                >
                  <span className="icon-[tabler--logout]"></span>
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setSignInModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="btn btn-block bg-blue-600/20 border-none text-blue-500 font-extrabold"
              >
                Sign in
              </button>
            )}
          </div>
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
