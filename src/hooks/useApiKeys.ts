/**
 * Hook for API key operations
 */

import { useMutation, useQuery } from "@apollo/client";
import React from "react";

import {
  ADD_API_KEY_MUTATION,
  DELETE_API_KEY_MUTATION,
  GET_API_KEYS_QUERY,
  UPDATE_API_KEY_MUTATION,
} from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useApiKeyStore } from "@/stores/api-key-store";
import { useConnectionStore } from "@/stores/connection-store";
import type { CreateApiKeyDto, UpdateApiKeyDto } from "@/types/graphql";

export const useApiKeys = () => {
  const {
    apiKeys,
    isLoading,
    error,
    setApiKeys,
    addApiKey,
    updateApiKey,
    removeApiKey,
    setLoading,
    setError,
    clearError,
    syncWithOfflineData,
  } = useApiKeyStore();

  const { isOnline } = useConnectionStore();

  const {
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_API_KEYS_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.getApiKeys) {
        setApiKeys(data.getApiKeys);
        logger.info(`Loaded ${data.getApiKeys.length} API keys`);
      }
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to load API keys";
      setError(errorMessage);
      logger.error("Failed to load API keys:", error);

      // Fallback to offline data on error
      if (isOnline) {
        syncWithOfflineData();
      }
    },
  });

  const [addApiKeyMutation] = useMutation(ADD_API_KEY_MUTATION);
  const [updateApiKeyMutation] = useMutation(UPDATE_API_KEY_MUTATION);
  const [deleteApiKeyMutation] = useMutation(DELETE_API_KEY_MUTATION);

  // Update loading state from Apollo
  React.useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Load API keys manually
  const loadApiKeys = async () => {
    if (!isOnline) {
      // Load from offline storage when offline
      await syncWithOfflineData();
      return;
    }

    try {
      setError(null);
      logger.info("Loading API keys");
      await refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load API keys";
      setError(errorMessage);
      logger.error("Failed to load API keys:", error);

      // Fallback to offline data on error
      if (isOnline) {
        await syncWithOfflineData();
      }
    }
  };

  // Create new API key
  const createApiKey = async (apiKeyData: CreateApiKeyDto) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Creating new API key:", apiKeyData.alias);

      const { data } = await addApiKeyMutation({
        variables: { payload: apiKeyData },
      });

      if (data?.addApiKey) {
        addApiKey(data.addApiKey);
        logger.info("API key created successfully:", data.addApiKey._id);
        return data.addApiKey;
      } else {
        throw new Error("Failed to create API key: No data returned");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create API key";
      setError(errorMessage);
      logger.error("Failed to create API key:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update API key
  const updateApiKeyData = async (id: string, updateData: UpdateApiKeyDto) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Updating API key:", id);

      const { data } = await updateApiKeyMutation({
        variables: { id, payload: updateData },
      });

      if (data?.updateApiKey) {
        updateApiKey(data.updateApiKey);
        logger.info("API key updated successfully:", id);
        return data.updateApiKey;
      } else {
        throw new Error("Failed to update API key: No data returned");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update API key";
      setError(errorMessage);
      logger.error("Failed to update API key:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Deleting API key:", id);

      const { data } = await deleteApiKeyMutation({
        variables: { id },
      });

      if (data?.deleteApiKey) {
        removeApiKey(id);
        logger.info("API key deleted successfully:", id);
        return true;
      } else {
        throw new Error("Failed to delete API key");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete API key";
      setError(errorMessage);
      logger.error("Failed to delete API key:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    apiKeys,
    isLoading: loading || isLoading,
    error: queryError?.message || error,

    // Actions
    loadApiKeys,
    createApiKey,
    updateApiKey: updateApiKeyData,
    deleteApiKey,
    clearError,
  };
};
