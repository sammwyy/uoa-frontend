/**
 * Local Storage utilities for persisting auth tokens and user preferences
 * Handles encryption keys, access tokens, and refresh tokens
 */

import { User } from "@/lib/graphql";
import { logger } from "../logger";

export class LocalStorage {
  private static readonly KEYS = {
    ACCESS_TOKEN: "oua:auth:accessToken",
    REFRESH_TOKEN: "oua:auth:refreshToken",
    ENCRYPT_KEY: "oua:auth:decryptKey",
    USER_DATA: "oua:auth:userData",
    LAST_SYNC: "oua:app:lastSync",
    PREFERENCES: "oua:app:preferences",
  } as const;

  /**
   * Store authentication tokens securely
   */
  static setAuthTokens(
    accessToken: string,
    refreshToken: string,
    decryptKey: string
  ): void {
    try {
      localStorage.setItem(this.KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(this.KEYS.ENCRYPT_KEY, decryptKey);

      logger.debug("Auth tokens stored successfully", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasDecryptKey: !!decryptKey,
      });
    } catch (error) {
      logger.error("Failed to store auth tokens:", error);
      throw new Error("Storage unavailable");
    }
  }

  /**
   * Retrieve authentication tokens
   */
  static getAuthTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    decryptKey: string | null;
  } {
    try {
      const tokens = {
        accessToken: localStorage.getItem(this.KEYS.ACCESS_TOKEN),
        refreshToken: localStorage.getItem(this.KEYS.REFRESH_TOKEN),
        decryptKey: localStorage.getItem(this.KEYS.ENCRYPT_KEY),
      };

      logger.debug("Retrieved auth tokens from localStorage", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasDecryptKey: !!tokens.decryptKey,
      });

      return tokens;
    } catch (error) {
      logger.error("Failed to retrieve auth tokens:", error);
      return {
        accessToken: null,
        refreshToken: null,
        decryptKey: null,
      };
    }
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    try {
      const keysToRemove = [
        this.KEYS.ACCESS_TOKEN,
        this.KEYS.REFRESH_TOKEN,
        this.KEYS.ENCRYPT_KEY,
        this.KEYS.USER_DATA,
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      logger.info("Auth data cleared from localStorage");
    } catch (error) {
      logger.error("Failed to clear auth data:", error);
    }
  }

  /**
   * Store user data
   */
  static setUserData(userData: User): void {
    try {
      localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
      logger.debug("User data stored", { userId: userData?._id });
    } catch (error) {
      logger.error("Failed to store user data:", error);
    }
  }

  /**
   * Get user data
   */
  static getUserData(): User | null {
    try {
      const data = localStorage.getItem(this.KEYS.USER_DATA);
      const userData = data ? JSON.parse(data) : null;

      if (userData) {
        logger.debug("Retrieved user data from localStorage", {
          userId: userData._id,
        });
      }

      return userData;
    } catch (error) {
      logger.error("Failed to retrieve user data:", error);
      return null;
    }
  }

  /**
   * Update last sync timestamp
   */
  static setLastSync(timestamp: Date): void {
    try {
      localStorage.setItem(this.KEYS.LAST_SYNC, timestamp.toISOString());
    } catch (error) {
      logger.error("Failed to store last sync timestamp:", error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static getLastSync(): Date | null {
    try {
      const timestamp = localStorage.getItem(this.KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      logger.error("Failed to retrieve last sync timestamp:", error);
      return null;
    }
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
