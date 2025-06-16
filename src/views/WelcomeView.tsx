import {
  Bot,
  Lightbulb,
  Menu,
  MessageSquare,
  PenTool,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useModels } from "@/hooks/useModels";
import { useTools } from "@/hooks/useTools";
import { Tools } from "@/lib/data/tools";
import { logger } from "@/lib/logger";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Card } from "../components/ui/Card";

const suggestions = [
  {
    icon: "💡",
    title: "Creative Writing",
    description: "Help me write a story about...",
    prompt:
      "Help me write a creative story about a time traveler who discovers that changing the past creates parallel universes. I want it to be thought-provoking and include some scientific elements.",
  },
  {
    icon: "🔧",
    title: "Code Review",
    description: "Review my code and suggest improvements",
    prompt:
      "I have a React component that's getting complex. Can you review it and suggest ways to make it more maintainable and performant?",
  },
  {
    icon: "📚",
    title: "Learning Assistant",
    description: "Explain a complex topic in simple terms",
    prompt:
      "Can you explain quantum computing in simple terms? I'm a beginner but I want to understand the basic concepts and potential applications.",
  },
  {
    icon: "🎯",
    title: "Problem Solving",
    description: "Help me brainstorm solutions",
    prompt:
      "I'm working on improving team productivity in a remote work environment. Can you help me brainstorm innovative solutions and best practices?",
  },
  {
    icon: "✍️",
    title: "Content Creation",
    description: "Create engaging content for my audience",
    prompt:
      "Help me create engaging social media content for a tech startup. I need ideas for posts that showcase our innovation while being accessible to non-technical audiences.",
  },
  {
    icon: "🔍",
    title: "Research Assistant",
    description: "Help me research and analyze information",
    prompt:
      "I'm researching sustainable energy solutions for urban environments. Can you help me analyze the pros and cons of different technologies and their feasibility?",
  },
];

export const WelcomeView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toggle: toggleSidebar } = useSidebarStore();
  const { createChat, sendMessage } = useChats();
  const { models } = useModels();
  const { toggleTool, toolStates } = useTools(Tools);

  const navigate = useNavigate();

  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Get default model (first enabled model)
  const defaultModel = models.find((m) => m.enabled) || models[0];

  const handleSendMessage = async (message: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    try {
      setIsCreatingChat(true);
      logger.info("Creating new chat and sending first message");

      // Create new chat
      const newChat = await createChat();

      if (newChat && newChat.defaultBranch) {
        // Send the message to the new chat
        await sendMessage({
          branchId: newChat.defaultBranch._id,
          prompt: message,
          modelId: defaultModel?.id || "gpt-4",
          apiKeyId: "", // Use default API key
          rawDecryptKey: "", // Will be handled by the backend
        });

        // Navigate to the new chat
        navigate(`/c/${newChat._id}`);
      }
    } catch (error) {
      logger.error("Failed to create chat and send message:", error);
      // TODO: Show error toast
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="w-full h-[100vh] sm:h-[95vh] bg-chat-container backdrop-blur-md rounded-none sm:rounded-3xl shadow-glass dark:shadow-glass-dark border-0 sm:border border-white/20 dark:border-gray-700/30 relative overflow-hidden">
      {/* Main Content */}
      <div className="h-full overflow-y-auto">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
          <Button
            variant="secondary"
            size="sm"
            icon={Menu}
            onClick={toggleSidebar}
            className="p-2 flex-shrink-0"
            title="Toggle sidebar"
          />
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
          {/* Welcome Header */}
          <div className="text-center space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto shadow-xl animate-pulse">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                I'm your AI assistant, ready to help with anything you need.
                What would you like to explore today?
              </p>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Popular Starting Points
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Click any suggestion below to start a conversation, or type your
                own message
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  variant="glass"
                  padding="lg"
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="cursor-pointer group hover:scale-[1.02] transition-all duration-200 hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {suggestion.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card variant="glass" padding="md" className="text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Multiple AI Models
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose from various AI models optimized for different tasks
                </p>
              </div>
            </Card>

            <Card variant="glass" padding="md" className="text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/40 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Conversation Branches
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore different conversation paths with branching
                </p>
              </div>
            </Card>

            <Card variant="glass" padding="md" className="text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
                  <PenTool className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Rich Media Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send drawings, audio recordings, and files
                </p>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          {isAuthenticated && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Continue Where You Left Off
              </h2>
              <Card variant="glass" padding="md" className="text-center">
                <div className="space-y-3">
                  <Lightbulb className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Your recent conversations will appear here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Start a new conversation to see your chat history
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Floating Input */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-chat-container via-chat-container/95 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isCreatingChat}
          toggleTool={toggleTool}
          toolStates={toolStates}
          placeholder={
            isAuthenticated
              ? "Ask me anything... (Shift+Enter for new line)"
              : "Sign in to start chatting with AI..."
          }
          disabled={!isAuthenticated}
        />

        {!isAuthenticated && (
          <div className="text-center mt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={() => navigate("/auth")}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Sign in
              </button>{" "}
              to start your AI conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
