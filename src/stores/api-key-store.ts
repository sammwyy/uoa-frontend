/**
 * Zustand store for API key management
 */

import { create } from "zustand";

import { socketManager } from "@/lib/socket/socket-client";
import { logger } from "../lib/logger";
import { indexedDB } from "../lib/storage/indexed-db";
import type { ApiKey } from "../types";

interface ApiKeyState {
  // State
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setApiKeys: (apiKeys: ApiKey[]) => void;
  addApiKey: (apiKey: ApiKey) => void;
  updateApiKey: (apiKey: ApiKey) => void;
  removeApiKey: (apiKeyId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  syncWithOfflineData: () => Promise<void>;
  cacheData: () => Promise<void>;
}

export const useApiKeyStore = create<ApiKeyState>((set, get) => ({
  // Initial state
  apiKeys: [],
  isLoading: false,
  error: null,

  // Actions
  setApiKeys: (apiKeys: ApiKey[]) => {
    set({ apiKeys });
    get().cacheData();
    logger.debug(`Set ${apiKeys.length} API keys`);
  },

  addApiKey: (apiKey: ApiKey) => {
    set((state) => ({
      apiKeys: [...state.apiKeys, apiKey],
    }));

    get().cacheData();
    logger.debug("Added new API key:", apiKey._id);
  },

  updateApiKey: (apiKey: ApiKey) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((key) =>
        key._id === apiKey._id ? apiKey : key
      ),
    }));

    get().cacheData();
    logger.debug("Updated API key:", apiKey._id);
  },

  removeApiKey: (apiKeyId: string) => {
    set((state) => ({
      apiKeys: state.apiKeys.filter((key) => key._id !== apiKeyId),
    }));

    get().cacheData();
    logger.debug("Removed API key:", apiKeyId);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error("API key store error:", error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  syncWithOfflineData: async () => {
    try {
      const offlineApiKeys = await indexedDB.getApiKeys();

      if (offlineApiKeys.length > 0) {
        set({ apiKeys: offlineApiKeys });
        logger.info(
          `Loaded ${offlineApiKeys.length} API keys from offline storage`
        );
      }
    } catch (error) {
      logger.error("Failed to sync with offline API key data:", error);
    }
  },

  cacheData: async () => {
    try {
      const state = get();
      if (state.apiKeys.length > 0) {
        await indexedDB.storeApiKeys(state.apiKeys);
      }
    } catch (error) {
      logger.error("Failed to cache API key data:", error);
    }
  },
}));

// Setup socket listeners for API key events
socketManager.setListeners({
  "apikey:added": (apiKey: ApiKey) => {
    const { addApiKey } = useApiKeyStore.getState();
    addApiKey(apiKey);
  },
  "apikey:updated": (apiKey: ApiKey) => {
    const { updateApiKey } = useApiKeyStore.getState();
    updateApiKey(apiKey);
  },
  "apikey:deleted": (apiKeyId: string) => {
    const { removeApiKey } = useApiKeyStore.getState();
    removeApiKey(apiKeyId);
  },
});
