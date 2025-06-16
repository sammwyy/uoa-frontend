import React, { useEffect } from "react";

import { usePersistentState } from "@/hooks/usePersistentState";
import { usePreferences } from "@/hooks/usePreferences";
import { AccentTheme, BaseTheme, ThemeContext } from "@/hooks/useTheme";

const applyTheme = (baseTheme: BaseTheme, accentTheme: AccentTheme) => {
  // Apply base theme (dark mode)
  document.documentElement.classList.toggle("dark", baseTheme === "dark");

  // Remove all theme classes
  document.documentElement.classList.remove(
    "theme-default",
    "theme-deep",
    "theme-wind",
    "theme-candy",
    "theme-shad",
    "theme-yellow",
    "theme-purple",
    "theme-aqua"
  );

  // Add current accent theme class
  document.documentElement.classList.add(`theme-${accentTheme}`);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { preferences } = usePreferences();

  const [baseTheme, setBaseTheme] = usePersistentState<BaseTheme>(
    "uoa:baseTheme",
    "light"
  );
  const accentTheme: AccentTheme =
    (preferences?.theme as AccentTheme) || "default";

  // Initialize themes from localStorage
  useEffect(() => {
    applyTheme(baseTheme, accentTheme);
  }, [accentTheme, baseTheme]);

  const toggleBaseTheme = () => {
    setBaseTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        baseTheme,
        accentTheme,
        toggleBaseTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
