// AI
export type AIModelPropValue = "high" | "low" | "medium";

export interface AIModel {
  author: string;
  capabilities: AIModelCapabilities;
  id: string;
  name: string;
  provider: string;
  enabled?: boolean;
  description?: string;
  speed?: AIModelPropValue;
  cost?: AIModelPropValue;
  category?: "text";
}

export interface AIModelCapabilities {
  codeExecution: boolean;
  fileAnalysis: boolean;
  functionCalling: boolean;
  imageAnalysis: boolean;
  imageGeneration: boolean;
  textGeneration: boolean;
  webBrowsing: boolean;
}

export enum AIProviderId {
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
}

// Auth
export interface SessionResponse {
  accessToken: string;
  rawDecryptKey?: string;
  refreshToken: string;
  user?: User;
}

// Branches
export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  apiKeyId?: string; // Optional API key ID for the model
  modelId?: string; // Optional model ID for the model
}

export interface ChatBranch {
  _id: string;
  branchPoint: number;
  isActive: boolean;
  messageCount: number;
  name: string;
  parentBranchId?: ChatBranch;
  modelConfig?: ModelConfig;
}

// Chats
export interface Chat {
  _id: string;
  archived: boolean;
  defaultBranch?: ChatBranch;
  isPublic: boolean;
  lastActivityAt: string;
  pinned: boolean;
  title: string;
}

export interface ChatsResponse {
  chats: Chat[];
  hasMore: boolean;
  total: number;
}

export interface SingleChatResponse {
  branches: ChatBranch[];
  chat: Chat;
  totalMessages: number;
}

// Keys
export interface ApiKey {
  _id: string;
  alias: string;
  lastRotated?: string;
  lastUsed?: string;
  lastValidated?: string;
  provider: string;
}

// Messages
export type MessageRole = "assistant" | "user";

export interface Message {
  _id: string;
  attachments: string[];
  branchId: string;
  content: MessageContent[];
  editedAt?: string;
  index: number;
  isEdited: boolean;
  modelUsed?: string;
  originalContent?: MessageContent[];
  role: MessageRole;
  tokens?: number;
  createdAt?: string; // Add timestamp for messages
}

export interface MessageContent {
  id?: string;
  name?: string;
  text?: string;
  tool_use_id?: string;
  type: string;
}

export interface MessagesResponse {
  hasMore: boolean;
  messages: Message[];
  total: number;
}

// Preferences
export interface Preferences {
  // Localization
  dateFormat?: string;
  language?: string;
  use24HourFormat?: boolean;
  // UI Preferences
  showTimestamps?: boolean;
  theme?: string;
}

// Sessions
export interface DeviceInfo {
  userAgent: string;
  ip: string;
  platform?: string;
  browser?: string;
}

export interface Session {
  _id: string;
  deviceInfo: DeviceInfo;
  expiresAt: Date;
  isActive: boolean;
  lastUsedAt: Date;
}

// Users
export interface User {
  _id: string;
  createdAt: string;
  decryptKey: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  encryptKey: string;
  updatedAt: string;
  preferences?: Preferences;
}
