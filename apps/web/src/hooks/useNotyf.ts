import { Notyf } from "notyf";

export function useNotyf() {
  const notyf = new Notyf({
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
