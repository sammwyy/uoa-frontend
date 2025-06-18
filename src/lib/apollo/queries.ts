/**
 * GraphQL queries and mutations
 */

import { gql } from "@apollo/client";

// Auth mutations
export const LOGIN_MUTATION = gql`
  mutation Login($payload: LoginDto!) {
    login(payload: $payload) {
      accessToken
      refreshToken
      rawDecryptKey
      user {
        _id
        email
        displayName
        emailVerified
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($payload: RegisterDto!) {
    register(payload: $payload) {
      accessToken
      refreshToken
      rawDecryptKey
      user {
        _id
        email
        displayName
        emailVerified
        createdAt
        updatedAt
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($payload: ChangePasswordDto!) {
    updatePassword(payload: $payload) {
      _id
      email
      displayName
      emailVerified
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($payload: UpdateUserDto!) {
    updateUser(payload: $payload) {
      _id
      email
      displayName
      emailVerified
      createdAt
      updatedAt
    }
  }
`;

// User queries
export const GET_USER_QUERY = gql`
  query GetUser {
    getUser {
      _id
      email
      displayName
      emailVerified
      createdAt
      updatedAt
    }
  }
`;

// Chat queries
export const GET_CHATS_QUERY = gql`
  query GetChats($query: GetManyChatsDto!) {
    getChats(query: $query) {
      chats {
        _id
        title
        archived
        pinned
        isPublic
        lastActivityAt
        defaultBranch {
          _id
          name
          isActive
          messageCount
          branchPoint
          modelConfig {
            modelId
            apiKeyId
            temperature
            maxTokens
          }
        }
      }
      hasMore
      total
    }
  }
`;

export const GET_CHAT_QUERY = gql`
  query GetChat($query: GetChatDto!) {
    getChat(query: $query) {
      chat {
        _id
        title
        archived
        pinned
        isPublic
        lastActivityAt
        defaultBranch {
          _id
          name
          isActive
          messageCount
          branchPoint
          modelConfig {
            modelId
            apiKeyId
            temperature
            maxTokens
          }
        }
      }
      branches {
        _id
        name
        isActive
        messageCount
        branchPoint
        modelConfig {
          modelId
          apiKeyId
          temperature
          maxTokens
        }
      }
      totalMessages
    }
  }
`;

export const GET_PUBLIC_CHAT_QUERY = gql`
  query GetPublicChat($query: GetChatDto!) {
    getPublicChat(query: $query) {
      chat {
        _id
        title
        archived
        pinned
        isPublic
        lastActivityAt
      }
      messages {
        _id
        role
        content {
          type
          text
          id
          name
          tool_use_id
        }
        attachments
        index
        isEdited
        editedAt
        modelUsed
        tokens
        branchId
        createdAt
        originalContent {
          type
          text
          id
          name
          tool_use_id
        }
      }
    }
  }
`;

export const GET_CHAT_BRANCHES_QUERY = gql`
  query GetChatBranches($chatId: String!) {
    getChatBranches(chatId: $chatId) {
      _id
      name
      isActive
      messageCount
      branchPoint
      modelConfig {
        modelId
        apiKeyId
        temperature
        maxTokens
      }
    }
  }
`;

export const GET_CHAT_MESSAGES_QUERY = gql`
  query GetChatMessages($query: GetMessagesDto!) {
    getChatMessages(query: $query) {
      messages {
        _id
        role
        content {
          type
          text
          id
          name
          tool_use_id
        }
        attachments
        index
        isEdited
        editedAt
        modelUsed
        tokens
        branchId
        createdAt
        originalContent {
          type
          text
          id
          name
          tool_use_id
        }
      }
      hasMore
      total
    }
  }
`;

export const CREATE_CHAT_MUTATION = gql`
  mutation CreateChat {
    createChat {
      _id
      title
      archived
      pinned
      isPublic
      lastActivityAt
      defaultBranch {
        _id
        name
        isActive
        messageCount
        branchPoint
      }
    }
  }
`;

export const UPDATE_CHAT_MUTATION = gql`
  mutation UpdateChat($id: String!, $payload: UpdateChatDto!) {
    updateChat(id: $id, payload: $payload) {
      _id
      title
      archived
      pinned
      isPublic
      lastActivityAt
      defaultBranch {
        _id
        name
        isActive
        messageCount
        branchPoint
      }
    }
  }
`;

