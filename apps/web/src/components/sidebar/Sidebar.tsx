import { Link, useRouterState } from "@tanstack/react-router";
import Logo from "../../assets/logo.png";

function Sidebar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Check if a route is active
  const isActive = (path: string): boolean => {
    if (path === "/projects") {
      return pathname === "/" || pathname === "/projects";
    }
    return pathname === path;
  };
  return (
    <div>
      <aside
        id="scoped-sidebar"
        className="overlay [--auto-close:sm] sm:shadow-none overlay-open:translate-x-0 drawer drawer-start max-w-64 fixed z-50 sm:flex sm:translate-x-0 [--body-scroll:true] h-screen bg-base-100"
        role="dialog"
        tabIndex="-1"
      >
        <div className="drawer-body px-2 pt-4 bg-base-100">
          <Link to="/projects">
            <div className="mb-[30px] ml-[5px]">
              <img src={Logo} className="max-h-[40px] mr-[15px]" />
            </div>
          </Link>
          <ul className="menu p-0">
            <li>
              <Link
                to="/projects"
                className={
                  isActive("/projects")
                    ? "active bg-white/7 text-[#ff41b5]! font-semibold rounded-full"
                    : "rounded-full"
                }
              >
                <span className="icon-[tabler--box] size-6 mr-2"></span>
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/snapshots"
                className={
                  isActive("/snapshots")
                    ? "active bg-white/7 text-[#ff41b5]! font-semibold rounded-full"
                    : "rounded-full"
                }
              >
                <span className="icon-[tabler--device-floppy] size-6 mr-2"></span>
                Snapshots
              </Link>
            </li>
            <li>
              <Link
                to="/volumes"
                className={
                  isActive("/volumes")
                    ? "active bg-white/7 text-[#ff41b5]! font-semibold rounded-full"
                    : "rounded-full"
                }
              >
                <span className="icon-[icon-park-outline--hard-disk] size-5 mr-2"></span>
                Volumes
              </Link>
            </li>
            <li>
              <Link
                to="/secrets"
                className={
                  isActive("/secrets")
                    ? "active bg-white/7 text-[#ff41b5]! font-semibold rounded-full"
                    : "rounded-full"
                }
              >
                <span className="icon-[tabler--key] size-6 mr-2"></span>
                Secrets
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      <div id="custom-backdrop-container"></div>
    </div>
  );
}

export default Sidebar;
