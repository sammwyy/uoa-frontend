/**
 * Zustand store for connection state management
 */

import { create } from "zustand";

import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";

interface ConnectionState {
  // State
  isOnline: boolean;
  isSocketConnected: boolean;
  lastSeen: Date | null;
  reconnectAttempts: number;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setSocketConnected: (isConnected: boolean) => void;
  setLastSeen: (lastSeen: Date) => void;
  setReconnectAttempts: (attempts: number) => void;
  initializeConnectionMonitoring: () => () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  // Initial state
  isOnline: navigator.onLine,
  isSocketConnected: false,
  lastSeen: null,
  reconnectAttempts: 0,

  // Actions
  setOnline: (isOnline: boolean) => {
    set({ isOnline });

    if (isOnline) {
      set({ lastSeen: new Date() });

      // Reconnect socket if we're back online
      if (!get().isSocketConnected) {
        socketManager.connect();
      }
    }

    logger.info(
      `Connection status changed: ${isOnline ? "online" : "offline"}`
    );
  },

  setSocketConnected: (isConnected: boolean) => {
    set({ isSocketConnected: isConnected });

    if (isConnected) {
      set({
        lastSeen: new Date(),
        reconnectAttempts: 0,
      });
    }

    logger.debug(
      `Socket connection status: ${isConnected ? "connected" : "disconnected"}`
    );
  },

  setLastSeen: (lastSeen: Date) => {
    set({ lastSeen });
  },

  setReconnectAttempts: (attempts: number) => {
    set({ reconnectAttempts: attempts });
  },

  initializeConnectionMonitoring: () => {
    // Monitor online/offline status
    const handleOnline = () => get().setOnline(true);
    const handleOffline = () => get().setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Monitor socket connection status
    const checkSocketStatus = () => {
      const status = socketManager.getStatus();
      get().setSocketConnected(status.connected);
      get().setReconnectAttempts(status.reconnectAttempts);
    };

    // Check socket status periodically
    const statusInterval = setInterval(checkSocketStatus, 5000);

    logger.info("Connection monitoring initialized");

    // Return cleanup function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(statusInterval);
      logger.info("Connection monitoring cleaned up");
    };
  },
}));
