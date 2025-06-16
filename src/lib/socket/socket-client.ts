/**
 * Socket.IO client for real-time updates
 * Handles chat messages, API key updates, and authentication events
 */
import { io, Socket } from "socket.io-client";

import type { SocketEvents } from "@/types";
import { logger } from "../logger";
import { LocalStorage } from "../storage/local-storage";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private listeners: Partial<SocketEvents> = {};

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  /**
   * Connect to the socket server
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      logger.debug("Socket already connected or connecting");
      return;
    }

    this.isConnecting = true;
    const tokens = LocalStorage.getAuthTokens();

    if (!tokens.accessToken) {
      logger.warn("No access token available, skipping socket connection");
      this.isConnecting = false;
      return;
    }

    try {
      this.socket = io(
        import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:4000",
        {
          auth: {
            token: tokens.accessToken,
          },
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 20000,
          forceNew: true,
        }
      );

      this.setupEventHandlers();
      logger.info("Socket connection initiated");
    } catch (error) {
      logger.error("Failed to create socket connection:", error);
      this.isConnecting = false;
    }
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      logger.info("Socket connected successfully");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      logger.warn("Socket disconnected:", reason);
      this.isConnecting = false;
    });

    this.socket.on("auth_error", (error) => {
      logger.error("Socket authentication error:", error);
      this.isConnecting = false;
    });

    this.socket.on("auth_success", () => {
      logger.info("Socket authentication successful");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", (error) => {
      logger.error("Socket connection error:", error);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error("Max reconnection attempts reached");
        this.disconnect();
      }
    });

    // Authentication events
    this.socket.on("auth:token_refreshed", (data) => {
      logger.info("Received token refresh from server");
      if (this.listeners["auth:token_refreshed"]) {
        this.listeners["auth:token_refreshed"](data);
      }
    });

    this.socket.on("auth:logout", () => {
      logger.info("Received logout signal from server");
      if (this.listeners["auth:logout"]) {
        this.listeners["auth:logout"]();
      }
    });

    // Chat events
    this.socket.on("chat:created", (chat) => {
      logger.debug("New chat created:", chat._id);
      if (this.listeners["chat:created"]) {
        this.listeners["chat:created"](chat);
      }
    });

    this.socket.on("chat:updated", (chat) => {
      logger.debug("Chat updated:", chat._id);
      if (this.listeners["chat:updated"]) {
        this.listeners["chat:updated"](chat);
      }
    });

    this.socket.on("chat:deleted", (chatId) => {
      logger.debug("Chat deleted:", chatId);
      if (this.listeners["chat:deleted"]) {
        this.listeners["chat:deleted"](chatId);
      }
    });

    // Message events
    this.socket.on("message:new", (message) => {
      logger.debug("New message received:", message._id);
      if (this.listeners["message:new"]) {
        this.listeners["message:new"](message);
      }
    });

    this.socket.on("message:updated", (message) => {
      logger.debug("Message updated:", message._id);
      if (this.listeners["message:updated"]) {
        this.listeners["message:updated"](message);
      }
    });

    this.socket.on("message:deleted", (messageId) => {
      logger.debug("Message deleted:", messageId);
      if (this.listeners["message:deleted"]) {
        this.listeners["message:deleted"](messageId);
      }
    });

    // API Key events
    this.socket.on("apikey:added", (apiKey) => {
      logger.debug("API key added:", apiKey._id);
      if (this.listeners["apikey:added"]) {
        this.listeners["apikey:added"](apiKey);
      }
    });

    this.socket.on("apikey:updated", (apiKey) => {
      logger.debug("API key updated:", apiKey._id);
      if (this.listeners["apikey:updated"]) {
        this.listeners["apikey:updated"](apiKey);
      }
    });

    this.socket.on("apikey:deleted", (apiKeyId) => {
      logger.debug("API key deleted:", apiKeyId);
      if (this.listeners["apikey:deleted"]) {
        this.listeners["apikey:deleted"](apiKeyId);
      }
    });

    // User events
    this.socket.on("user:updated", (user) => {
      logger.debug("User updated:", user._id);
      if (this.listeners["user:updated"]) {
        this.listeners["user:updated"](user);
      }
    });

    // Preferences events
    this.socket.on("preferences:updated", (preferences) => {
      logger.debug("Preferences updated");
      if (this.listeners["preferences:updated"]) {
        this.listeners["preferences:updated"](preferences);
      }
    });
  }

  /**
   * Set event listeners
   */
  setListeners(listeners: Partial<SocketEvents>): void {
    this.listeners = { ...this.listeners, ...listeners };
    logger.debug("Socket listeners updated");
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      logger.warn("Socket not connected, cannot emit event:", event);
      return;
    }

    this.socket.emit(event, data);
    logger.debug("Socket event emitted:", event);
  }

  /**
   * Update authentication token
   */
  updateAuth(accessToken: string): void {
    if (!this.socket) {
      logger.warn("Socket not initialized");
      return;
    }

    this.socket.auth = { token: accessToken };

    if (this.socket.connected) {
      this.socket.disconnect();
    }

    this.connect();
    logger.info("Socket auth updated, reconnecting");
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    logger.info("Socket disconnected");
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.socket?.connected ?? false,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const socketManager = SocketManager.getInstance();
