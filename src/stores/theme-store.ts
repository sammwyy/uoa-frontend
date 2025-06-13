import { create } from "zustand";
import { persist } from "zustand/middleware";

type BaseTheme = "light" | "dark";
type AccentTheme = "default" | "deep" | "wind" | "candy" | "shad";

interface ThemeStore {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  toggleBaseTheme: () => void;
  setAccentTheme: (theme: AccentTheme) => void;
}

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

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      baseTheme: "light",
      accentTheme: "default",

      toggleBaseTheme: () => {
        const { baseTheme, accentTheme } = get();
        const newBaseTheme = baseTheme === "light" ? "dark" : "light";

        applyTheme(newBaseTheme, accentTheme);
        set({ baseTheme: newBaseTheme });
      },

      setAccentTheme: (newAccentTheme: AccentTheme) => {
        const { baseTheme } = get();

        applyTheme(baseTheme, newAccentTheme);
        set({ accentTheme: newAccentTheme });
      },
    }),
    {
      name: "uoa:theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          applyTheme(state.baseTheme, state.accentTheme);
        }
      },
    }
  )
);
