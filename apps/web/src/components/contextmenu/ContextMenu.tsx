import { useEffect, useRef, useState } from "react";
import AddEnvironmentVariableModal from "./AddEnvironmentVariableModal";
import AddFileModal from "./AddFileModal";
import AddVolumeModal from "./AddVolumeModal";
import DeleteSandboxModal from "./DeleteSandboxModal";
import AddSecretModal from "./AddSecretModal";

type ContextMenuProps = {
  sandboxId: string;
};

function ContextMenu({ sandboxId }: ContextMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [
    isAddEnvironmentVariableModalOpen,
    setIsAddEnvironmentVariableModalOpen,
  ] = useState(false);
  const [isDeleteSandboxModalOpen, setIsDeleteSandboxModalOpen] =
    useState(false);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [isAddSecretModalOpen, setIsAddSecretModalOpen] = useState(false);
  const [isAddVolumeModalOpen, setIsAddVolumeModalOpen] = useState(false);

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
    setIsAddFileModalOpen(true);
  };

  const onAddSecret = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setIsAddSecretModalOpen(true);
  };

  const onAddVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setIsAddEnvironmentVariableModalOpen(true);
  };

  const onAddVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setIsAddVolumeModalOpen(true);
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setIsDeleteSandboxModalOpen(true);
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
            <div className="dropdown-item cursor-pointer" onClick={onAddFile}>
              Add File
            </div>
          </li>
          <li>
            <div className="dropdown-item cursor-pointer" onClick={onAddSecret}>
              Add Secret
            </div>
          </li>
          <li>
            <div
              className="dropdown-item cursor-pointer"
              onClick={onAddVariable}
            >
              Add Variable
            </div>
          </li>
          <li>
            <div className="dropdown-item cursor-pointer" onClick={onAddVolume}>
              Add Volume
            </div>
          </li>
          <li>
            <div className="dropdown-item cursor-pointer" onClick={onDelete}>
              Delete
            </div>
          </li>
          <li>
            <a href="/settings" className="dropdown-item cursor-pointer">
              Settings
            </a>
          </li>
        </ul>
      </div>
      <AddEnvironmentVariableModal
        isOpen={isAddEnvironmentVariableModalOpen}
        onClose={() => setIsAddEnvironmentVariableModalOpen(false)}
        sandboxId={sandboxId}
      />
      <AddFileModal
        isOpen={isAddFileModalOpen}
        onClose={() => setIsAddFileModalOpen(false)}
        sandboxId={sandboxId}
      />
      <AddVolumeModal
        isOpen={isAddVolumeModalOpen}
        onClose={() => setIsAddVolumeModalOpen(false)}
        sandboxId={sandboxId}
      />
      <AddSecretModal
        isOpen={isAddSecretModalOpen}
        onClose={() => setIsAddSecretModalOpen(false)}
        sandboxId={sandboxId}
      />
      <DeleteSandboxModal
        isOpen={isDeleteSandboxModalOpen}
        onClose={() => setIsDeleteSandboxModalOpen(false)}
        sandboxId={sandboxId}
      />
    </>
  );
}

export default ContextMenu;
