import { Bot, Menu, MessageSquare, PenTool, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChatInput } from "@/components/chat/ChatInput";
import { FileAttachment } from "@/components/chat/FileAttachmentList";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useModels } from "@/hooks/useModels";
import { useTools } from "@/hooks/useTools";
import { Tools } from "@/lib/data/tools";
import { ChatBranch } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Card } from "../components/ui/Card";

export const WelcomeView: React.FC = () => {
  const { models } = useModels();
  const { user, isAuthenticated, session } = useAuth();
  const { toggle: toggleSidebar } = useSidebarStore();
  const { createChat } = useChats();
  const { toggleTool, toolStates } = useTools(Tools);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const navigate = useNavigate();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [dummyNewBranch, setDummyNewBranch] = useState<ChatBranch>({
    _id: "dummy-new-branch",
    branchPoint: 0,
    isActive: true,
    messageCount: 0,
    name: "New Chat",
    chatId: "",
    modelConfig: {},
  });
  const selectedModel = models.find(
    (model) => model.id === dummyNewBranch.modelConfig?.modelId
  );

  const handleSendMessage = async (message: string) => {
    if (!selectedModel) {
      console.error("No model selected, cannot send message");
      return;
    }

    if (!dummyNewBranch.modelConfig?.apiKeyId) {
      console.error("No API key selected, cannot send message");
      return;
    }

    if (!session?.decryptKey) {
      console.error("No session decrypt key available, cannot send message");
      return;
    }

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    try {
      setIsCreatingChat(true);
      logger.info("Creating new chat and sending first message");

      // Create new chat
      const newChat = await createChat();

      // Add pending message
      // ToDo: Move this to a global context/hook.

      if (newChat && newChat.defaultBranch) {
        localStorage.setItem(
          "uoa:tempPendingMessage",
          JSON.stringify({
            branchId: newChat.defaultBranch._id,
            prompt: message,
            modelId: selectedModel?.id,
            apiKeyId: dummyNewBranch.modelConfig?.apiKeyId,
            rawDecryptKey: session?.decryptKey,
            attachments: attachments.map((a) => a.upload?._id),
          })
        );

        // Navigate to the new chat
        navigate(`/c/${newChat._id}`);
      }
    } catch (error) {
      logger.error("Failed to create chat and send message:", error);
    } finally {
      setIsCreatingChat(false);
    }
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

          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelectModel={(model) => {
              setDummyNewBranch((prev) => ({
                ...prev,
                modelConfig: {
                  ...prev.modelConfig,
                  modelId: model.id,
                },
              }));
            }}
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
          modelConfig={dummyNewBranch.modelConfig || {}}
          onChangeModelConfig={(config) => {
            setDummyNewBranch((prev) => ({
              ...prev,
              modelConfig: {
                ...prev.modelConfig,
                ...config,
              },
            }));
          }}
          attachments={attachments}
          setAttachments={setAttachments}
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
