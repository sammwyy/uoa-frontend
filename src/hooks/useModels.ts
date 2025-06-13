/**
 * Hook for AI models operations
 */

import { useQuery } from "@apollo/client";
import React from "react";

import { GET_AVAILABLE_MODELS_QUERY } from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/auth-store";
import { useConnectionStore } from "@/stores/connection-store";
import { useModelStore } from "@/stores/model-store";

export const useModels = () => {
  const {
    models,
    isLoading,
    error,
    setModels,
    setLoading,
    setError,
    clearError,
    getModelsByProvider,
    getModelById,
    syncWithOfflineData,
  } = useModelStore();

  const { isOnline } = useConnectionStore();
  const { encryptKey } = useAuthStore();

  const {
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_AVAILABLE_MODELS_QUERY, {
    variables: { rawDecryptKey: encryptKey || "" },
    skip: !encryptKey, // Skip query if no encrypt key
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.getAvailableModels) {
        setModels(data.getAvailableModels);
        logger.info(`Loaded ${data.getAvailableModels.length} models`);
      }
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to load models";
      setError(errorMessage);
      logger.error("Failed to load models:", error);

      // Fallback to offline data on error
      if (isOnline) {
        syncWithOfflineData();
      }
    },
  });

  // Update loading state from Apollo
  React.useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Load available models manually
  const loadModels = async () => {
    if (!encryptKey) {
      setError("Encryption key not available");
      return;
    }

    if (!isOnline) {
      // Load from offline storage when offline
      await syncWithOfflineData();
      return;
    }

    try {
      setError(null);
      logger.info("Loading available models");
      await refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load models";
      setError(errorMessage);
      logger.error("Failed to load models:", error);

      // Fallback to offline data on error
      if (isOnline) {
        await syncWithOfflineData();
      }
    }
  };

  return {
    // State
    models,
    isLoading: loading || isLoading,
    error: queryError?.message || error,

    // Actions
    loadModels,
    getModelsByProvider,
    getModelById,
    clearError,
  };
};
