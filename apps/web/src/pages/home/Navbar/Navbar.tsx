import "flyonui/dist/dropdown.js";
import NewProject from "../../../components/newproject";
import Logo from "../../../assets/logo.png";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

function Navbar() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <nav className="navbar bg-base-100 h-20 max-w-[80%] m-auto mt-0">
      <Link to="/">
        <img src={Logo} className="max-h-[40px] mr-[15px]" />
      </Link>
      <div className="flex flex-1 items-center"></div>
      <div className="navbar-end flex items-center gap-4">
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
        <div className="flex item-center justify-center">
          <a href="https://github.com/pocketenv-io/pocketenv" target="_blank">
            <span className="icon-[mdi--github] size-7 mt-[8px]"></span>
          </a>
        </div>
        <div className="ml-[10px]">
          <Link to="/signin" className="text-[15px]">
            Login
          </Link>
        </div>
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-block  bg-blue-600/20 border-none text-blue-500 font-extrabold"
          >
            Try Pocketenv
          </button>
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
