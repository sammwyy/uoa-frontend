/**
 * Hook for session management operations
 */

import { useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";

import {
  GET_SESSIONS_QUERY,
  REVOKE_ALL_SESSIONS_MUTATION,
  REVOKE_SESSION_MUTATION,
} from "@/lib/apollo/queries";
import type { Session } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useConnectionStore } from "@/stores/connection-store";
import { useAuth } from "./useAuth";

export const useSessions = () => {
  const { isOnline } = useConnectionStore();
  const { isAuthenticated } = useAuth();

  const {
    data: sessionsData,
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_SESSIONS_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: isOnline ? "cache-and-network" : "cache-only",
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: false,
  });

  const [revokeSessionMutation] = useMutation(REVOKE_SESSION_MUTATION);
  const [revokeAllSessionsMutation] = useMutation(REVOKE_ALL_SESSIONS_MUTATION);

  // Auto-refetch when connection is restored
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      logger.info("Connection restored, syncing sessions");
      refetch().catch((error) => {
        logger.warn("Failed to sync sessions after reconnection:", error);
      });
    }
  }, [isOnline, isAuthenticated, refetch]);

  // Load sessions manually
  const loadSessions = async () => {
    if (!isOnline || !isAuthenticated) {
      logger.warn("Cannot load sessions: offline or not authenticated");
      return;
    }

    try {
      logger.info("Loading user sessions");
      await refetch();
    } catch (error) {
      logger.error("Failed to load sessions:", error);
      throw error;
    }
  };

  // Revoke a specific session
  const revokeSession = async (sessionId: string) => {
    try {
      logger.info("Revoking session:", sessionId);

      const { data } = await revokeSessionMutation({
        variables: { sessionId },
      });

      if (data?.revokeSession) {
        // Refetch sessions to update the list
        await refetch();
        logger.info("Session revoked successfully:", sessionId);
        return true;
      } else {
        throw new Error("Failed to revoke session");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to revoke session";
      logger.error("Failed to revoke session:", error);
      throw new Error(errorMessage);
    }
  };

  // Revoke all other sessions (keep current)
  const revokeAllOtherSessions = async () => {
    try {
      logger.info("Revoking all other sessions");

      const { data } = await revokeAllSessionsMutation();

      if (data?.revokeAllSessions) {
        // Refetch sessions to update the list
        await refetch();
        logger.info("All other sessions revoked successfully");
        return true;
      } else {
        throw new Error("Failed to revoke all sessions");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to revoke all sessions";
      logger.error("Failed to revoke all sessions:", error);
      throw new Error(errorMessage);
    }
  };

  const sessions: Session[] = sessionsData?.getSessions || [];

  return {
    // State
    sessions,
    isLoading: loading,
    error: queryError?.message,
    isOnline,

    // Actions
    loadSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
};
