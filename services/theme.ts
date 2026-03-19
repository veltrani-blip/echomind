import { Platform } from "react-native";

// 🎯 PALETA PREMIUM (dark-first)
const primary = "#6C63FF"; // roxo sofisticado
const backgroundDark = "#0D0F14";
const backgroundLight = "#F7F8FA";

export const Colors = {
  light: {
    text: "#0D0F14",
    background: backgroundLight,
    primary: primary,
    secondary: "#A1A6B3",
    border: "#E5E7EB",
    card: "#FFFFFF",
    muted: "#6B7280",
  },

  dark: {
    text: "#E6E8EE",
    background: backgroundDark,
    primary: primary,
    secondary: "#8B90A0",
    border: "#1F2430",
    card: "#151922",
    muted: "#6B7280",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    serif: "Georgia, serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
});