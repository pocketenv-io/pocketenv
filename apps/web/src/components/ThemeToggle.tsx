import { useTheme } from "../hooks/useTheme";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle btn-ghost swap swap-rotate"
      aria-label="Toggle theme"
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        className="hidden"
      />

      {/* Sun icon for light mode */}
      <IconSun
        className={`swap-on h-6 w-6 transition-transform ${
          isDark ? "rotate-0" : "rotate-90"
        }`}
      />

      {/* Moon icon for dark mode */}
      <IconMoon
        className={`swap-off h-6 w-6 transition-transform ${
          isDark ? "rotate-90" : "rotate-0"
        }`}
      />
    </button>
  );
}
