import "flyonui/dist/dropdown.js";
import NewProject from "../../../components/newproject";
import Logo from "../../../assets/logo.png";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

function Navbar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar bg-base-100 h-20 max-w-[80%] m-auto mt-0 relative">
        {/* Logo */}
        <Link to="/">
          <img src={Logo} className="max-h-[40px] mr-[15px]" />
        </Link>

        <div className="flex flex-1 items-center" />

        {/* Desktop menu */}
        <div className="navbar-end hidden md:flex items-center gap-4">
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
          <a href="https://github.com/pocketenv-io/pocketenv" target="_blank">
            <span className="icon-[mdi--github] size-7 mt-[8px]" />
          </a>
          <a href="https://discord.gg/9ada4pFUFS" target="_blank">
            <span className="icon-[line-md--discord] size-7 mt-[8px]" />
          </a>
          <Link to="/signin" className="text-[15px]">
            Login
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-block bg-blue-600/20 border-none text-blue-500 font-extrabold w-[128px]"
          >
            Try Pocketenv
          </button>
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <span className="icon-[mdi--close] size-7" />
          ) : (
            <span className="icon-[mdi--menu] size-7" />
          )}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-base-100 max-w-[80%] m-auto flex flex-col gap-4 px-4 pb-5 pt-2 border-t border-base-200 rounded-b-xl shadow-lg">
          <a
            href="https://github.com/pocketenv-io/pocketenv/issues/new"
            className="text-[15px]"
            target="_blank"
            onClick={() => setMenuOpen(false)}
          >
            Feedback
          </a>
          <a
            href="https://docs.pocketenv.io"
            className="text-[15px]"
            target="_blank"
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </a>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pocketenv-io/pocketenv"
              target="_blank"
              aria-label="GitHub"
            >
              <span className="icon-[mdi--github] size-7" />
            </a>
            <a
              href="https://discord.gg/9ada4pFUFS"
              target="_blank"
              aria-label="Discord"
            >
              <span className="icon-[line-md--discord] size-7" />
            </a>
          </div>
          <Link
            to="/signin"
            className="text-[15px]"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              setModalOpen(true);
            }}
            className="btn btn-block bg-blue-600/20 border-none text-blue-500 font-extrabold"
          >
            Try Pocketenv
          </button>
        </div>
      )}

      <NewProject isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default Navbar;
