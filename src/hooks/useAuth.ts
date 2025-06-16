import { GET_USER_QUERY } from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/auth-store";
import { useConnectionStore } from "@/stores/connection-store";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";

// Main hook that combines the store with network logic
export const useAuth = () => {
  const store = useAuthStore();
  const { isOnline } = useConnectionStore();

  // Query to get user data (network-first)
  const {
    data: userQueryData,
    error: userQueryError,
    refetch: refetchUser,
    loading: queryLoading,
  } = useQuery(GET_USER_QUERY, {
    skip: !store.isAuthenticated || !store.isInitialized,
    fetchPolicy: isOnline ? "cache-and-network" : "cache-only",
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: false,
  });

  // Automatic initialization
  useEffect(() => {
    store.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync server data when available
  useEffect(() => {
    if (userQueryData?.getUser && !userQueryError) {
      // Only update if there are real changes
      const currentUser = store.user;
      const serverUser = userQueryData.getUser;

      if (
        !currentUser ||
        JSON.stringify(currentUser) !== JSON.stringify(serverUser)
      ) {
        store.updateUser(serverUser);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQueryData, userQueryError]);

  // Refetch when connection is restored
  useEffect(() => {
    if (isOnline && store.isAuthenticated && store.isInitialized) {
      logger.info("Connection restored, syncing user data");
      refetchUser().catch((error) => {
        logger.warn("Failed to sync after reconnection:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, store.isAuthenticated, store.isInitialized]);

  // Force manual synchronization
  const forceSyncWithServer = async () => {
    if (!isOnline || !store.isAuthenticated) {
      logger.warn("Cannot sync: offline or not authenticated");
      return false;
    }

    try {
      store.setLoading(true);
      await refetchUser();
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
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    isLoading: store.isLoading || queryLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    isOnline,

    // Actions
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,

    // Utilities
    forceSyncWithServer,
  };
};
