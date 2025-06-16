/**
 * Apollo Client configuration with authentication and error handling
 * Includes token refresh logic and offline capabilities
 */

import {
  ApolloClient,
  createHttpLink,
  FetchResult,
  from,
  InMemoryCache,
  NextLink,
  NormalizedCacheObject,
  Observable,
  Operation,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import { crossTabSync } from "../auth/cross-tab-sync";
import { logger } from "../logger";
import { LocalStorage } from "../storage/local-storage";

class ApolloClientManager {
  private static instance: ApolloClientManager;
  private client: ApolloClient<NormalizedCacheObject> | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  private constructor() {}

  static getInstance(): ApolloClientManager {
    if (!ApolloClientManager.instance) {
      ApolloClientManager.instance = new ApolloClientManager();
    }
    return ApolloClientManager.instance;
  }

  /**
   * Initialize Apollo Client with all necessary links
   */
  createClient(): ApolloClient<NormalizedCacheObject> {
    if (this.client) {
      return this.client;
    }

    const httpLink = createHttpLink({
      uri:
        import.meta.env.VITE_GRAPHQL_ENDPOINT ||
        "http://localhost:4000/graphql",
    });

    // Auth link to add authorization headers
    const authLink = setContext(async (_, { headers }) => {
      const tokens = LocalStorage.getAuthTokens();

      return {
        headers: {
          ...headers,
          ...(tokens.accessToken && {
            authorization: `Bearer ${tokens.accessToken}`,
          }),
        },
      };
    });

    // Error link to handle authentication errors and token refresh
    const errorLink = onError(
      ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          let mustRefresh = false;

          graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            logger.error("GraphQL Error:", {
              message,
              locations,
              path,
              extensions,
            });

            // Handle authentication errors
            if (
              extensions?.code === "UNAUTHENTICATED" ||
              message.includes("Unauthorized")
            ) {
              mustRefresh = true;
            }
          });

          if (mustRefresh) {
            return new Observable((observer) => {
              this.handleTokenRefresh(operation, forward)
                .then((result) => {
                  result.subscribe(observer);
                })
                .catch((error) => {
                  observer.error(error);
                });
            });
          }
        }

        if (networkError) {
          logger.error("Network Error:", networkError);

          // Handle network errors that might indicate auth issues
          if ("statusCode" in networkError && networkError.statusCode === 401) {
            return new Observable((observer) => {
              this.handleTokenRefresh(operation, forward)
                .then((result) => {
                  result.subscribe(observer);
                })
                .catch((error) => {
                  observer.error(error);
                });
            });
          }
        }

        return;
      }
    );

    // Retry link for handling temporary failures
    const retryLink = new RetryLink({
      delay: {
        initial: 300,
        max: Infinity,
        jitter: true,
      },
      attempts: {
        max: 3,
        retryIf: (error) => {
          // Retry on network errors but not on auth errors
          return !!error && !error.message.includes("Unauthorized");
        },
      },
    });

    // Cache configuration
    const cache = new InMemoryCache({
      typePolicies: {
        Chat: {
          fields: {
            defaultBranch: {
              merge: true,
            },
          },
        },
        ChatsResponse: {
          fields: {
            chats: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming];
              },
            },
          },
        },
        MessagesResponse: {
          fields: {
            messages: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming];
              },
            },
          },
        },
      },
    });

    this.client = new ApolloClient({
      link: from([authLink, errorLink, retryLink, httpLink]),
      cache,
      defaultOptions: {
        watchQuery: {
          errorPolicy: "ignore",
          fetchPolicy: "standby",
        },
        query: {
          errorPolicy: "all",
          fetchPolicy: "standby",
        },
      },
    });

    logger.info("Apollo Client initialized");
    return this.client;
  }

  /**
   * Handle token refresh when authentication fails
   */
  private async handleTokenRefresh(
    operation: Operation,
    forward: NextLink
  ): Promise<Observable<FetchResult>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        const newTokens = await this.refreshTokens();

        if (newTokens) {
          // Process all queued requests with new token
          this.failedQueue.forEach(({ resolve }) =>
            resolve(newTokens.accessToken)
          );
          this.failedQueue = [];

          // Broadcast token update to other tabs
          crossTabSync.broadcastTokenUpdate(
            newTokens.accessToken,
            newTokens.refreshToken
          );

          // Retry the original operation
          return forward(operation);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (error) {
        // Reject all queued requests
        this.failedQueue.forEach(({ reject }) => reject(error));
        this.failedQueue = [];

        // Clear auth data and redirect to login
        LocalStorage.clearAuthData();
        crossTabSync.broadcastLogout();

        logger.error("Token refresh failed, user logged out");
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    // Queue the request if already refreshing
    return new Promise((resolve, reject) => {
      this.failedQueue.push({
        resolve: (token: string) => {
          operation.setContext({
            headers: {
              ...operation.getContext().headers,
              authorization: `Bearer ${token}`,
            },
          });
          resolve(forward(operation));
        },
        reject,
      });
    });
  }

  /**
   * Refresh authentication tokens
   */
  private async refreshTokens(): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const tokens = LocalStorage.getAuthTokens();

    if (!tokens.refreshToken) {
      logger.warn("No refresh token available");
      return null;
    }

    try {
      // Create a simple HTTP request to avoid circular dependency
      const response = await fetch(
        import.meta.env.VITE_GRAPHQL_ENDPOINT ||
          "http://localhost:4000/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                accessToken
                refreshToken
              }
            }
          `,
            variables: {
              refreshToken: tokens.refreshToken,
            },
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Token refresh failed");
      }

      const newTokens = result.data?.refreshToken;

      if (newTokens) {
        // Store new tokens
        LocalStorage.setAuthTokens(
          newTokens.accessToken,
          newTokens.refreshToken
        );
        logger.info("Tokens refreshed successfully");
        return newTokens;
      }

      throw new Error("Invalid refresh response");
    } catch (error) {
      logger.error("Failed to refresh tokens:", error);
      return null;
    }
  }

  /**
   * Get the current Apollo Client instance
   */
  getClient(): ApolloClient<NormalizedCacheObject> {
    if (!this.client) {
      return this.createClient();
    }
    return this.client;
  }

  /**
   * Reset the Apollo Client cache
   */
  async resetCache(): Promise<void> {
    if (this.client) {
      await this.client.resetStore();
      logger.info("Apollo Client cache reset");
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.client) {
      this.client.stop();
      this.client = null;
    }
    this.failedQueue = [];
    this.isRefreshing = false;
    logger.info("Apollo Client destroyed");
  }
}

export const apolloClientManager = ApolloClientManager.getInstance();
export const apolloClient = apolloClientManager.getClient();
