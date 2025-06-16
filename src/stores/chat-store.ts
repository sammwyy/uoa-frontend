import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { Chat, GetManyChatsDto } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { indexedDB } from "@/lib/storage/indexed-db";

interface ChatState {
  // Core state
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  isInitialized: boolean;

  // Pagination state
  currentParams: GetManyChatsDto;

  // State actions (pure)
  setChats: (
    chats: Chat[],
    hasMore: boolean,
    total: number,
    append?: boolean
  ) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setCurrentParams: (params: GetManyChatsDto) => void;
  setInitialized: (initialized: boolean) => void;

  // Offline/cache actions
  loadFromCache: () => Promise<void>;
  saveToCache: () => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    chats: [],
    currentChat: null,
    isLoading: false,
    error: null,
    hasMore: false,
    total: 0,
    isInitialized: false,
    currentParams: {},

    // Set chats (with optional append for pagination)
    setChats: (
      chats: Chat[],
      hasMore: boolean,
      total: number,
      append = false
    ) => {
      set((state) => ({
        chats: append ? [...state.chats, ...chats] : chats,
        hasMore,
        total,
      }));

      logger.debug(
        `Set ${chats.length} chats (append: ${append}, total: ${total})`
      );
    },

    // Add single chat (for real-time updates)
    addChat: (chat: Chat) => {
      set((state) => ({
        chats: [chat, ...state.chats],
        total: state.total + 1,
      }));

      logger.debug("Added chat:", chat._id);
    },

    // Update existing chat
    updateChat: (chat: Chat) => {
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chat._id ? chat : c)),
        currentChat:
          state.currentChat?._id === chat._id ? chat : state.currentChat,
      }));

      logger.debug("Updated chat:", chat._id);
    },

    // Remove chat
    removeChat: (chatId: string) => {
      set((state) => ({
        chats: state.chats.filter((c) => c._id !== chatId),
        currentChat:
          state.currentChat?._id === chatId ? null : state.currentChat,
        total: Math.max(0, state.total - 1),
      }));

      logger.debug("Removed chat:", chatId);
    },

    // Set current active chat
    setCurrentChat: (chat: Chat | null) => {
      set({ currentChat: chat });
      logger.debug("Set current chat:", chat?._id);
    },

    // Loading state
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    // Error state
    setError: (error: string | null) => {
      set({ error });
      if (error) {
        logger.error("Chat store error:", error);
      }
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Set current query parameters (for pagination tracking)
    setCurrentParams: (params: GetManyChatsDto) => {
      set({ currentParams: params });
    },

    // Set initialization state
    setInitialized: (initialized: boolean) => {
      set({ isInitialized: initialized });
    },

    // Load chats from offline cache
    loadFromCache: async () => {
      try {
        const offlineChats = await indexedDB.getChats();

        if (offlineChats.length > 0) {
          set({
            chats: offlineChats,
            hasMore: false,
            total: offlineChats.length,
            isInitialized: true,
          });

          logger.info(`Loaded ${offlineChats.length} chats from cache`);
        } else {
          set({ isInitialized: true });
        }
      } catch (error) {
        logger.error("Failed to load from cache:", error);
        set({
          error: "Failed to load offline data",
          isInitialized: true,
        });
      }
    },

    // Save current chats to cache
    saveToCache: async () => {
      try {
        const { chats } = get();
        if (chats.length > 0) {
          await indexedDB.storeChats(chats);
          logger.debug(`Cached ${chats.length} chats`);
        }
      } catch (error) {
        logger.error("Failed to save to cache:", error);
      }
    },

    // Reset store to initial state
    reset: () => {
      set({
        chats: [],
        currentChat: null,
        isLoading: false,
        error: null,
        hasMore: false,
        total: 0,
        isInitialized: false,
        currentParams: {},
      });

      logger.debug("Chat store reset");
    },
  }))
);

// Socket event listeners for real-time updates
socketManager.setListeners({
  "chat:created": (chat: Chat) => {
    const { addChat } = useChatStore.getState();
    addChat(chat);
  },

  "chat:updated": (chat: Chat) => {
    const { updateChat } = useChatStore.getState();
    updateChat(chat);
  },

  "chat:deleted": (chatId: string) => {
    const { removeChat } = useChatStore.getState();
    removeChat(chatId);
  },
});
