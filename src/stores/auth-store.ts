/**
 * Zustand store for authentication state management
 */

import { create } from "zustand";

import { apolloClientManager } from "@/lib/apollo/apollo-client";
import { crossTabSync } from "@/lib/auth/cross-tab-sync";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { LocalStorage } from "@/lib/storage/local-storage";
import type { SessionResponse, User } from "../types/graphql";

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  encryptKey: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    encryptKey?: string
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (sessionData: SessionResponse) => void;
  logout: () => void;
  initializeAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  encryptKey: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user: User) => {
    set({ user });
    LocalStorage.setUserData(user);
    logger.debug("User data updated in store");
  },

  setTokens: (
    accessToken: string,
    refreshToken: string,
    encryptKey?: string
  ) => {
    set({
      accessToken,
      refreshToken,
      encryptKey: encryptKey || get().encryptKey,
      isAuthenticated: true,
    });

    LocalStorage.setAuthTokens(accessToken, refreshToken, encryptKey);

    // Update socket authentication
    socketManager.updateAuth(accessToken);

    logger.info("Auth tokens updated");
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error("Auth error:", error);
    }
  },

  login: (sessionData: SessionResponse) => {
    const { accessToken, refreshToken, rawDecryptKey, user } = sessionData;

    set({
      isAuthenticated: true,
      user: user || null,
      accessToken,
      refreshToken,
      encryptKey: rawDecryptKey || null,
      isLoading: false,
      error: null,
    });

    // Store tokens in localStorage
    LocalStorage.setAuthTokens(accessToken, refreshToken, rawDecryptKey);

    if (user) {
      LocalStorage.setUserData(user);
    }

    // Connect to socket
    socketManager.connect();

    logger.info("User logged in successfully");
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      encryptKey: null,
      isLoading: false,
      error: null,
    });

    // Clear storage
    LocalStorage.clearAuthData();

    // Disconnect socket
    socketManager.disconnect();

    // Reset Apollo cache
    apolloClientManager.resetCache();

    // Broadcast logout to other tabs
    crossTabSync.broadcastLogout();

    logger.info("User logged out");
  },

  initializeAuth: () => {
    try {
      logger.info("Initializing authentication state...");

      const tokens = LocalStorage.getAuthTokens();
      const userData = LocalStorage.getUserData();

      logger.debug("Retrieved tokens from localStorage:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasEncryptKey: !!tokens.encryptKey,
      });

      if (tokens.accessToken && tokens.refreshToken) {
        set({
          isAuthenticated: true,
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          encryptKey: tokens.encryptKey,
          isLoading: false,
          error: null,
        });

        // Connect to socket
        socketManager.connect();

        logger.info("Auth state initialized from localStorage", {
          userId: userData?._id,
          userEmail: userData?.email,
        });
      } else {
        logger.debug("No stored auth tokens found, user needs to login");
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          encryptKey: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      logger.error("Failed to initialize auth state:", error);
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        encryptKey: null,
        isLoading: false,
        error: "Failed to initialize authentication",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize auth state immediately when the store is created
const initializeAuthOnLoad = () => {
  const { initializeAuth } = useAuthStore.getState();
  initializeAuth();
};

// Call initialization after a small delay to ensure localStorage is available
if (typeof window !== "undefined") {
  setTimeout(initializeAuthOnLoad, 0);
}

// Setup cross-tab synchronization
crossTabSync.setListeners({
  onTokenUpdate: (tokens) => {
    const { setTokens } = useAuthStore.getState();
    setTokens(tokens.accessToken, tokens.refreshToken);
    logger.info("Tokens updated from cross-tab sync");
  },
  onLogout: () => {
    const { logout } = useAuthStore.getState();
    logout();
    logger.info("Logged out from cross-tab sync");
  },
});

// Setup socket listeners for auth events
socketManager.setListeners({
  "auth:token_refreshed": (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    const { setTokens } = useAuthStore.getState();
    setTokens(tokens.accessToken, tokens.refreshToken);
    logger.info("Tokens refreshed via socket");
  },
  "auth:logout": () => {
    const { logout } = useAuthStore.getState();
    logout();
    logger.info("Logged out via socket");
  },
});
