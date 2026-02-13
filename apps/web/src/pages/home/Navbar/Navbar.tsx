import { Link } from "@tanstack/react-router";
import "flyonui/dist/dropdown.js";

function Navbar() {
  return (
    <nav className="navbar bg-base-100 h-20 max-w-[80%] m-auto mt-0">
      <div className="flex flex-1 items-center">
        <div className=" text-[#ff41b5] font-semibold no-underline text-[23px]">
          Pocketenv
        </div>
      </div>
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
        <div>
          <Link
            to="/signin"
            className="btn btn-block  bg-blue-600/20 border-none text-blue-500 font-extrabold"
          >
            Try Pocketenv
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
