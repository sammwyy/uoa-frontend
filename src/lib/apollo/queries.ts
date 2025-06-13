/**
 * GraphQL queries and mutations
 */

import { gql } from "@apollo/client";

// Auth mutations
export const LOGIN_MUTATION = gql`
  mutation Login($payload: LoginDTO!) {
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
  mutation UpdatePassword($payload: ChangePasswordDTO!) {
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
        }
      }
      branches {
        _id
        name
        isActive
        messageCount
        branchPoint
        parentBranchId {
          _id
          name
        }
      }
      totalMessages
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
      parentBranchId {
        _id
        name
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
    sendMessage(payload: $payload)
  }
`;

// Branch mutations
export const CREATE_BRANCH_MUTATION = gql`
  mutation CreateBranch($payload: CreateBranchDto!) {
    createBranch(payload: $payload) {
      _id
      name
      isActive
      messageCount
      branchPoint
      parentBranchId {
        _id
        name
      }
    }
  }
`;

export const UPDATE_BRANCH_MUTATION = gql`
  mutation UpdateBranch($id: String!, $payload: UpdateBranchDto!) {
    updateBranch(id: $id, payload: $payload) {
      _id
      name
      isActive
      messageCount
      branchPoint
      parentBranchId {
        _id
        name
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
