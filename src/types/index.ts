import {
  ApiKey,
  Chat,
  ChatBranch,
  FileUpload,
  Message,
  Preferences,
  User,
} from "@/lib/graphql";

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

  // Message (Streaming) events
  "message:start": () => void;
  "message:chunk": (part: string) => void;
  "message:end": (message: Message) => void;
  "message:error": (error: string) => void;

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

  // User events
  "user:updated": (user: User) => void;

  // Preferences
  "preferences:updated": (preferences: Preferences) => void;

  // Branch events
  "branch:created": (branch: ChatBranch) => void;
  "branch:updated": (branch: ChatBranch) => void;
  "branch:deleted": (branch: string) => void;

  // Media
  "media:start": (type: MediaType) => void;
  "media:end": (response: MediaContent) => void;
  "media:error": (error: string) => void;
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

// File upload
export interface UploadResponse {
  message: string;
  file: FileUpload;
}

export interface UploadError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  baseUrl?: string;
  token?: string | (() => string);
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: UploadError) => void;
  onStart?: () => void;
  onComplete?: () => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  timeout?: number;
}

// Media
export type MediaType = "image" | "audio" | "video";

export type MediaContent = {
  type: MediaType;
  url: string;
};
