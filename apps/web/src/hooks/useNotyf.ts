import { useRef } from "react";
import { Notyf } from "notyf";

export function useNotyf() {
  const notyfRef = useRef<Notyf | null>(null);

  if (!notyfRef.current) {
    notyfRef.current = new Notyf({
      duration: 3000,
      position: {
        x: "right",
        y: "bottom",
      },
      types: [
        {
          type: "primary",
          background: "var(--color-primary)",
          icon: {
            className: "icon-[tabler--circle-check] text-white!",
            tagName: "i",
          },
        },
        {
          type: "error",
          background: "var(--color-error)",
          icon: {
            className: "icon-[tabler--circle-x] text-white!",
            tagName: "i",
          },
        },
      ],
    });
  }

  const notyf = notyfRef.current;

  const open = (
    type: string,
    message: string,
    duration = 3000,
    ripple = false,
    dismissible = true,
  ) => {
    notyf.open({
      type,
      message,
      duration,
      ripple,
      dismissible,
    });
  };

  return { open };
}
