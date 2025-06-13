import { Bot, GitBranch, Lock, LogIn, Share2, Unlock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { UserMenu } from "@/components/chat/UserMenu";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useModels } from "@/hooks/useModels";
import { useAuthStore } from "@/stores/auth-store";
import { AIModel, AddMessageDto, Chat } from "@/types";

export const AppView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    chats,
    currentChat,
    currentBranches,
    messages,
    loadChats,
    loadChat,
    loadMessages,
    sendMessage,
    setCurrentChat,
    isLoading: chatLoading,
    error: chatError,
  } = useChats();
  const { apiKeys, loadApiKeys } = useApiKeys();
  const { encryptKey } = useAuthStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState("");
  const { models } = useModels();

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadChats({ limit: 10 });
      loadApiKeys();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!id) return;

    const loadChatData = async () => {
      // First try to load from current chats
      let foundChat: Chat | undefined | null = chats.find((c) => c._id === id);

      if (!foundChat) {
        // Try to load the chat from API
        try {
          await loadChat(id);
          foundChat = currentChat;
        } catch {
          setChatNotFound(true);
          return;
        }
      }

      if (!foundChat) {
        setChatNotFound(true);
        return;
      }

      // Check access permissions
      if (!foundChat.isPublic && !isAuthenticated) {
        setAccessDenied(true);
        return;
      }

      setChat(foundChat);
      setCurrentChat(foundChat);
      setChatNotFound(false);
      setAccessDenied(false);

      // Set default branch
      if (foundChat.defaultBranch) {
        setCurrentBranchId(foundChat.defaultBranch._id);
      }
    };

    loadChatData();
  }, [id, chats, isAuthenticated, currentChat]);

  // Load messages when branch changes
  useEffect(() => {
    if (currentBranchId) {
      loadMessages({
        branchId: currentBranchId,
        limit: 20,
      });
    }
  }, [currentBranchId]);

  // Update chat when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat._id === id) {
      setChat(currentChat);
      if (currentChat.defaultBranch && !currentBranchId) {
        setCurrentBranchId(currentChat.defaultBranch._id);
      }
    }
  }, [currentChat, id, currentBranchId]);

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: location, chatId: id } });
      return;
    }

    if (!currentBranchId || !encryptKey || !selectedModel || !selectedApiKey) {
      alert("Please select a model and API key before sending a message.");
      return;
    }

    try {
      const messageData: AddMessageDto = {
        branchId: currentBranchId,
        prompt: content.trim(),
        modelId: selectedModel.id,
        apiKeyId: selectedApiKey,
        rawDecryptKey: encryptKey,
      };

      await sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleShare = async () => {
    if (!chat) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Chat link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleBranchSelect = (branchId: string) => {
    setCurrentBranchId(branchId);
  };

  const handleBranchesUpdated = () => {
    if (chat) {
      loadChat(chat._id);
    }
  };

  const handleUpdateTitle = (chatId: string, newTitle: string) => {
    // Implement chat title update API call
    console.log("Update title:", chatId, newTitle);
  };

  const handleUpdatePrivacy = (chatId: string, isPrivate: boolean) => {
    // Implement chat privacy update API call
    console.log("Update privacy:", chatId, isPrivate);
  };

  // Redirect to auth if trying to access private chat without authentication
  if (accessDenied) {
    return (
      <Navigate to="/auth" state={{ from: location, chatId: id }} replace />
    );
  }

  // Chat not found
  if (chatNotFound) {
    return (
      <div className="min-h-screen bg-theme-gradient transition-colors duration-300">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Chat Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The conversation you're looking for doesn't exist or has been
              deleted.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Go to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (!chat) {
    return (
      <div className="min-h-screen bg-theme-gradient transition-colors duration-300">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Loading Chat...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we load the conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentMessages = currentBranchId
    ? messages[currentBranchId] || []
    : [];

  return (
    <div className="min-h-screen bg-theme-gradient transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full h-[95vh] max-h-[95vh] bg-chat-container backdrop-blur-md rounded-3xl shadow-glass dark:shadow-glass-dark border border-white/20 dark:border-gray-700/30 flex flex-col relative overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 left-0 right-0 z-10 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between p-4 lg:p-6">
              {/* Left Section - Chat Info */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {chat.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={chat.isPublic ? "success" : "danger"}
                      size="sm"
                    >
                      {chat.isPublic ? (
                        <>
                          <Unlock className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentMessages.length} messages
                    </span>
                    {/* Branch indicator */}
                    <button
                      onClick={() => setShowBranches(!showBranches)}
                      className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>{currentBranches.length} branches</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-3">
                {/* Share button (only for public chats) */}
                {chat.isPublic && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Share2}
                    onClick={handleShare}
                    title="Share chat"
                  />
                )}

                {/* User menu or Sign in button */}
                {isAuthenticated ? (
                  <UserMenu onOpenSettings={() => setSettingsOpen(true)} />
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    icon={LogIn}
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Guest notice for unauthenticated users */}
          {!isAuthenticated && (
            <div className="mx-6 mt-4">
              <Card
                padding="md"
                className="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You're viewing this conversation as a guest.
                      <button
                        onClick={() => navigate("/auth")}
                        className="font-medium underline hover:no-underline ml-1"
                      >
                        Sign in
                      </button>{" "}
                      to participate in the conversation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Configuration Panel for Authenticated Users */}
          {isAuthenticated && (
            <div className="mx-6 mt-4">
              <Card
                padding="md"
                className="bg-gray-50/80 dark:bg-gray-900/20 border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Model Selector */}
                  <div className="flex-1 min-w-[200px]">
                    <ModelSelector
                      models={models}
                      selectedModel={selectedModel || models[0]}
                      onSelectModel={setSelectedModel}
                    />
                  </div>

                  {/* API Key Selector */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={selectedApiKey}
                      onChange={(e) => setSelectedApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-sm"
                    >
                      <option value="">Select API Key</option>
                      {apiKeys.map((apiKey) => (
                        <option key={apiKey._id} value={apiKey._id}>
                          {apiKey.alias} ({apiKey.provider})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {chatError && (
            <div className="mx-6 mt-4">
              <Card
                padding="md"
                className="bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50"
              >
                <p className="text-sm text-red-800 dark:text-red-200">
                  {chatError}
                </p>
              </Card>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1">
            <ChatArea messages={currentMessages} isLoading={chatLoading} />
          </div>

          {/* Chat Input - Only show for authenticated users */}
          {isAuthenticated && (
            <div className="sticky bottom-0 left-0 right-0 p-6">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={chatLoading}
                disabled={!selectedModel || !selectedApiKey}
                placeholder={
                  !selectedModel || !selectedApiKey
                    ? "Please select a model and API key to start chatting..."
                    : "Type your message here... (Shift+Enter for new line)"
                }
              />
            </div>
          )}

          {/* Sign in prompt for guests */}
          {!isAuthenticated && (
            <div className="sticky bottom-0 left-0 right-0 p-6">
              <Card padding="md" className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Want to join the conversation?
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={LogIn}
                  onClick={() => navigate("/auth")}
                  className="w-full"
                >
                  Sign In to Chat
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
