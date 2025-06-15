import { Bot, Copy, ThumbsDown, ThumbsUp, User } from "lucide-react";
import React from "react";

import { Message } from "@/types";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { MessageRenderer } from "./MessageRenderer";
import { TTSButton } from "./TTSButton";
import { MessageSkeleton } from "../ui/Skeleton";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const { preferences } = useUserPreferences();

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(preferences.language, {
      timeZone: preferences.timezone,
      hour12: !preferences.use24HourFormat,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
            <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
            How can I help you today?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 text-base sm:text-lg leading-relaxed">
            Start a conversation with your AI assistant. Ask questions, get help
            with tasks, or just chat!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm max-w-md mx-auto">
            <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                💡 Get Ideas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Brainstorm creative solutions and explore new possibilities
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                📚 Learn
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Explore new topics and expand your knowledge
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                ✍️ Write
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Create content, documents, and written materials
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                🔧 Code
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Get programming help and technical assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getMessageTextContent = (message: Message) => {
    return message.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 my-28">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex gap-2 sm:gap-4 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          )}

          <div
            className={`group max-w-[85%] sm:max-w-[85%] ${
              message.role === "user" ? "order-last" : ""
            }`}
          >
            <div
              className={`
              p-3 sm:p-4 rounded-xl shadow-sm backdrop-blur-md
              ${
                message.role === "user"
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white ml-auto"
                  : "bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 text-gray-800 dark:text-gray-200"
              }
            `}
            >
              <MessageRenderer
                content={getMessageTextContent(message)}
                role={message.role}
              />
            </div>

            {/* Timestamp */}
            {preferences.showTimestamps && message.createdAt && (
              <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}>
                {formatTimestamp(message.createdAt)}
              </div>
            )}

            {message.role === "assistant" && (
              <div className="flex items-center gap-1 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => copyMessage(getMessageTextContent(message))}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                
                {/* TTS Button */}
                <TTSButton 
                  text={getMessageTextContent(message)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                />
                
                <button
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors"
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
                  title="Poor response"
                >
                  <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>

          {message.role === "user" && (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="space-y-6">
          <MessageSkeleton role="assistant" />
          {Math.random() > 0.5 && <MessageSkeleton role="assistant" />}
        </div>
      )}
    </div>
  );
};