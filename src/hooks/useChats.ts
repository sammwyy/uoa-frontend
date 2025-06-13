/**
 * Hook for chat operations
 */

import { useMutation } from "@apollo/client";

import { apolloClient } from "@/lib/apollo/apollo-client";
import {
  CREATE_CHAT_MUTATION,
  GET_CHATS_QUERY,
  GET_CHAT_MESSAGES_QUERY,
  GET_CHAT_QUERY,
  SEND_MESSAGE_MUTATION,
} from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useChatStore } from "@/stores/chat-store";
import { useConnectionStore } from "@/stores/connection-store";
import type {
  AddMessageDto,
  GetManyChatsDto,
  GetMessagesDto,
} from "@/types/graphql";

export const useChats = () => {
  const {
    chats,
    currentChat,
    currentBranches,
    messages,
    hasMoreChats,
    hasMoreMessages,
    isLoading,
    error,
    setChats,
    setCurrentChat,
    setBranches,
    setMessages,
    setLoading,
    setError,
    clearError,
    syncWithOfflineData,
  } = useChatStore();

  const { isOnline } = useConnectionStore();

  const [createChatMutation] = useMutation(CREATE_CHAT_MUTATION);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION);

  // Load chats with offline fallback
  const loadChats = async (params: GetManyChatsDto = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!isOnline) {
        // Load from offline storage when offline
        await syncWithOfflineData();
        return;
      }

      logger.info("Loading chats:", params);

      const { data, error: queryError } = await apolloClient.query({
        query: GET_CHATS_QUERY,
        variables: { query: params },
        fetchPolicy: "cache-first",
      });

      if (queryError) {
        throw queryError;
      }

      if (data?.getChats) {
        const { chats: newChats, hasMore } = data.getChats;
        setChats(newChats, hasMore, append);
        logger.info(`Loaded ${newChats.length} chats`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chats";
      setError(errorMessage);
      logger.error("Failed to load chats:", error);

      // Fallback to offline data on error
      if (isOnline) {
        await syncWithOfflineData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load specific chat with branches
  const loadChat = async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Loading chat:", chatId);

      const { data, error: queryError } = await apolloClient.query({
        query: GET_CHAT_QUERY,
        variables: { query: { chatId } },
        fetchPolicy: "cache-first",
      });

      if (queryError) {
        throw queryError;
      }

      if (data?.getChat) {
        const { chat, branches } = data.getChat;
        setCurrentChat(chat);
        setBranches(branches);
        logger.info(`Loaded chat ${chatId} with ${branches.length} branches`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chat";
      setError(errorMessage);
      logger.error("Failed to load chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a branch
  const loadMessages = async (params: GetMessagesDto, append = false) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Loading messages for branch:", params.branchId);

      const { data, error: queryError } = await apolloClient.query({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { query: params },
        fetchPolicy: "cache-first",
      });

      if (queryError) {
        throw queryError;
      }

      if (data?.getChatMessages) {
        const { messages: newMessages, hasMore } = data.getChatMessages;
        setMessages(params.branchId, newMessages, hasMore, append);
        logger.info(
          `Loaded ${newMessages.length} messages for branch ${params.branchId}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      setError(errorMessage);
      logger.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new chat
  const createChat = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Creating new chat");

      const { data } = await createChatMutation();

      if (data?.createChat) {
        const newChat = data.createChat;
        setCurrentChat(newChat);
        logger.info("Chat created successfully:", newChat._id);
        return newChat;
      } else {
        throw new Error("Failed to create chat: No data returned");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create chat";
      setError(errorMessage);
      logger.error("Failed to create chat:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageData: AddMessageDto) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Sending message to branch:", messageData.branchId);

      const { data } = await sendMessageMutation({
        variables: { payload: messageData },
      });

      if (data?.sendMessage) {
        logger.info("Message sent successfully");
        return true;
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      setError(errorMessage);
      logger.error("Failed to send message:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    chats,
    currentChat,
    currentBranches,
    messages,
    hasMoreChats,
    hasMoreMessages,
    isLoading,
    error,

    // Actions
    loadChats,
    loadChat,
    loadMessages,
    createChat,
    sendMessage,
    setCurrentChat,
    clearError,
  };
};
