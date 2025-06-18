import {
  CREATE_CHAT_MUTATION,
  DELETE_CHAT_MUTATION,
  GET_CHATS_QUERY,
  SEND_MESSAGE_MUTATION,
  UPDATE_CHAT_MUTATION,
} from "@/lib/apollo/queries";
import type {
  AddMessageDto,
  Chat,
  ChatsResponse,
  GetManyChatsDto,
  UpdateChatDto,
} from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useChatStore } from "@/stores/chat-store";
import { useConnectionStore } from "@/stores/connection-store";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";

export const useChats = () => {
  const store = useChatStore();
  const { isOnline } = useConnectionStore();

  // Query for loading chats (controlled manually)
  const { refetch: refetchChats, loading: queryLoading } = useQuery(
    GET_CHATS_QUERY,
    {
      skip: true, // We'll trigger this manually
      fetchPolicy: isOnline ? "network-only" : "cache-only",
      errorPolicy: "ignore",
      notifyOnNetworkStatusChange: false,
    }
  );

  // Mutations
  const [createChatMutation] = useMutation(CREATE_CHAT_MUTATION);
  const [updateChatMutation] = useMutation(UPDATE_CHAT_MUTATION);
  const [deleteChatMutation] = useMutation(DELETE_CHAT_MUTATION);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION);

  // Initialize store on mount
  useEffect(() => {
    if (!store.isInitialized) {
      store.loadFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refetch when connection is restored
  useEffect(() => {
    if (isOnline && store.isInitialized && store.chats.length > 0) {
      logger.info("Connection restored, syncing chats");
      loadChats(store.currentParams).catch((error) => {
        logger.warn("Failed to sync chats after reconnection:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, store.isInitialized]);

  // Load chats from server
  const loadChats = async (params: GetManyChatsDto = {}, append = false) => {
    try {
      store.setLoading(true);
      store.clearError();

      // If offline, use cache only
      if (!isOnline) {
        if (!store.isInitialized) {
          await store.loadFromCache();
        }
        return;
      }

      // Update current params for pagination
      if (!append) {
        store.setCurrentParams(params);
      }

      logger.info("Loading chats:", params);

      const { data, error } = await refetchChats({
        query: params,
      });

      if (error && !data) {
        throw error;
      }

      if (data?.getChats) {
        const response: ChatsResponse = data.getChats;

        // Update store
        store.setChats(
          response.chats,
          response.hasMore,
          response.total,
          append
        );

        // Cache for offline use
        await store.saveToCache();

        logger.info(
          `Loaded ${response.chats.length} chats (total: ${response.total})`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chats";
      store.setError(errorMessage);
      logger.error("Failed to load chats:", error);

      // Fallback to cache if network request failed
      if (isOnline && !store.isInitialized) {
        await store.loadFromCache();
      }
    } finally {
      store.setLoading(false);
    }
  };

  // Load more chats (pagination)
  const loadMoreChats = async () => {
    if (!store.hasMore || store.isLoading) {
      return;
    }

    const nextParams: GetManyChatsDto = {
      ...store.currentParams,
      offset: store.chats.length,
    };

    await loadChats(nextParams, true);
  };

  // Create new chat
  const createChat = async () => {
    try {
      store.setLoading(true);
      store.clearError();

      logger.info("Creating new chat");

      const { data } = await createChatMutation();

      if (!data?.createChat) {
        throw new Error("Failed to create chat: No data returned");
      }

      const newChat: Chat = data.createChat;

      // Add to store (socket will also trigger this, but we want immediate feedback)
      store.addChat(newChat);

      // Cache updated data
      await store.saveToCache();

      logger.info("Chat created successfully:", newChat._id);
      return newChat;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create chat";
      store.setError(errorMessage);
      logger.error("Failed to create chat:", error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  // Update chat
  const updateChat = async (id: string, updateData: UpdateChatDto) => {
    try {
      store.clearError();

      logger.info("Updating chat:", id, updateData);

      const { data } = await updateChatMutation({
        variables: { id, payload: updateData },
      });

      if (!data?.updateChat) {
        throw new Error("Failed to update chat: No data returned");
      }

      const updatedChat: Chat = data.updateChat;

      // Update store
      store.updateChat(updatedChat);

      // Cache updated data
      await store.saveToCache();

      logger.info("Chat updated successfully:", updatedChat._id);
      return updatedChat;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update chat";
      store.setError(errorMessage);
      logger.error("Failed to update chat:", error);
      throw error;
    }
  };

  // Delete chat
  const deleteChat = async (id: string) => {
    try {
      store.setLoading(true);
      store.clearError();

      logger.info("Deleting chat:", id);

      await deleteChatMutation({
        variables: { id },
      });

      // Remove from store
      store.removeChat(id);

      // Cache updated data
      await store.saveToCache();

      logger.info("Chat deleted successfully:", id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete chat";
      store.setError(errorMessage);
      logger.error("Failed to delete chat:", error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  // Send message to chat
  const sendMessage = async (data: AddMessageDto) => {
    try {
      store.setLoading(true);
      store.clearError();

      logger.info("Sending message:", data);

      const { data: response } = await sendMessageMutation({
        variables: { payload: data },
      });

      if (!response?.sendMessage) {
        throw new Error("Failed to send message: No data returned");
      }

      logger.info("Message sent successfully:", response.sendMessage._id);
      return response.sendMessage;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      store.setError(errorMessage);
      logger.error("Failed to send message:", error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  // Force sync with server
  const forceSyncWithServer = async () => {
    if (!isOnline) {
      logger.warn("Cannot sync: offline");
      return false;
    }

    try {
      store.setLoading(true);
      await loadChats({ ...store.currentParams, offset: 0 });
      logger.info("Manual sync completed");
      return true;
    } catch (error) {
      logger.error("Manual sync failed:", error);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    // State
    chats: store.chats,
    isLoading: store.isLoading || queryLoading,
    error: store.error,
    hasMore: store.hasMore,
    total: store.total,
    isInitialized: store.isInitialized,
    isOnline,

    // Actions
    loadChats,
    loadMoreChats,
    createChat,
    updateChat,
    deleteChat,
    clearError: store.clearError,
    sendMessage,

    // Utilities
    forceSyncWithServer,
  };
};