export const DELETE_CHAT_MUTATION = gql`
  mutation DeleteChat($id: String!) {
    deleteChat(id: $id)
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($payload: AddMessageDto!) {
    sendMessage(payload: $payload) {
      _id
      role
      content {
        type
        text
        id
        name
        tool_use_id
      }
      attachments
      index
      isEdited
      editedAt
      modelUsed
      tokens
      branchId
      createdAt
      originalContent {
        type
        text
        id
        name
        tool_use_id
      }
    }
  }
`;

// Branch mutations
export const FORK_BRANCH_MUTATION = gql`
  mutation ForkBranch($originalBranchId: String!, $payload: ForkBranchDto!) {
    forkBranch(originalBranchId: $originalBranchId, payload: $payload) {
      _id
      name
      isActive
      messageCount
      branchPoint
      modelConfig {
        modelId
        apiKeyId
        temperature
        maxTokens
      }
    }
  }
`;

export const UPDATE_BRANCH_MUTATION = gql`
  mutation UpdateBranch($branchId: String!, $payload: UpdateBranchDto!) {
    updateBranch(branchId: $branchId, payload: $payload) {
      _id
      name
      isActive
      messageCount
      branchPoint
      modelConfig {
        modelId
        apiKeyId
        temperature
        maxTokens
      }
    }
  }
`;

export const DELETE_BRANCH_MUTATION = gql`
  mutation DeleteBranch($id: String!) {
    deleteBranch(id: $id)
  }
`;

// API Keys queries
export const GET_API_KEYS_QUERY = gql`
  query GetApiKeys {
    getApiKeys {
      _id
      alias
      provider
      lastUsed
      lastValidated
      lastRotated
    }
  }
`;

export const ADD_API_KEY_MUTATION = gql`
  mutation AddApiKey($payload: CreateApiKeyDto!) {
    addApiKey(payload: $payload) {
      _id
      alias
      provider
      lastUsed
      lastValidated
      lastRotated
    }
  }
`;

export const UPDATE_API_KEY_MUTATION = gql`
  mutation UpdateApiKey($id: String!, $payload: UpdateApiKeyDto!) {
    updateApiKey(id: $id, payload: $payload) {
      _id
      alias
      provider
      lastUsed
      lastValidated
      lastRotated
    }
  }
`;

export const DELETE_API_KEY_MUTATION = gql`
  mutation DeleteApiKey($id: String!) {
    deleteApiKey(id: $id)
  }
`;

// Models query
export const GET_AVAILABLE_MODELS_QUERY = gql`
  query GetAvailableModels($rawDecryptKey: String!) {
    getAvailableModels(rawDecryptKey: $rawDecryptKey) {
      id
      name
      provider
      author
      enabled
      description
      speed
      cost
      category
      capabilities {
        textGeneration
        imageGeneration
        imageAnalysis
        codeExecution
        functionCalling
        fileAnalysis
        webBrowsing
      }
    }
  }
`;

// Preferences
export const GET_PREFERENCES_QUERY = gql`
  query GetPreferences {
    getPreferences {
      dateFormat
      language
      use24HourFormat
      showTimestamps
      theme
    }
  }
`;

export const UPDATE_PREFERENCES_MUTATION = gql`
  mutation UpdatePreferences($payload: UpdatePreferencesDto!) {
    updatePreferences(payload: $payload) {
      dateFormat
      language
      use24HourFormat
      showTimestamps
      theme
    }
  }
`;

// Sessions
export const GET_SESSIONS_QUERY = gql`
  query GetSessions {
    getSessions {
      _id
      deviceInfo {
        userAgent
        ip
        platform
        browser
      }
      expiresAt
      isActive
      lastUsedAt
    }
  }
`;

export const REVOKE_SESSION_MUTATION = gql`
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId)
  }
`;

export const REVOKE_ALL_SESSIONS_MUTATION = gql`
  mutation RevokeAllSessions {
    revokeAllSessions
  }
`;

// File uploads
export const GET_USER_FILES_QUERY = gql`
  query GetUserFiles {
    getUserFiles {
      _id
      filename
      originalName
      mimetype
      size
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_STORAGE_STATS_QUERY = gql`
  query GetUserStorageStats {
    getUserStorageStats {
      used
      limit
      remaining
    }
  }
`;

export const DELETE_FILE_MUTATION = gql`
  mutation DeleteFile($id: String!) {
    deleteFile(id: $id)
  }
`;
