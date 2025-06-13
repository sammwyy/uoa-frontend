import React, { useEffect, useState } from "react";

import { usePersistentState } from "@/hooks/usePersistentState";
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
    "theme-shad"
  );

  // Add current accent theme class
  document.documentElement.classList.add(`theme-${accentTheme}`);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [baseTheme, setBaseTheme] = usePersistentState<BaseTheme>(
    "uoa:baseTheme",
    "light"
  );
  const [accentTheme, setAccentTheme] = usePersistentState<AccentTheme>(
    "upa:theme",
    "default"
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize themes from localStorage
  useEffect(() => {
    const initializeTheme = async () => {
      setIsLoading(true);

      try {
        // Simulate loading time for theme initialization
        await new Promise((resolve) => setTimeout(resolve, 800));

        const savedBaseTheme = localStorage.getItem("baseTheme") as BaseTheme;
        const savedAccentTheme = localStorage.getItem(
          "accentTheme"
        ) as AccentTheme;

        const initialBaseTheme = savedBaseTheme || "light";
        const initialAccentTheme = savedAccentTheme || "default";

        setBaseTheme(initialBaseTheme);
        setAccentTheme(initialAccentTheme);

        // Apply themes immediately
        applyTheme(initialBaseTheme, initialAccentTheme);
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Fallback to defaults
        applyTheme("light", "default");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update base theme
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("baseTheme", baseTheme);
      applyTheme(baseTheme, accentTheme);
    }
  }, [baseTheme, accentTheme, isInitialized]);

  // Update accent theme
  const handleSetAccentTheme = (newAccentTheme: AccentTheme) => {
    setAccentTheme(newAccentTheme);
    if (isInitialized) {
      localStorage.setItem("accentTheme", newAccentTheme);
      applyTheme(baseTheme, newAccentTheme);
    }
  };

  const toggleBaseTheme = () => {
    setBaseTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        baseTheme,
        accentTheme,
        isLoading,
        isInitialized,
        toggleBaseTheme,
        setAccentTheme: handleSetAccentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
