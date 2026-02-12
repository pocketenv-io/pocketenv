import flyonui from "flyonui";
import flyonuiPlugin from "flyonui/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flyonui/dist/js/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        rockford: {
          light: ["RockfordSansLight", "sans-serif"],
          regular: ["RockfordSansRegular", "sans-serif"],
          medium: ["RockfordSansMedium", "sans-serif"],
          bold: ["RockfordSansBold", "sans-serif"],
        },
      },
    },
  },
  plugins: [flyonuiPlugin],
  flyonui: {
    themes: [
      {
        light: {
          ...flyonui.themes.light,
          primary: "#6366f1",
          secondary: "#7c3aed",
          accent: "#f59e0b",
          neutral: "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          info: "#3abff8",
          success: "#22c55e",
          warning: "#fbbd23",
          error: "#ef4444",
        },
      },
      {
        dark: {
          ...flyonui.themes.dark,
          primary: "#6366f1",
          secondary: "#7c3aed",
          accent: "#f59e0b",
          neutral: "#06051d",
          "base-100": "#06051d",
          "base-200": "#06051d",
          "base-300": "#06051d",
          "base-content": "#e5e5e5",
          info: "#3abff8",
          success: "#22c55e",
          warning: "#fbbd23",
          error: "#ef4444",
        },
      },
    ],
  },
};
