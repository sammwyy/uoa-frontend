import { useMutation } from "@apollo/client";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle,
  Mail,
  Moon,
  Sun,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/apollo/queries";
import type { LoginDTO, RegisterDto } from "@/lib/graphql";
import { logger } from "@/lib/logger";

type AuthMode = "login" | "register";

export const AuthView: React.FC = () => {
  const { login, isAuthenticated, isOnline } = useAuth();
  const { baseTheme, toggleBaseTheme } = useTheme();
  const location = useLocation();

  // GraphQL mutations
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "register") {
      if (!formData.name) {
        newErrors.name = "Name is required";
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (credentials: LoginDTO) => {
    try {
      logger.info("Attempting login", { email: credentials.email });

      const { data } = await loginMutation({
        variables: { payload: credentials },
        errorPolicy: "none",
      });

      if (!data?.login) {
        throw new Error("Login failed: No session data returned");
      }

      // Call the hook with session data
      login(
        {
          accessToken: data.login.accessToken,
          refreshToken: data.login.refreshToken,
          decryptKey: data.login.rawDecryptKey,
        },
        data.login.user
      );

      logger.info("Login successful", { userId: data.login.user?._id });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      logger.error("Login failed:", error);
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (userData: RegisterDto) => {
    try {
      logger.info("Attempting registration", { email: userData.email });

      const { data } = await registerMutation({
        variables: { payload: userData },
        errorPolicy: "none",
      });

      if (!data?.register) {
        throw new Error("Registration failed: No session data returned");
      }

      // Call the hook with session data
      login(
        {
          accessToken: data.register.accessToken,
          refreshToken: data.register.refreshToken,
          decryptKey: data.register.rawDecryptKey,
        },
        data.register.user
      );

      logger.info("Registration successful", {
        userId: data.register.user?._id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      logger.error("Registration failed:", error);
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check connection
    if (!isOnline) {
      setErrors({ submit: "Cannot authenticate while offline" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === "login") {
        await handleLogin({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await handleRegister({
          displayName: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setFormData({
      email: formData.email, // Keep email when switching
      password: "",
      name: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Dark mode toggle */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="secondary"
          size="md"
          icon={baseTheme === "dark" ? Sun : Moon}
          onClick={toggleBaseTheme}
          className="p-3 rounded-full shadow-lg backdrop-blur-md"
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === "login"
                ? "Sign in to continue your AI conversations"
                : "Join us and start chatting with AI assistants"}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
            {/* Offline warning */}
            {!isOnline && (
              <div className="mb-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      No Connection
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You need an internet connection to sign in or register.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo credentials info */}
            {mode === "login" && isOnline && (
              <div className="mb-6 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Demo Credentials
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>
                        <strong>Email:</strong> demo@example.com
                      </p>
                      <p>
                        <strong>Password:</strong> password123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {errors.submit && (
                <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-700/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {errors.submit}
                    </p>
                  </div>
                </div>
              )}

              {/* Name field (register only) */}
              {mode === "register" && (
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  icon={User}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={isSubmitting || !isOnline}
                  autoComplete="name"
                />
              )}

              {/* Email field */}
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                icon={Mail}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting || !isOnline}
                autoComplete="email"
              />

              {/* Password field */}
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                error={!!errors.password}
                helperText={
                  errors.password ||
                  (mode === "register" ? "Must be at least 6 characters" : "")
                }
                disabled={isSubmitting || !isOnline}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />

              {/* Confirm password field (register only) */}
              {mode === "register" && (
                <PasswordInput
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={isSubmitting || !isOnline}
                  autoComplete="new-password"
                />
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !isOnline}
                className="w-full"
                icon={isSubmitting ? undefined : ArrowRight}
                iconPosition="right"
              >
                {isSubmitting
                  ? mode === "login"
                    ? "Signing In..."
                    : "Creating Account..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>

            {/* Mode switch */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isSubmitting}
                  className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors duration-200 disabled:opacity-50"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
