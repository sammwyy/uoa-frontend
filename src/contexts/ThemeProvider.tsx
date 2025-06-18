import React, { useEffect } from "react";

import { usePersistentState } from "@/hooks/usePersistentState";
import { usePreferences } from "@/hooks/usePreferences";
import { AccentTheme, BaseTheme, ThemeContext } from "@/hooks/useTheme";
import { logger } from "@/lib/logger";

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

  logger.debug("Applied theme:", { baseTheme, accentTheme });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { preferences, isInitialized } = usePreferences();

  const [baseTheme, setBaseTheme] = usePersistentState<BaseTheme>(
    "uoa:baseTheme",
    "light"
  );
  const accentTheme: AccentTheme =
    (preferences?.theme as AccentTheme) || "default";

  // Apply themes when preferences are loaded or changed
  useEffect(() => {
    if (isInitialized) {
      applyTheme(baseTheme, accentTheme);
      logger.info("Theme updated from preferences:", {
        baseTheme,
        accentTheme,
      });
    } else {
      applyTheme(baseTheme, "default"); // Apply default theme immediately
    }

    console.log("Theme changed:", { baseTheme, accentTheme, isInitialized });
  }, [accentTheme, baseTheme, isInitialized]);

  const toggleBaseTheme = () => {
    const newTheme = baseTheme === "light" ? "dark" : "light";
    setBaseTheme(newTheme);
    logger.info("Base theme toggled to:", newTheme);
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
