import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { User } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { LocalStorage } from "@/lib/storage/local-storage";

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  decryptKey: string;
}

interface AuthState {
  // Main state
  isAuthenticated: boolean;
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  login: (session: AuthSession, user?: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isAuthenticated: false,
    user: null,
    session: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    // Initialize from localStorage
    initialize: () => {
      if (get().isInitialized) return;

      try {
        set({ isLoading: true });
        logger.info("Initializing auth from localStorage");

        const tokens = LocalStorage.getAuthTokens();
        const userData = LocalStorage.getUserData();

        if (tokens.accessToken && tokens.refreshToken && tokens.decryptKey) {
          const session: AuthSession = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            decryptKey: tokens.decryptKey,
          };

          set({
            isAuthenticated: true,
            session,
            user: userData,
          });

          // Configure socket with token
          socketManager.updateAuth(tokens.accessToken);
          socketManager.connect();

          logger.info("Auth initialized from cache", {
            hasUser: !!userData,
            userId: userData?._id,
          });
        } else {
          logger.debug("No cached session found");
        }
      } catch (error) {
        logger.error("Failed to initialize auth:", error);
        set({ error: "Failed to initialize authentication" });
      } finally {
        set({ isInitialized: true, isLoading: false });
      }
    },

    // Login - save session and user
    login: (session: AuthSession, user?: User) => {
      try {
        set({ isLoading: true, error: null });

        // Update state
        set({
          isAuthenticated: true,
          session,
          user: user || null,
        });

        // Persist to localStorage
        LocalStorage.setAuthTokens(
          session.accessToken,
          session.refreshToken,
          session.decryptKey
        );

        if (user) {
          LocalStorage.setUserData(user);
        }

        // Configure socket
        socketManager.updateAuth(session.accessToken);
        socketManager.connect();

        logger.info("Login successful", { userId: user?._id });
      } catch (error) {
        logger.error("Login failed:", error);
        set({ error: "Login failed" });
      } finally {
        set({ isLoading: false });
      }
    },

    // Logout - clear everything
    logout: async () => {
      try {
        set({ isLoading: true });

        // Clear state
        set({
          isAuthenticated: false,
          user: null,
          session: null,
          error: null,
        });

        // Clear localStorage
        await LocalStorage.clearAuthData();

        // Disconnect socket
        socketManager.disconnect();

        logger.info("Logout successful");
      } catch (error) {
        logger.error("Logout failed:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    // Update user (for synchronization)
    updateUser: (user: User) => {
      set({ user });
      LocalStorage.setUserData(user);
      logger.debug("User updated", { userId: user._id });
    },

    // Utilities
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
  }))
);

// Configure socket listeners for synchronization
socketManager.setListeners({
  "user:updated": (userData: User) => {
    const { updateUser, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      updateUser(userData);
      logger.info("User updated via socket");
    }
  },
  "auth:logout": () => {
    const { logout } = useAuthStore.getState();
    logout();
    logger.info("Logout triggered via socket");
  },
});
