import { Moon, Sun } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarStore } from "@/stores/sidebar-store";

interface ThemeOption {
  id:
    | "default"
    | "deep"
    | "wind"
    | "candy"
    | "shad"
    | "yellow"
    | "purple"
    | "aqua";
  name: string;
  description: string;
  colors: {
    light: string;
    dark: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: "default",
    name: "Sunset",
    description: "Warm orange to pink gradient",
    colors: {
      light: "linear-gradient(135deg, #f97316, #ec4899)",
      dark: "linear-gradient(135deg, #ea580c, #db2777)",
    },
  },
  {
    id: "deep",
    name: "Ocean",
    description: "Deep blue marine tones",
    colors: {
      light: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
      dark: "linear-gradient(135deg, #0284c7, #2563eb)",
    },
  },
  {
    id: "wind",
    name: "Forest",
    description: "Soft green nature vibes",
    colors: {
      light: "linear-gradient(135deg, #10b981, #059669)",
      dark: "linear-gradient(135deg, #059669, #047857)",
    },
  },
  {
    id: "candy",
    name: "Candy",
    description: "Sweet pink pastels",
    colors: {
      light: "linear-gradient(135deg, #f472b6, #ec4899)",
      dark: "linear-gradient(135deg, #ec4899, #db2777)",
    },
  },
  {
    id: "shad",
    name: "Monochrome",
    description: "Pure black and white",
    colors: {
      light: "linear-gradient(135deg, #ffffff, #f5f5f5)",
      dark: "linear-gradient(135deg, #09090b, #171717)",
    },
  },
  {
    id: "yellow",
    name: "Sunshine",
    description: "Bright yellow energy",
    colors: {
      light: "linear-gradient(135deg, #eab308, #f59e0b)",
      dark: "linear-gradient(135deg, #ca8a04, #d97706)",
    },
  },
  {
    id: "purple",
    name: "Violet",
    description: "Royal purple elegance",
    colors: {
      light: "linear-gradient(135deg, #a855f7, #8b5cf6)",
      dark: "linear-gradient(135deg, #9333ea, #7c3aed)",
    },
  },
  {
    id: "aqua",
    name: "Aqua",
    description: "Fresh teal waters",
    colors: {
      light: "linear-gradient(135deg, #14b8a6, #06b6d4)",
      dark: "linear-gradient(135deg, #0d9488, #0891b2)",
    },
  },
];

export function AppearanceTab() {
  const { baseTheme, toggleBaseTheme, accentTheme } = useTheme();
  const { updatePreference, isLoading, preferences } = usePreferences();
  const { isOpen: showSidebar, toggle: toggleSidebar } = useSidebarStore();

  const setAccentTheme = (themeId: string) => {
    if (themeId !== accentTheme) {
      updatePreference("theme", themeId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Theme Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card
            variant={baseTheme === "light" ? "glass" : "default"}
            padding="md"
            onClick={() => baseTheme === "dark" && toggleBaseTheme()}
            className={`cursor-pointer transition-all duration-200 ${
              baseTheme === "light"
                ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center">
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  Light Mode
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Bright and clean
                </div>
              </div>
            </div>
          </Card>

          <Card
            variant={baseTheme === "dark" ? "glass" : "default"}
            padding="md"
            onClick={() => baseTheme === "light" && toggleBaseTheme()}
            className={`cursor-pointer transition-all duration-200 ${
              baseTheme === "dark"
                ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  Dark Mode
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Easy on the eyes
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Color Themes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Color Theme
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {themeOptions.map((theme) => (
            <Card
              key={theme.id}
              variant={accentTheme === theme.id ? "glass" : "default"}
              padding="md"
              onClick={() => setAccentTheme(theme.id)}
              className={`cursor-pointer group transition-all duration-200 ${
                accentTheme === theme.id
                  ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                  : "hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm border border-white/30 dark:border-gray-600/30"
                    style={{ background: theme.colors[baseTheme] }}
                  />
                  {accentTheme === theme.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={`font-medium text-sm sm:text-base ${
                      accentTheme === theme.id
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {theme.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {theme.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Display Settings
        </h3>
        <div className="space-y-4">
          <Switch
            checked={preferences.showTimestamps}
            onChange={(checked) => updatePreference("showTimestamps", checked)}
            disabled={isLoading}
            label="Show Timestamps"
            description="Display message timestamps in conversations"
          />
          <Switch
            checked={showSidebar}
            onChange={toggleSidebar}
            disabled={isLoading}
            label="Show Sidebar"
            description="Display the sidebar with chat history and navigation"
          />
        </div>
      </div>
    </div>
  );
}
