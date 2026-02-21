import { Link, useRouterState } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { sidebarCollapsedAtom } from "../../atoms/sidebar";
import Logo from "../../assets/logo.png";

function Sidebar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

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
        className={`fixed z-50 h-screen bg-base-100 w-64 transition-transform duration-300 ease-in-out ${
          isCollapsed ? "-translate-x-48" : "translate-x-0"
        }`}
        role="dialog"
        tabIndex={-1}
      >
        <div className="drawer-body px-2 pt-4 bg-base-100 h-full">
          <div className="flex items-center">
            <div className="flex-1">
              <Link to="/projects">
                <div className="mb-[30px] ml-[5px]">
                  <img src={Logo} className="max-h-[40px] mr-[15px]" />
                </div>
              </Link>
            </div>
            <button
              className="mb-[25px] opacity-70 hover:opacity-100 transition-opacity"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span
                className={`icon-[hugeicons--panel-left] size-5.5 text-white transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              ></span>
            </button>
          </div>
          <ul className="menu p-0">
            <li>
              <Link
                to="/projects"
                className={
                  isActive("/projects")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                }
                title="Projects"
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
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                }
                title="Snapshots"
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
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                }
                title="Volumes"
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
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                }
                title="Secrets"
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
