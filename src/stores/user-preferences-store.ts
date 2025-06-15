/**
 * Zustand store for user preferences management
 */

import { create } from "zustand";

import { logger } from "@/lib/logger";
import type { User, UserPreferences } from "@/types/graphql";

interface UserPreferencesState {
  // State
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPreferences: (preferences: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeFromUser: (user: User) => void;
  resetToDefaults: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  // Localization
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  dateFormat: "MM/DD/YYYY",
  language: "en",
  use24HourFormat: false,
  useMetricUnits: false,

  // UI Preferences
  showSidebar: true,
  showTimestamps: true,
  smoothAnimations: true,
};

export const useUserPreferencesStore = create<UserPreferencesState>(
  (set, get) => ({
    // Initial state
    preferences: defaultPreferences,
    isLoading: false,
    error: null,

    // Actions
    setPreferences: (preferences: UserPreferences) => {
      set({ preferences });
      logger.debug("User preferences updated in store");
    },

    updatePreference: <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ) => {
      set((state) => ({
        preferences: {
          ...state.preferences,
          [key]: value,
        },
      }));
      logger.debug(`User preference updated: ${String(key)} = ${value}`);
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setError: (error: string | null) => {
      set({ error });
      if (error) {
        logger.error("User preferences error:", error);
      }
    },

    clearError: () => {
      set({ error: null });
    },

    initializeFromUser: (user: User) => {
      const userPreferences = user.preferences || {};
      const mergedPreferences = {
        ...defaultPreferences,
        ...userPreferences,
      };

      set({ preferences: mergedPreferences });
      logger.debug("User preferences initialized from user data", {
        userId: user._id,
        preferences: mergedPreferences,
      });
    },

    resetToDefaults: () => {
      set({ preferences: defaultPreferences });
      logger.info("User preferences reset to defaults");
    },
  })
);