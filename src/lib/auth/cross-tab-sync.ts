/**
 * Cross-tab synchronization for auth tokens and state
 * Uses BroadcastChannel to sync tokens across multiple tabs
 */

import { logger } from "../logger";

interface TokenUpdateMessage {
  type: "TOKEN_UPDATE";
  payload: {
    accessToken: string;
    refreshToken: string;
    timestamp: number;
  };
}

interface LogoutMessage {
  type: "LOGOUT";
  payload: {
    timestamp: number;
  };
}

type SyncMessage = TokenUpdateMessage | LogoutMessage;

class CrossTabSync {
  private static instance: CrossTabSync;
  private channel: BroadcastChannel | null = null;
  private listeners: {
    onTokenUpdate?: (tokens: {
      accessToken: string;
      refreshToken: string;
    }) => void;
    onLogout?: () => void;
  } = {};

  private constructor() {
    this.init();
  }

  static getInstance(): CrossTabSync {
    if (!CrossTabSync.instance) {
      CrossTabSync.instance = new CrossTabSync();
    }
    return CrossTabSync.instance;
  }

  /**
   * Initialize BroadcastChannel if available
   */
  private init(): void {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      logger.warn("BroadcastChannel not available, cross-tab sync disabled");
      return;
    }

    try {
      this.channel = new BroadcastChannel("ai-chat-auth");
      this.channel.onmessage = this.handleMessage.bind(this);
      logger.info("Cross-tab sync initialized");
    } catch (error) {
      logger.error("Failed to initialize cross-tab sync:", error);
    }
  }

  /**
   * Handle incoming messages from other tabs
   */
  private handleMessage(event: MessageEvent<SyncMessage>): void {
    const { type, payload } = event.data;

    logger.debug("Received cross-tab message:", type, payload);

    switch (type) {
      case "TOKEN_UPDATE":
        if (this.listeners.onTokenUpdate) {
          this.listeners.onTokenUpdate({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
          });
        }
        break;

      case "LOGOUT":
        if (this.listeners.onLogout) {
          this.listeners.onLogout();
        }
        break;

      default:
        logger.warn("Unknown cross-tab message type:", type);
    }
  }

  /**
   * Broadcast token update to other tabs
   */
  broadcastTokenUpdate(accessToken: string, refreshToken: string): void {
    if (!this.channel) {
      logger.debug("BroadcastChannel not available, skipping token broadcast");
      return;
    }

    const message: TokenUpdateMessage = {
      type: "TOKEN_UPDATE",
      payload: {
        accessToken,
        refreshToken,
        timestamp: Date.now(),
      },
    };

    try {
      this.channel.postMessage(message);
      logger.debug("Token update broadcasted to other tabs");
    } catch (error) {
      logger.error("Failed to broadcast token update:", error);
    }
  }

  /**
   * Broadcast logout to other tabs
   */
  broadcastLogout(): void {
    if (!this.channel) {
      logger.debug("BroadcastChannel not available, skipping logout broadcast");
      return;
    }

    const message: LogoutMessage = {
      type: "LOGOUT",
      payload: {
        timestamp: Date.now(),
      },
    };

    try {
      this.channel.postMessage(message);
      logger.debug("Logout broadcasted to other tabs");
    } catch (error) {
      logger.error("Failed to broadcast logout:", error);
    }
  }

  /**
   * Set event listeners
   */
  setListeners(listeners: {
    onTokenUpdate?: (tokens: {
      accessToken: string;
      refreshToken: string;
      encryptKey?: string;
    }) => void;
    onLogout?: () => void;
  }): void {
    this.listeners = listeners;
    logger.debug("Cross-tab sync listeners configured");
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners = {};
    logger.info("Cross-tab sync destroyed");
  }
}

export const crossTabSync = CrossTabSync.getInstance();
