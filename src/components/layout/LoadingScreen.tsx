import { Bot, Loader2 } from "lucide-react";
import React from "react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  submessage = "Please wait while we prepare everything for you",
}) => {
  return (
    <div className="min-h-screen bg-theme-gradient transition-colors duration-300 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <Bot className="w-12 h-12 text-white" />
          </div>

          {/* Spinning loader around the logo */}
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <Loader2 className="w-24 h-24 text-primary-500 animate-spin opacity-30" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          {message}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {submessage}
        </p>

        {/* Loading Progress Dots */}
        <div className="flex justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-200/20 to-secondary-200/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary-200/20 to-primary-200/20 blur-3xl" />
        </div>
      </div>
    </div>
  );
};
