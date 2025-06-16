import { createContext, useContext } from "react";

export type BaseTheme = "light" | "dark";
export type AccentTheme =
  | "default"
  | "deep"
  | "wind"
  | "candy"
  | "shad"
  | "yellow"
  | "purple"
  | "aqua";

interface ThemeContextType {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  toggleBaseTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
