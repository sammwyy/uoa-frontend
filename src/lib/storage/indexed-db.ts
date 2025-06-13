/**
 * IndexedDB utilities for offline data storage
 * Handles bulk data caching for chats, messages, and API keys
 */

import type { AIModel, ApiKey, Chat, Message } from "@/types/graphql";
import { IDBPDatabase, openDB } from "idb";

import { logger } from "../logger";

const DB_NAME = "ai-chat-client";
const DB_VERSION = 1;

interface ChatDBSchema {
  chats: Chat;
  messages: Message;
  apiKeys: ApiKey;
  models: AIModel;
}

class IndexedDBManager {
  private db: IDBPDatabase<ChatDBSchema> | null = null;
  private static instance: IndexedDBManager;

  private constructor() {}

  static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create chats store
          if (!db.objectStoreNames.contains("chats")) {
            const chatsStore = db.createObjectStore("chats", {
              keyPath: "_id",
            });
            chatsStore.createIndex("lastActivityAt", "lastActivityAt");
            chatsStore.createIndex("pinned", "pinned");
            chatsStore.createIndex("archived", "archived");
          }

          // Create messages store
          if (!db.objectStoreNames.contains("messages")) {
            const messagesStore = db.createObjectStore("messages", {
              keyPath: "_id",
            });
            messagesStore.createIndex("branchId", "branchId");
            messagesStore.createIndex("index", "index");
            messagesStore.createIndex("role", "role");
          }

          // Create API keys store
          if (!db.objectStoreNames.contains("apiKeys")) {
            const apiKeysStore = db.createObjectStore("apiKeys", {
              keyPath: "_id",
            });
            apiKeysStore.createIndex("provider", "provider");
            apiKeysStore.createIndex("lastUsed", "lastUsed");
          }

          // Create models store
          if (!db.objectStoreNames.contains("models")) {
            const modelsStore = db.createObjectStore("models", {
              keyPath: "id",
            });
            modelsStore.createIndex("provider", "provider");
          }
        },
      });

      logger.info("IndexedDB initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize IndexedDB:", error);
      throw error;
    }
  }

  /**
   * Store chats data
   */
  async storeChats(chats: Chat[]): Promise<void> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized, skipping chats storage");
      return;
    }

    try {
      const tx = this.db.transaction("chats", "readwrite");
      const store = tx.objectStore("chats");

      await Promise.all(chats.map((chat) => store.put(chat)));
      await tx.done;

      logger.debug(`Stored ${chats.length} chats in IndexedDB`);
    } catch (error) {
      logger.error("Failed to store chats:", error);
    }
  }

  /**
   * Retrieve chats data
   */
  async getChats(limit?: number, offset?: number): Promise<Chat[]> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized");
      return [];
    }

    try {
      const tx = this.db.transaction("chats", "readonly");
      const store = tx.objectStore("chats");
      const index = store.index("lastActivityAt");

      let cursor = await index.openCursor(null, "prev"); // Most recent first
      const chats: Chat[] = [];
      let count = 0;
      let skipped = 0;

      while (cursor && (!limit || count < limit)) {
        if (!offset || skipped >= offset) {
          chats.push(cursor.value);
          count++;
        } else {
          skipped++;
        }
        cursor = await cursor.continue();
      }

      logger.debug(`Retrieved ${chats.length} chats from IndexedDB`);
      return chats;
    } catch (error) {
      logger.error("Failed to retrieve chats:", error);
      return [];
    }
  }

  /**
   * Store messages for a branch
   */
  async storeMessages(messages: Message[]): Promise<void> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized, skipping messages storage");
      return;
    }

    try {
      const tx = this.db.transaction("messages", "readwrite");
      const store = tx.objectStore("messages");

      await Promise.all(messages.map((message) => store.put(message)));
      await tx.done;

      logger.debug(`Stored ${messages.length} messages in IndexedDB`);
    } catch (error) {
      logger.error("Failed to store messages:", error);
    }
  }

  /**
   * Retrieve messages for a branch
   */
  async getMessages(
    branchId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[]> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized");
      return [];
    }

    try {
      const tx = this.db.transaction("messages", "readonly");
      const store = tx.objectStore("messages");
      const index = store.index("branchId");

      const messages = await index.getAll(branchId);

      // Sort by index and apply pagination
      messages.sort((a, b) => a.index - b.index);

      const start = offset || 0;
      const end = limit ? start + limit : undefined;

      const result = messages.slice(start, end);
      logger.debug(
        `Retrieved ${result.length} messages for branch ${branchId}`
      );

      return result;
    } catch (error) {
      logger.error("Failed to retrieve messages:", error);
      return [];
    }
  }

  /**
   * Store API keys
   */
  async storeApiKeys(apiKeys: ApiKey[]): Promise<void> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized, skipping API keys storage");
      return;
    }

    try {
      const tx = this.db.transaction("apiKeys", "readwrite");
      const store = tx.objectStore("apiKeys");

      await Promise.all(apiKeys.map((apiKey) => store.put(apiKey)));
      await tx.done;

      logger.debug(`Stored ${apiKeys.length} API keys in IndexedDB`);
    } catch (error) {
      logger.error("Failed to store API keys:", error);
    }
  }

  /**
   * Retrieve API keys
   */
  async getApiKeys(): Promise<ApiKey[]> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized");
      return [];
    }

    try {
      const apiKeys = await this.db.getAll("apiKeys");
      logger.debug(`Retrieved ${apiKeys.length} API keys from IndexedDB`);
      return apiKeys;
    } catch (error) {
      logger.error("Failed to retrieve API keys:", error);
      return [];
    }
  }

  /**
   * Store AI models
   */
  async storeModels(models: AIModel[]): Promise<void> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized, skipping models storage");
      return;
    }

    try {
      const tx = this.db.transaction("models", "readwrite");
      const store = tx.objectStore("models");

      await Promise.all(models.map((model) => store.put(model)));
      await tx.done;

      logger.debug(`Stored ${models.length} models in IndexedDB`);
    } catch (error) {
      logger.error("Failed to store models:", error);
    }
  }

  /**
   * Retrieve AI models
   */
  async getModels(): Promise<AIModel[]> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized");
      return [];
    }

    try {
      const models = await this.db.getAll("models");
      logger.debug(`Retrieved ${models.length} models from IndexedDB`);
      return models;
    } catch (error) {
      logger.error("Failed to retrieve models:", error);
      return [];
    }
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      logger.warn("IndexedDB not initialized");
      return;
    }

    try {
      const tx = this.db.transaction(
        ["chats", "messages", "apiKeys", "models"],
        "readwrite"
      );

      await Promise.all([
        tx.objectStore("chats").clear(),
        tx.objectStore("messages").clear(),
        tx.objectStore("apiKeys").clear(),
        tx.objectStore("models").clear(),
      ]);

      await tx.done;
      logger.info("All IndexedDB data cleared");
    } catch (error) {
      logger.error("Failed to clear IndexedDB data:", error);
    }
  }
}

export const indexedDB = IndexedDBManager.getInstance();
