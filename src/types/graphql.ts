// GraphQL Schema Types
export interface User {
  _id: string;
  createdAt: string;
  decryptKey: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  encryptKey: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  // Localization
  timezone: string;
  dateFormat: string;
  language: string;
  use24HourFormat: boolean;
  useMetricUnits: boolean;
  
  // UI Preferences
  showSidebar: boolean;
  showTimestamps: boolean;
  smoothAnimations: boolean;
  
  // Theme (kept for future use)
  theme?: string;
}

export interface SessionResponse {
  accessToken: string;
  rawDecryptKey?: string;
  refreshToken: string;
  user?: User;
}

export interface Chat {
  _id: string;
  archived: boolean;
  defaultBranch?: ChatBranch;
  isPublic: boolean;
  lastActivityAt: string;
  pinned: boolean;
  title: string;
  modelId?: string;
  apiKeyId?: string;
}

export interface ChatBranch {
  _id: string;
  branchPoint: number;
  isActive: boolean;
  messageCount: number;
  name: string;
  parentBranchId?: ChatBranch;
}

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

export interface ApiKey {
  _id: string;
  alias: string;
  lastRotated?: string;
  lastUsed?: string;
  lastValidated?: string;
  provider: string;
}

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

// Response Types
export interface ChatsResponse {
  chats: Chat[];
  hasMore: boolean;
  total: number;
}

export interface MessagesResponse {
  hasMore: boolean;
  messages: Message[];
  total: number;
}

export interface SingleChatResponse {
  branches: ChatBranch[];
  chat: Chat;
  totalMessages: number;
}

// Input Types
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDto {
  displayName: string;
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  newPassword: string;
  oldPassword: string;
}

export interface UpdateUserDto {
  displayName?: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

export interface GetManyChatsDto {
  archived?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetChatDto {
  chatId: string;
}

export interface GetMessagesDto {
  branchId: string;
  fromIndex?: number;
  limit?: number;
  offset?: number;
}

export interface CreateApiKeyDto {
  alias: string;
  apiKey: string;
  provider: AIProviderId;
}

export interface UpdateApiKeyDto {
  alias?: string;
  isActive?: boolean;
}

export interface AddMessageDto {
  apiKeyId: string;
  branchId: string;
  modelId: string;
  prompt: string;
  rawDecryptKey: string;
}

export interface UpdateChatDto {
  title?: string;
  archived?: boolean;
  pinned?: boolean;
  isPublic?: boolean;
  modelId?: string;
  apiKeyId?: string;
}

export interface CreateBranchDto {
  chatId: string;
  name: string;
  parentBranchId?: string;
}

export interface UpdateBranchDto {
  name?: string;
  isActive?: boolean;
}