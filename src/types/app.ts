import { ApiKey, Chat, Message, User } from "./graphql";

// App-specific types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  encryptKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  reconnectAttempts: number;
  lastSeen: Date | null;
}

export interface SocketEvents {
  // Chat events
  "chat:created": (chat: Chat) => void;
  "chat:updated": (chat: Chat) => void;
  "chat:deleted": (chatId: string) => void;

  // Message events
  "message:new": (message: Message) => void;
  "message:updated": (message: Message) => void;
  "message:deleted": (messageId: string) => void;

  // API Key events
  "apikey:added": (apiKey: ApiKey) => void;
  "apikey:updated": (apiKey: ApiKey) => void;
  "apikey:deleted": (apiKeyId: string) => void;

  // Auth events
  "auth:token_refreshed": (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  "auth:logout": () => void;
}

export interface StorageConfig {
  version: number;
  stores: {
    chats: string;
    messages: string;
    apiKeys: string;
    models: string;
  };
}
