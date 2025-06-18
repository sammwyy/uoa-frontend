import { useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  GET_PREFERENCES_QUERY,
  UPDATE_PREFERENCES_MUTATION,
} from "@/lib/apollo/queries";
import { Preferences } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useConnectionStore } from "@/stores/connection-store";
import {
  DEFAULT_PREFERENCES,
  usePreferencesStore,
} from "@/stores/preferences-store";

export const usePreferences = () => {
  const store = usePreferencesStore();
  const { isOnline } = useConnectionStore();
  const { i18n } = useTranslation();

  // Query for loading preferences (cache-first)
  const {
    data: preferencesQueryData,
    error: preferencesQueryError,
    refetch: refetchPreferences,
    loading: queryLoading,
  } = useQuery(GET_PREFERENCES_QUERY, {
    fetchPolicy: "cache-first", // Cache-first strategy
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: false,
  });

  // Mutation for updating preferences
  const [updatePreferencesMutation] = useMutation(UPDATE_PREFERENCES_MUTATION);

  // Initialize store on mount (load from cache immediately)
  useEffect(() => {
    if (!store.isInitialized) {
      store.loadFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync language with i18next when preferences change
  useEffect(() => {
    const currentLanguage = store.clientPreferences.language;
    if (currentLanguage && i18n.language !== currentLanguage) {
      logger.info("Syncing language with i18next:", currentLanguage);
      i18n.changeLanguage(currentLanguage);
    }
  }, [store.clientPreferences.language, i18n]);

  // Sync server data when available and compare with cache
  useEffect(() => {
    if (preferencesQueryData?.getPreferences && !preferencesQueryError) {
      const serverPrefs: Partial<Preferences> =
        preferencesQueryData.getPreferences;

      // Check if server data is different from what we have
      const currentServerPrefs = store.serverPreferences;
      const serverDataChanged =
        JSON.stringify(serverPrefs) !== JSON.stringify(currentServerPrefs);

      if (serverDataChanged) {
        logger.info("Server preferences differ from cache, updating");
        store.setServerPreferences(serverPrefs);
        store.saveToCache();
      } else {
        // Just update the sync timestamp
        store.setLastSyncedAt(Date.now());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesQueryData, preferencesQueryError]);

  // Auto-refetch when connection is restored
  useEffect(() => {
    if (isOnline && store.isInitialized) {
      logger.info("Connection restored, syncing preferences");
      refetchPreferences().catch((error) => {
        logger.warn("Failed to sync preferences after reconnection:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, store.isInitialized]);

  // Update a preference (local + prepare for server sync)
  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    store.updateClientPreferences({ [key]: value } as Partial<Preferences>);
    logger.debug(`Updated preference ${key}:`, value);
  };

  // Update multiple preferences at once
  const updatePreferences = (preferences: Partial<Preferences>) => {
    store.updateClientPreferences(preferences);
    logger.debug("Updated multiple preferences:", preferences);
  };

  // Sync pending changes with server
  const syncWithServer = async (): Promise<boolean> => {
    if (!isOnline) {
      logger.warn("Cannot sync preferences: offline");
      return false;
    }

    const { pendingChanges } = store;

    if (Object.keys(pendingChanges).length === 0) {
      logger.debug("No pending changes to sync");
      return true;
    }

    try {
      store.setLoading(true);
      store.clearError();

      logger.info("Syncing preferences with server:", pendingChanges);

      const { data } = await updatePreferencesMutation({
        variables: { payload: pendingChanges },
      });

      if (!data?.updatePreferences) {
        throw new Error("Failed to update preferences: No data returned");
      }

      const updatedPrefs: Partial<Preferences> = data.updatePreferences;

      // Update server state and clear pending changes
      store.setServerPreferences(updatedPrefs);
      store.clearPendingChanges();

      // Cache the updated data
      await store.saveToCache();

      logger.info("Preferences synced successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync preferences";
      store.setError(errorMessage);
      logger.error("Failed to sync preferences:", error);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  // Auto-sync pending changes (debounced)
  useEffect(() => {
    if (!isOnline || Object.keys(store.pendingChanges).length === 0) {
      return;
    }

    // Debounce auto-sync by 2 seconds
    const timeoutId = setTimeout(() => {
      syncWithServer().catch((error) => {
        logger.warn("Auto-sync failed:", error);
      });
    }, 250);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.pendingChanges, isOnline]);

  // Force sync with server (manual)
  const forceSyncWithServer = async (): Promise<boolean> => {
    if (!isOnline) {
      logger.warn("Cannot force sync: offline");
      return false;
    }

    try {
      store.setLoading(true);

      // First, sync any pending changes
      const syncSuccess = await syncWithServer();

      // Then, refetch from server to ensure we have latest
      await refetchPreferences();

      logger.info("Force sync completed");
      return syncSuccess;
    } catch (error) {
      logger.error("Force sync failed:", error);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  // Reset preferences to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.clearError();

      // Reset client to defaults
      store.updateClientPreferences(DEFAULT_PREFERENCES);

      // If online, sync the reset with server
      if (isOnline) {
        return await syncWithServer();
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset preferences";
      store.setError(errorMessage);
      logger.error("Failed to reset preferences:", error);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    // State
    preferences: store.clientPreferences,
    serverPreferences: store.serverPreferences,
    pendingChanges: store.pendingChanges,
    isLoading: store.isLoading || queryLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    hasUnsavedChanges: store.hasUnsavedChanges(),
    lastSyncedAt: store.lastSyncedAt,
    isOnline,

    // Actions
    updatePreference,
    updatePreferences,
    syncWithServer,
    forceSyncWithServer,
    resetToDefaults,
    clearError: store.clearError,

    // Getters
    getPreference: store.getPreference,
  };
};