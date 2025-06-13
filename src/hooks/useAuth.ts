/**
 * Hook for authentication operations
 */

import { useMutation } from "@apollo/client";

import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REGISTER_MUTATION,
} from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginDTO, RegisterDto } from "@/types";

export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login: setLoginState,
    logout: setLogoutState,
    setLoading,
    setError,
    clearError,
    initializeAuth,
  } = useAuthStore();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const login = async (credentials: LoginDTO) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Attempting login for user:", credentials.email);

      const { data } = await loginMutation({
        variables: { payload: credentials },
      });

      if (data?.login) {
        setLoginState(data.login);
        logger.info("Login successful");
        return data.login;
      } else {
        throw new Error("Login failed: No data returned");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      logger.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Attempting registration for user:", userData.email);

      const { data } = await registerMutation({
        variables: { payload: userData },
      });

      if (data?.register) {
        setLoginState(data.register);
        logger.info("Registration successful");
        return data.register;
      } else {
        throw new Error("Registration failed: No data returned");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      logger.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      logger.info("Attempting logout");

      // Call logout mutation to invalidate server-side session
      await logoutMutation();

      // Clear local state
      setLogoutState();

      logger.info("Logout successful");
    } catch (error) {
      logger.warn(
        "Logout mutation failed, clearing local state anyway:",
        error
      );
      // Clear local state even if server call fails
      setLogoutState();
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    clearError,
    initializeAuth,
  };
};
