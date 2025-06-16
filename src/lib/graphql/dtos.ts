import { AIProviderId } from "./types";

// Auth
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

// Branches

export interface CreateBranchDto {
  chatId: string;
  name: string;
  parentBranchId?: string;
}

export interface UpdateBranchDto {
  name?: string;
  isActive?: boolean;
}

// Chats
export interface GetManyChatsDto {
  archived?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetChatDto {
  chatId: string;
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

// Keys
export interface CreateApiKeyDto {
  alias: string;
  apiKey: string;
  provider: AIProviderId;
}

export interface UpdateApiKeyDto {
  alias?: string;
  isActive?: boolean;
}

// Messages
export interface GetMessagesDto {
  branchId: string;
  fromIndex?: number;
  limit?: number;
  offset?: number;
}

// Users
export interface UpdateUserDto {
  displayName?: string;
  email?: string;
}
