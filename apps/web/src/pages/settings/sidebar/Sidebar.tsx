import { Link, useRouterState } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { sidebarCollapsedAtom } from "../../../atoms/sidebar";
import Logo from "../../../assets/logo.png";

function Sidebar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const did = pathname.split("/")[1];
  const rkey = pathname.split("/")[3];

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Check if a route is active
  const isActive = (path: string): boolean => {
    return pathname.split("/")[4] === path.split("/")[1];
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
                to={`/${did}/sandbox/${rkey}/settings`}
                className={`${
                  isActive("/settings")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "General" : undefined}
              >
                <span
                  className={`icon-[codicon--settings] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "General"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/repository`}
                className={`${
                  isActive("/repository")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Git Repository" : undefined}
              >
                <span
                  className={`icon-[lucide--folder-git] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Git Repository"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/integrations`}
                className={`${
                  isActive("/integrations")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Integrations" : undefined}
              >
                <span
                  className={`icon-[hugeicons--webhook] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Integrations"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/variables`}
                className={`${
                  isActive("/variables")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Secrets" : undefined}
              >
                <span
                  className={`icon-[hugeicons--bash] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Variables"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/secrets`}
                className={`${
                  isActive("/secrets")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Secrets" : undefined}
              >
                <span
                  className={`icon-[material-symbols--lock-outline] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Secrets"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/files`}
                className={`${
                  isActive("/files")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Files" : undefined}
              >
                <span
                  className={`icon-[pepicons-pencil--file] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "Files"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/volumes`}
                className={`${
                  isActive("/volumes")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Volumes" : undefined}
              >
                <span
                  className={`icon-[icon-park-outline--hard-disk] size-5 ${isCollapsed ? "" : "mr-2 ml-1"}`}
                ></span>
                {!isCollapsed && "Volumes"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/ssh-keys`}
                className={`${
                  isActive("/ssh-keys")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "SSH Keys" : undefined}
              >
                <span
                  className={`icon-[tabler--key] size-6 ${isCollapsed ? "" : "mr-2"}`}
                ></span>
                {!isCollapsed && "SSH Keys"}
              </Link>
            </li>
            <li>
              <Link
                to={`/${did}/sandbox/${rkey}/tailscale`}
                className={`${
                  isActive("/tailscale")
                    ? "active bg-white/7 text-[#00e8c6]! font-semibold rounded-full"
                    : "rounded-full hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? "Tailscale" : undefined}
              >
                <span
                  className={`icon-[simple-icons--tailscale] size-4 ${isCollapsed ? "" : "mr-3 ml-1"}`}
                ></span>
                {!isCollapsed && "Tailscale"}
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
