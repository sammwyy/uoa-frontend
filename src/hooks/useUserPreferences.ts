/**
 * Hook for managing user preferences with server sync
 */

import { useMutation } from "@apollo/client";
import { useCallback, useEffect } from "react";

import { UPDATE_USER_MUTATION } from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/auth-store";
import { useUserPreferencesStore } from "@/stores/user-preferences-store";
import type { UserPreferences } from "@/types/graphql";

export const useUserPreferences = () => {
  const { user, setUser } = useAuthStore();
  const {
    preferences,
    isLoading,
    error,
    setPreferences,
    updatePreference,
    setLoading,
    setError,
    clearError,
    initializeFromUser,
  } = useUserPreferencesStore();

  const [updateUserMutation] = useMutation(UPDATE_USER_MUTATION);

  // Initialize preferences from user data
  useEffect(() => {
    if (user) {
      initializeFromUser(user);
    }
  }, [user, initializeFromUser]);

  // Update a single preference and sync to server
  const updateUserPreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Update local state immediately for better UX
        updatePreference(key, value);

        logger.info("Updating user preference:", key, value);

        // Sync to server
        const { data } = await updateUserMutation({
          variables: {
            payload: {
              preferences: {
                [key]: value,
              },
            },
          },
        });

        if (data?.updateUser) {
          // Update user in auth store
          setUser(data.updateUser);
          
          // Sync preferences store with server response
          if (data.updateUser.preferences) {
            setPreferences(data.updateUser.preferences);
          }

          logger.info("User preference updated successfully:", key);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update preference";
        setError(errorMessage);
        logger.error("Failed to update user preference:", error);

        // Revert local change on error
        if (user?.preferences) {
          initializeFromUser(user);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      updateUserMutation,
      setUser,
      updatePreference,
      setPreferences,
      setLoading,
      setError,
      initializeFromUser,
      user,
    ]
  );

  // Update multiple preferences at once
  const updateUserPreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        setLoading(true);
        setError(null);

        // Update local state immediately
        Object.entries(updates).forEach(([key, value]) => {
          updatePreference(key as keyof UserPreferences, value);
        });

        logger.info("Updating user preferences:", updates);

        // Sync to server
        const { data } = await updateUserMutation({
          variables: {
            payload: {
              preferences: updates,
            },
          },
        });

        if (data?.updateUser) {
          // Update user in auth store
          setUser(data.updateUser);
          
          // Sync preferences store with server response
          if (data.updateUser.preferences) {
            setPreferences(data.updateUser.preferences);
          }

          logger.info("User preferences updated successfully");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update preferences";
        setError(errorMessage);
        logger.error("Failed to update user preferences:", error);

        // Revert local changes on error
        if (user?.preferences) {
          initializeFromUser(user);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      updateUserMutation,
      setUser,
      updatePreference,
      setPreferences,
      setLoading,
      setError,
      initializeFromUser,
      user,
    ]
  );

  return {
    // State
    preferences,
    isLoading,
    error,

    // Actions
    updatePreference: updateUserPreference,
    updatePreferences: updateUserPreferences,
    clearError,
  };
};