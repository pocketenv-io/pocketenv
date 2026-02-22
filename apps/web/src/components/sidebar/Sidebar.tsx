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
        className={`fixed z-50 h-screen bg-base-100 ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
        role="dialog"
        tabIndex={-1}
      >
        <div className="drawer-body px-2 pt-4 bg-base-100 overflow-hidden">
          <div className="flex items-center">
            {!isCollapsed && (
              <div className="flex-1">
                <Link to="/projects">
                  <div className="mb-[30px] ml-[5px]">
                    <img src={Logo} className="max-h-[40px] mr-[15px]" />
                  </div>
                </Link>
              </div>
            )}
            <button
              className={`mb-[25px] opacity-70 hover:opacity-100 ${
                isCollapsed ? "mx-auto mt-2" : ""
              }`}
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span
                className={`icon-[hugeicons--panel-left] size-5.5 text-white ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              ></span>
            </button>
          </div>
          <ul className="menu p-0">
            <li>
              <Link
                to="/projects"
                className={`${
                  isActive("/projects")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Projects" : undefined}
              >
                <span
                  className={`icon-[tabler--box] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Projects"}
              </Link>
            </li>
            <li>
              <Link
                to="/volumes"
                className={`${
                  isActive("/volumes")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Volumes" : undefined}
              >
                <span
                  className={`icon-[icon-park-outline--hard-disk] size-5 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Volumes"}
              </Link>
            </li>
            <li>
              <Link
                to="/secrets"
                className={`${
                  isActive("/secrets")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Secrets" : undefined}
              >
                <span
                  className={`icon-[tabler--key] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Secrets"}
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
