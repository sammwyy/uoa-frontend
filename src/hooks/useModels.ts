/**
 * Hook for AI models operations
 */

import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import { GET_AVAILABLE_MODELS_QUERY } from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useConnectionStore } from "@/stores/connection-store";
import { useModelStore } from "@/stores/model-store";
import { useAuth } from "./useAuth";

export const useModels = () => {
  const store = useModelStore();
  const { isOnline } = useConnectionStore();
  const { session } = useAuth();
  const decryptKey = session?.decryptKey;

  // Query for loading models (controlled manually)
  const { refetch: refetchModels, loading: queryLoading } = useQuery(
    GET_AVAILABLE_MODELS_QUERY,
    {
      skip: true, // We'll trigger this manually
      fetchPolicy: isOnline ? "cache-and-network" : "cache-only",
      errorPolicy: "ignore",
      notifyOnNetworkStatusChange: false,
    }
  );

  // Initialize store on mount
  useEffect(() => {
    if (store.isInitialized) {
      return;
    }

    if (isOnline) {
      loadModels().catch((error) => {
        logger.warn("Failed to sync models on mount:", error);
      });
    } else {
      store.loadFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refetch when connection is restored (only if we don't have models already)
  useEffect(() => {
    if (
      isOnline &&
      store.isInitialized &&
      decryptKey &&
      store.models.length === 0
    ) {
      logger.info("Connection restored, syncing models");
      loadModels().catch((error) => {
        logger.warn("Failed to sync models after reconnection:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, store.isInitialized, decryptKey]);

  // Load models from server
  const loadModels = async () => {
    try {
      store.setLoading(true);
      store.clearError();

      // If no decrypt key available
      if (!decryptKey) {
        store.setError("Decryption key not available");
        if (!store.isInitialized) {
          await store.loadFromCache();
        }
        return;
      }

      // If offline, use cache only
      if (!isOnline) {
        if (!store.isInitialized) {
          await store.loadFromCache();
        }
        return;
      }

      logger.info("Loading available models");

      const { data, error } = await refetchModels({
        rawDecryptKey: decryptKey,
      });

      if (error && !data) {
        throw error;
      }

      if (data?.getAvailableModels) {
        // Update store
        store.setModels(data.getAvailableModels);

        // Cache for offline use
        await store.saveToCache();

        logger.info(`Loaded ${data.getAvailableModels.length} models`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load models";
      store.setError(errorMessage);
      logger.error("Failed to load models:", error);

      // Fallback to cache if network request failed
      if (isOnline && !store.isInitialized) {
        await store.loadFromCache();
      }
    } finally {
      store.setLoading(false);
    }
  };

  // Force sync with server
  const forceSyncWithServer = async () => {
    if (!isOnline) {
      logger.warn("Cannot sync: offline");
      return false;
    }

    if (!decryptKey) {
      logger.warn("Cannot sync: no decrypt key");
      return false;
    }

    try {
      store.setLoading(true);
      await loadModels();
      logger.info("Manual sync completed");
      return true;
    } catch (error) {
      logger.error("Manual sync failed:", error);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    // State
    models: store.models,
    isLoading: store.isLoading || queryLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    isOnline,

    // Actions
    loadModels,
    getModelsByProvider: store.getModelsByProvider,
    getModelById: store.getModelById,
    clearError: store.clearError,

    // Utilities
    forceSyncWithServer,
  };
};
