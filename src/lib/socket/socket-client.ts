/**
 * Socket.IO client for real-time updates
 * Handles chat messages, API key updates, and authentication events
 */
import type { SocketEvents } from "@/types";
import { io, Socket } from "socket.io-client";
import { logger } from "../logger";
import { LocalStorage } from "../storage/local-storage";

// 📦 Event list to map automatically
const SOCKET_EVENTS: {
  event: keyof SocketEvents;
}[] = [
  // Auth
  { event: "auth:token_refreshed" },
  { event: "auth:logout" },

  // Chat
  { event: "chat:created" },
  { event: "chat:updated" },
  { event: "chat:deleted" },

  // Message
  { event: "message:new" },
  { event: "message:updated" },
  { event: "message:deleted" },

  { event: "message:start" },
  { event: "message:chunk" },
  { event: "message:end" },
  { event: "message:error" },

  // API Key
  { event: "apikey:added" },
  { event: "apikey:updated" },
  { event: "apikey:deleted" },

  // User
  { event: "user:updated" },

  // Preferences
  { event: "preferences:updated" },
];

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
          auth: { token: tokens.accessToken },
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

    // Generic handler mapping
    for (const { event } of SOCKET_EVENTS) {
      this.socket.on(event, (data) => {
        logger.debug(`Event received: ${event}`, data);
        const handler = this.listeners[event];
        if (handler) {
          handler(data);
        }
      });
    }
  }

  setListeners(listeners: Partial<SocketEvents>): void {
    this.listeners = { ...this.listeners, ...listeners };
    logger.debug("Socket listeners updated");
  }

  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      logger.warn("Socket not connected, cannot emit event:", event);
      return;
    }

    this.socket.emit(event, data);
    logger.debug("Socket event emitted:", event);
  }

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

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    logger.info("Socket disconnected");
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

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
