import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { Preferences } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";

// Default preferences - these won't be sent to server unless explicitly changed
export const DEFAULT_PREFERENCES: Required<Preferences> = {
  // Localization
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  dateFormat: "MM/dd/yyyy",
  language: "en",
  use24HourFormat: false,
  useMetricUnits: true,

  // UI Preferences
  showTimestamps: true,
  theme: "system",
};

interface PreferencesState {
  // State
  serverPreferences: Partial<Preferences>; // What we got from server
  clientPreferences: Required<Preferences>; // Merged: server + defaults (what client uses)
  pendingChanges: Partial<Preferences>; // Changes waiting to be sent to server
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastSyncedAt: number | null;

  // State actions (pure)
  setServerPreferences: (preferences: Partial<Preferences>) => void;
  updateClientPreferences: (preferences: Partial<Preferences>) => void;
  setPendingChanges: (changes: Partial<Preferences>) => void;
  clearPendingChanges: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: (initialized: boolean) => void;
  setLastSyncedAt: (timestamp: number) => void;

  // Cache actions
  loadFromCache: () => Promise<void>;
  saveToCache: () => Promise<void>;
  reset: () => void;

  // Computed getters
  getPreference: <K extends keyof Preferences>(
    key: K
  ) => Required<Preferences>[K];
  hasUnsavedChanges: () => boolean;
}

const CACHE_KEY = "user_preferences";
const CACHE_TIMESTAMP_KEY = "user_preferences_timestamp";

export const usePreferencesStore = create<PreferencesState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    serverPreferences: {},
    clientPreferences: { ...DEFAULT_PREFERENCES },
    pendingChanges: {},
    isLoading: false,
    error: null,
    isInitialized: false,
    lastSyncedAt: null,

    // Set preferences received from server
    setServerPreferences: (preferences: Partial<Preferences>) => {
      const merged = { ...DEFAULT_PREFERENCES, ...preferences };

      set({
        serverPreferences: preferences,
        clientPreferences: merged,
        lastSyncedAt: Date.now(),
      });

      logger.debug("Set server preferences:", preferences);
    },

    // Update client preferences (user changes)
    updateClientPreferences: (preferences: Partial<Preferences>) => {
      set((state) => {
        const newClientPrefs = { ...state.clientPreferences, ...preferences };

        // Calculate what changed from server defaults
        const changes: Preferences = {};

        Object.keys(preferences).forEach((key) => {
          const prefKey = key as keyof Preferences;
          const newValue = newClientPrefs[prefKey];
          const serverValue = state.serverPreferences[prefKey];
          const defaultValue = DEFAULT_PREFERENCES[prefKey];

          // Only track as pending if it's different from server AND not just reverting to default
          if (
            newValue !== undefined &&
            newValue !== serverValue &&
            !(serverValue === undefined && newValue === defaultValue)
          ) {
            changes[prefKey] = newValue as never;
          }
        });

        return {
          clientPreferences: newClientPrefs,
          pendingChanges: { ...state.pendingChanges, ...changes },
        };
      });

      logger.debug("Updated client preferences:", preferences);
    },

    // Set pending changes (for manual control)
    setPendingChanges: (changes: Partial<Preferences>) => {
      set({ pendingChanges: changes });
    },

    // Clear pending changes (after successful sync)
    clearPendingChanges: () => {
      set({ pendingChanges: {} });
    },

    // Loading state
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    // Error state
    setError: (error: string | null) => {
      set({ error });
      if (error) {
        logger.error("Preferences store error:", error);
      }
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Set initialization state
    setInitialized: (initialized: boolean) => {
      set({ isInitialized: initialized });
    },

    // Set last synced timestamp
    setLastSyncedAt: (timestamp: number) => {
      set({ lastSyncedAt: timestamp });
    },

    // Load preferences from cache
    loadFromCache: async () => {
      try {
        const cachedPrefs = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cachedPrefs) {
          const serverPrefs: Partial<Preferences> = JSON.parse(cachedPrefs);
          const timestamp = cachedTimestamp
            ? parseInt(cachedTimestamp, 10)
            : null;

          const merged = { ...DEFAULT_PREFERENCES, ...serverPrefs };

          set({
            serverPreferences: serverPrefs,
            clientPreferences: merged,
            lastSyncedAt: timestamp,
            isInitialized: true,
          });

          logger.info("Loaded preferences from cache:", serverPrefs);
        } else {
          set({ isInitialized: true });
          logger.info("No cached preferences found, using defaults");
        }
      } catch (error) {
        logger.error("Failed to load preferences from cache:", error);
        set({
          error: "Failed to load preferences from cache",
          isInitialized: true,
        });
      }
    },

    // Save current server preferences to cache
    saveToCache: async () => {
      try {
        const { serverPreferences, lastSyncedAt } = get();
        localStorage.setItem(CACHE_KEY, JSON.stringify(serverPreferences));
        if (lastSyncedAt) {
          localStorage.setItem(CACHE_TIMESTAMP_KEY, lastSyncedAt.toString());
        }
        logger.debug("Saved preferences to cache");
      } catch (error) {
        logger.error("Failed to save preferences to cache:", error);
      }
    },

    // Reset store to initial state
    reset: () => {
      set({
        serverPreferences: {},
        clientPreferences: { ...DEFAULT_PREFERENCES },
        pendingChanges: {},
        isLoading: false,
        error: null,
        isInitialized: false,
        lastSyncedAt: null,
      });

      // Clear cache
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);

      logger.debug("Preferences store reset");
    },

    // Get a specific preference value (always returns the client value)
    getPreference: <K extends keyof Preferences>(
      key: K
    ): Required<Preferences>[K] => {
      return get().clientPreferences[key];
    },

    // Check if there are unsaved changes
    hasUnsavedChanges: (): boolean => {
      return Object.keys(get().pendingChanges).length > 0;
    },
  }))
);

// Socket event listeners for real-time preference updates
socketManager.setListeners({
  "preferences:updated": (preferences: Partial<Preferences>) => {
    const { setServerPreferences, saveToCache } =
      usePreferencesStore.getState();
    setServerPreferences(preferences);
    saveToCache();
    logger.debug("Socket: Preferences updated", preferences);
  },
});
