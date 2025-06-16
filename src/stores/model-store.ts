/**
 * Zustand store for AI model management
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { AIModel } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { indexedDB } from "@/lib/storage/indexed-db";

interface ModelState {
  // Core state
  models: AIModel[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // State actions (pure)
  setModels: (models: AIModel[]) => void;
  addModel: (model: AIModel) => void;
  updateModel: (model: AIModel) => void;
  removeModel: (modelId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: (initialized: boolean) => void;

  // Utility actions
  getModelsByProvider: (provider: string) => AIModel[];
  getModelById: (id: string) => AIModel | undefined;

  // Offline/cache actions
  loadFromCache: () => Promise<void>;
  saveToCache: () => Promise<void>;
  reset: () => void;
}

export const useModelStore = create<ModelState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    models: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    // Set models (replace, don't append)
    setModels: (models: AIModel[]) => {
      set({ models: [...models] }); // Create new array to avoid reference issues
      logger.debug(`Set ${models.length} AI models`);
    },

    // Add single model (only if it doesn't exist)
    addModel: (model: AIModel) => {
      set((state) => {
        const exists = state.models.some((m) => m.id === model.id);
        if (exists) {
          logger.debug("Model already exists, skipping add:", model.id);
          return state;
        }
        return {
          models: [...state.models, model],
        };
      });
      logger.debug("Added model:", model.id);
    },

    // Update existing model
    updateModel: (model: AIModel) => {
      set((state) => ({
        models: state.models.map((m) => (m.id === model.id ? model : m)),
      }));
      logger.debug("Updated model:", model.id);
    },

    // Remove model
    removeModel: (modelId: string) => {
      set((state) => ({
        models: state.models.filter((m) => m.id !== modelId),
      }));
      logger.debug("Removed model:", modelId);
    },

    // Loading state
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    // Error state
    setError: (error: string | null) => {
      set({ error });
      if (error) {
        logger.error("Model store error:", error);
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

    // Get models by provider
    getModelsByProvider: (provider: string) => {
      const state = get();
      return state.models.filter(
        (model) => model.provider.toLowerCase() === provider.toLowerCase()
      );
    },

    // Get model by ID
    getModelById: (id: string) => {
      const state = get();
      return state.models.find((model) => model.id === id);
    },

    // Load models from offline cache
    loadFromCache: async () => {
      try {
        const offlineModels = await indexedDB.getModels();

        if (offlineModels.length > 0) {
          set({
            models: [...offlineModels], // Create new array
            isInitialized: true,
          });

          logger.info(`Loaded ${offlineModels.length} models from cache`);
        } else {
          set({
            models: [], // Ensure empty array
            isInitialized: true,
          });
        }
      } catch (error) {
        logger.error("Failed to load models from cache:", error);
        set({
          models: [], // Ensure empty array on error
          error: "Failed to load offline models",
          isInitialized: true,
        });
      }
    },

    // Save current models to cache
    saveToCache: async () => {
      try {
        const { models } = get();
        if (models.length > 0) {
          await indexedDB.storeModels(models);
          logger.debug(`Cached ${models.length} models`);
        }
      } catch (error) {
        logger.error("Failed to save models to cache:", error);
      }
    },

    // Reset store to initial state
    reset: () => {
      set({
        models: [],
        isLoading: false,
        error: null,
        isInitialized: false,
      });

      logger.debug("Model store reset");
    },
  }))
);
