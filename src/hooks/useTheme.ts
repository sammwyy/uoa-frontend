import { createContext, useContext } from "react";

export type BaseTheme = "light" | "dark";
export type AccentTheme = "default" | "deep" | "wind" | "candy" | "shad";

interface ThemeContextType {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  isLoading: boolean;
  isInitialized: boolean;
  toggleBaseTheme: () => void;
  setAccentTheme: (theme: AccentTheme) => void;
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
