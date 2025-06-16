import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useModels } from "@/hooks/useModels";
import { useTools } from "@/hooks/useTools";
import { apolloClient } from "@/lib/apollo/apollo-client";
import { GET_CHAT_MESSAGES_QUERY, GET_CHAT_QUERY } from "@/lib/apollo/queries";
import { Tools } from "@/lib/data/tools";
import {
  AIModel,
  Chat,
  ChatBranch,
  GetMessagesDto,
  MessagesResponse,
} from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../layout/LoadingScreen";
import { ChatArea } from "./ChatArea";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ToolsConfig } from "./ToolsConfigModal";

export interface ChatViewProps {
  chatId: string;
}

export function ChatView({ chatId }: ChatViewProps) {
  const { updateChat } = useChats();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentBranch, setCurrentBranch] = useState<ChatBranch | null>(null);
  const [branches, setBranches] = useState<ChatBranch[]>([]);
  const [messages, setMessages] = useState<MessagesResponse>({
    hasMore: false,
    messages: [],
    total: -1,
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { toggleTool, toolStates } = useTools(Tools);

  const { models } = useModels();
  const [selectedModel, setSelectedModel] = useState(
    models.find((m) => m.id === chat?.modelId)
  );

  // Tools configuration state
  const [toolsConfig, setToolsConfig] = useState<ToolsConfig>({
    temperature: 0.7,
    maxTokens: 2048,
  });

  // Load specific chat with branches
  const loadChat = async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);

      logger.info("Loading chat:", chatId);

      const { data, error: queryError } = await apolloClient.query({
        query: GET_CHAT_QUERY,
        variables: { query: { chatId } },
        fetchPolicy: "cache-first",
      });

      if (queryError) {
        throw queryError;
      }

      if (data?.getChat) {
        const { chat, branches } = data.getChat;
        setChat(chat);
        setBranches(branches);
        setCurrentBranch(chat.defaultBranch);
        logger.info(`Loaded chat ${chatId} with ${branches.length} branches`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chat";
      setError(errorMessage);
      logger.error("Failed to load chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a branch
  const loadMessages = async (params: GetMessagesDto, append = false) => {
    try {
      setMessagesLoading(true);
      setError(null);

      logger.info("Loading messages for branch:", params.branchId);

      const { data, error: queryError } = await apolloClient.query({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { query: params },
        fetchPolicy: "cache-first",
      });

      if (queryError) {
        throw queryError;
      }

      if (data?.getChatMessages) {
        if (append) {
          setMessages({
            hasMore: data.getChatMessages.hasMore,
            messages: [...messages.messages, ...data.getChatMessages.messages],
            total: data.getChatMessages.total,
          });
        } else {
          setMessages(data.getChatMessages);
        }

        logger.info(
          `Loaded ${data.getChatMessages.messages.length} messages for branch ${params.branchId}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      setError(errorMessage);
      logger.error("Failed to load messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handlers
  const onBranchSelect = (branchId: string) => {
    loadMessages({ branchId }, false);
  };

  const onBranchesUpdated = () => {
    loadChat(chatId);
  };

  const onChangeModel = (model: AIModel) => {
    setSelectedModel(model);
    updateChat(chatId, { modelId: model.id });
  };

  const handleSendMessage = async (message: string) => {
    console.log("Sending message:", message, " with model:", selectedModel?.id);
    console.log("Tools config:", toolsConfig);
  };

  const handleConfigChange = (config: ToolsConfig) => {
    setToolsConfig(config);
    console.log("Tools configuration updated:", config);
  };

  useEffect(() => {
    loadChat(chatId);
  }, [chatId]);

  useEffect(() => {
    console.log("Current branch:", currentBranch);
    if (currentBranch) {
      loadMessages({ branchId: currentBranch._id }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch]);

  // Show loading screen while loading chat data
  if (loading && !chat) {
    return (
      <LoadingScreen
        message="Loading chat..."
        submessage="Please wait while we load your conversation"
      />
    );
  }

  if (error) {
    return (
      <div className="w-full h-[100vh] sm:h-[95vh] bg-chat-container backdrop-blur-md rounded-none sm:rounded-3xl shadow-glass dark:shadow-glass-dark border-0 sm:border border-white/20 dark:border-gray-700/30 relative overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Error Loading Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
          <button
            onClick={() => loadChat(chatId)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100vh] sm:h-[95vh] bg-chat-container backdrop-blur-md rounded-none sm:rounded-3xl shadow-glass dark:shadow-glass-dark border-0 sm:border border-white/20 dark:border-gray-700/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20">
        <ChatHeader
          onBranchSelect={onBranchSelect}
          onBranchesUpdated={onBranchesUpdated}
          onOpenSettings={() => {}}
          onSelectModel={onChangeModel}
          branches={branches}
          currentBranchId={currentBranch?._id}
          messagesCount={messages.total}
          showBranches={false}
          isAuthenticated={isAuthenticated}
          chat={chat!}
          updateChat={updateChat}
        />
      </div>

      {/* SCROLLABLE CONTENT AREA - Full height with padding for floating elements */}
      <div className="h-full overflow-y-auto">
        <ChatArea messages={messages.messages} isLoading={messagesLoading} />
      </div>

      {/* FLOATING INPUT AND TOOLS - Positioned absolutely at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-t from-chat-container via-chat-container/95 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
          toggleTool={toggleTool}
          toolStates={toolStates}
          currentModel={selectedModel}
          onConfigChange={handleConfigChange}
          toolsConfig={toolsConfig}
          placeholder={"Type your message here... (Shift+Enter for new line)"}
        />
      </div>
    </div>
  );
}
