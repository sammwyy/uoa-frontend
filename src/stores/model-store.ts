/**
 * Zustand store for AI model management
 */

import { create } from "zustand";

import { logger } from "@/lib/logger";
import { indexedDB } from "@/lib/storage/indexed-db";
import type { AIModel } from "@/types/graphql";

interface ModelState {
  // State
  models: AIModel[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setModels: (models: AIModel[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getModelsByProvider: (provider: string) => AIModel[];
  getModelById: (id: string) => AIModel | undefined;
  syncWithOfflineData: () => Promise<void>;
  cacheData: () => Promise<void>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  // Initial state
  models: [],
  isLoading: false,
  error: null,

  // Actions
  setModels: (models: AIModel[]) => {
    set({ models });
    get().cacheData();
    logger.debug(`Set ${models.length} AI models`);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error("Model store error:", error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  getModelsByProvider: (provider: string) => {
    const state = get();
    return state.models.filter(
      (model) => model.provider.toLowerCase() === provider.toLowerCase()
    );
  },

  getModelById: (id: string) => {
    const state = get();
    return state.models.find((model) => model.id === id);
  },

  syncWithOfflineData: async () => {
    try {
      const offlineModels = await indexedDB.getModels();

      if (offlineModels.length > 0) {
        set({ models: offlineModels });
        logger.info(
          `Loaded ${offlineModels.length} models from offline storage`
        );
      }
    } catch (error) {
      logger.error("Failed to sync with offline model data:", error);
    }
  },

  cacheData: async () => {
    try {
      const state = get();
      if (state.models.length > 0) {
        await indexedDB.storeModels(state.models);
      }
    } catch (error) {
      logger.error("Failed to cache model data:", error);
    }
  },
}));
