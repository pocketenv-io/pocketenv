import { useEffect, useRef, useState } from "react";

function ContextMenu() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const onOpenContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const onAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const onAddSecret = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const onAddEnvironmentVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const onAddVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className={`dropdown relative inline-flex items-center [--auto-close:inside] [--offset:8] [--placement:bottom-end] ${
          open ? "open" : ""
        }`}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open ? "true" : "false"}
          aria-label="Dropdown"
          className="dropdown-toggle btn btn-circle btn-text btn-sm bg-transparent outline-0 flex items-center"
          onClick={onOpenContextMenu}
        >
          <span className="icon-[tabler--dots-vertical] size-5 hover:text-white block mx-auto"></span>
        </button>
        <ul
          className={`dropdown-menu dropdown-open:opacity-100 absolute right-0 top-full mt-2 min-w-60 z-50 ${
            open ? "" : "hidden"
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-avatar"
        >
          <li>
            <div className="dropdown-item" onClick={onAddFile}>
              Add File
            </div>
          </li>
          <li>
            <div className="dropdown-item" onClick={onAddSecret}>
              Add Secret
            </div>
          </li>
          <li>
            <div className="dropdown-item" onClick={onAddEnvironmentVariable}>
              Add Environment Variable
            </div>
          </li>
          <li>
            <div className="dropdown-item" onClick={onAddVolume}>
              Add Volume
            </div>
          </li>
          <li>
            <div className="dropdown-item" onClick={onDelete}>
              Delete
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}

export default ContextMenu;
