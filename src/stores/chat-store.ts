/**
 * Zustand store for chat state management
 */

import { create } from "zustand";

import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { indexedDB } from "@/lib/storage/indexed-db";
import type { Chat, ChatBranch, Message } from "@/types/graphql";

interface ChatState {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  currentBranches: ChatBranch[];
  messages: Record<string, Message[]>; // branchId -> messages
  isLoading: boolean;
  error: string | null;
  hasMoreChats: boolean;
  hasMoreMessages: Record<string, boolean>; // branchId -> hasMore

  // Actions
  setChats: (chats: Chat[], hasMore?: boolean, append?: boolean) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setBranches: (branches: ChatBranch[]) => void;
  setMessages: (
    branchId: string,
    messages: Message[],
    hasMore?: boolean,
    append?: boolean
  ) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string, branchId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  syncWithOfflineData: () => Promise<void>;
  cacheData: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: [],
  currentChat: null,
  currentBranches: [],
  messages: {},
  isLoading: false,
  error: null,
  hasMoreChats: false,
  hasMoreMessages: {},

  // Actions
  setChats: (chats: Chat[], hasMore = false, append = false) => {
    set((state) => ({
      chats: append ? [...state.chats, ...chats] : chats,
      hasMoreChats: hasMore,
    }));

    // Cache data offline
    get().cacheData();
    logger.debug(`Set ${chats.length} chats (append: ${append})`);
  },

  addChat: (chat: Chat) => {
    set((state) => ({
      chats: [chat, ...state.chats],
    }));

    get().cacheData();
    logger.debug("Added new chat:", chat._id);
  },

  updateChat: (chat: Chat) => {
    set((state) => ({
      chats: state.chats.map((c) => (c._id === chat._id ? chat : c)),
      currentChat:
        state.currentChat?._id === chat._id ? chat : state.currentChat,
    }));

    get().cacheData();
    logger.debug("Updated chat:", chat._id);
  },

  removeChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((c) => c._id !== chatId),
      currentChat: state.currentChat?._id === chatId ? null : state.currentChat,
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([branchId]) => {
          // Remove messages for branches belonging to this chat
          return !state.currentBranches.some((b) => b._id === branchId);
        })
      ),
    }));

    get().cacheData();
    logger.debug("Removed chat:", chatId);
  },

  setCurrentChat: (chat: Chat | null) => {
    set({ currentChat: chat });
    logger.debug("Set current chat:", chat?._id);
  },

  setBranches: (branches: ChatBranch[]) => {
    set({ currentBranches: branches });
    logger.debug(`Set ${branches.length} branches`);
  },

  setMessages: (
    branchId: string,
    messages: Message[],
    hasMore = false,
    append = false
  ) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [branchId]: append
          ? [...(state.messages[branchId] || []), ...messages]
          : messages,
      },
      hasMoreMessages: {
        ...state.hasMoreMessages,
        [branchId]: hasMore,
      },
    }));

    // Cache messages offline
    indexedDB.storeMessages(messages).catch((error) => {
      logger.error("Failed to cache messages:", error);
    });

    logger.debug(
      `Set ${messages.length} messages for branch ${branchId} (append: ${append})`
    );
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.branchId]: [
          ...(state.messages[message.branchId] || []),
          message,
        ],
      },
    }));

    // Cache single message
    indexedDB.storeMessages([message]).catch((error) => {
      logger.error("Failed to cache message:", error);
    });

    logger.debug("Added new message:", message._id);
  },

  updateMessage: (message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.branchId]: (state.messages[message.branchId] || []).map((m) =>
          m._id === message._id ? message : m
        ),
      },
    }));

    indexedDB.storeMessages([message]).catch((error) => {
      logger.error("Failed to cache updated message:", error);
    });

    logger.debug("Updated message:", message._id);
  },

  removeMessage: (messageId: string, branchId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [branchId]: (state.messages[branchId] || []).filter(
          (m) => m._id !== messageId
        ),
      },
    }));

    logger.debug("Removed message:", messageId);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error("Chat store error:", error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  syncWithOfflineData: async () => {
    try {
      const offlineChats = await indexedDB.getChats();

      if (offlineChats.length > 0) {
        set(() => ({
          chats: offlineChats,
          hasMoreChats: false,
        }));

        logger.info(`Loaded ${offlineChats.length} chats from offline storage`);
      }
    } catch (error) {
      logger.error("Failed to sync with offline data:", error);
    }
  },

  cacheData: async () => {
    try {
      const state = get();
      if (state.chats.length > 0) {
        await indexedDB.storeChats(state.chats);
      }
    } catch (error) {
      logger.error("Failed to cache chat data:", error);
    }
  },
}));

// Setup socket listeners for chat events
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
  "message:new": (message: Message) => {
    const { addMessage } = useChatStore.getState();
    addMessage(message);
  },
  "message:updated": (message: Message) => {
    const { updateMessage } = useChatStore.getState();
    updateMessage(message);
  },
  "message:deleted": (messageId: string) => {
    const { messages, removeMessage } = useChatStore.getState();

    // Find the branch containing this message
    for (const [branchId, branchMessages] of Object.entries(messages)) {
      if (branchMessages.some((m) => m._id === messageId)) {
        removeMessage(messageId, branchId);
        break;
      }
    }
  },
});
