import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useTools } from "@/hooks/useTools";
import { apolloClient } from "@/lib/apollo/apollo-client";
import {
  GET_CHAT_MESSAGES_QUERY,
  GET_CHAT_QUERY,
  UPDATE_BRANCH_MUTATION,
} from "@/lib/apollo/queries";
import { Tools } from "@/lib/data/tools";
import {
  Chat,
  ChatBranch,
  GetMessagesDto,
  Message,
  MessagesResponse,
  ModelConfig,
} from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../layout/LoadingScreen";
import { ChatArea } from "./ChatArea";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";

export interface ChatViewProps {
  chatId: string;
}

export function ChatView({ chatId }: ChatViewProps) {
  const { updateChat, sendMessage } = useChats();
  const { isAuthenticated, session } = useAuth();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null); // Selected branch id
  const [currentBranch, setCurrentBranch] = useState<ChatBranch | null>(null); // Populated current branch (Same as selected branch)
  const [branches, setBranches] = useState<ChatBranch[]>([]);
  const [messages, setMessages] = useState<MessagesResponse>({
    hasMore: false,
    messages: [],
    total: -1,
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] =
    useState<Message | null>(null);
  const { toggleTool, toolStates } = useTools(Tools);

  // Tools configuration state
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    maxTokens: 2048,
    apiKeyId: undefined,
    modelId: undefined,
  });

  // Register socket listeners
  useEffect(() => {
    socketManager.setListeners({
      "message:start": () => {
        setCurrentStreamMessage({
          _id: "",
          role: "assistant",
          content: [{ type: "text", text: "" }],
          createdAt: new Date().toString(),
          attachments: [],
          branchId: "",
          index: 0,
          isEdited: false,
        });
      },
      "message:chunk": (chunk: string) => {
        setCurrentStreamMessage((prev) => {
          if (!prev) {
            return null;
          }
          const content = prev.content;
          const first = content[0];
          first.text += chunk;
          return {
            ...prev,
            content,
          };
        });
      },
      "message:end": (message: Message) => {
        if (message) {
          setMessages((prev) => ({
            ...prev,
            total: prev.total + 1,
            messages: [...prev.messages, message],
          }));
        }
        setCurrentStreamMessage(null);
      },
    });
  }, []);

  useEffect(() => {
    const branchId = selectedBranch;
    if (!branchId) {
      return;
    }

    socketManager.emit("join-branch", { branchId });

    return () => {
      socketManager.emit("leave-branch", { branchId });
    };
  }, [selectedBranch]);

  // Update branch
  const updateBranch = async (
    branchId: string,
    updates: Partial<ChatBranch>
  ) => {
    if (!currentBranch) {
      console.error("No current branch selected to update");
      return;
    }

    const updatedBranch = { ...currentBranch, ...updates };
    setCurrentBranch(updatedBranch);

    // Update chat with new branch data
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_BRANCH_MUTATION,
      variables: {
        branchId: branchId,
        payload: updates,
      },
    });

    if (data?.updateBranch) {
      setBranches((prev) =>
        prev.map((branch) =>
          branch._id === updatedBranch._id ? updatedBranch : branch
        )
      );
      logger.info("Updated branch:", updatedBranch._id);
    } else {
      console.error("Failed to update branch:", updatedBranch._id);
    }
  };

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
        setSelectedBranch(chat.defaultBranch._id);
        setModelConfig({
          temperature: 0.7,
          maxTokens: 2048,
          apiKeyId: undefined,
          modelId: undefined,
          ...chat?.defaultBranch.modelConfig,
        });
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

  const onChangeModelConfig = (config: ModelConfig) => {
    if (!currentBranch) {
      console.error("No current branch selected to update config");
      return;
    }

    const { apiKeyId, maxTokens, modelId, temperature } = config;
    const newConfig = { apiKeyId, maxTokens, modelId, temperature };
    setModelConfig(newConfig);
    updateBranch(currentBranch._id, { modelConfig: newConfig });
  };

  const handleSendMessage = async (message: string) => {
    if (!chat) {
      console.error("Chat not loaded, cannot send message");
      return;
    }

    if (!message.trim()) {
      console.warn("Empty message, not sending");
      return;
    }

    if (!modelConfig.modelId) {
      console.error("No model selected, cannot send message");
      return;
    }

    if (!currentBranch?._id) {
      console.error("No current branch selected, cannot send message");
      return;
    }

    if (!session?.decryptKey) {
      console.error("No session decrypt key available, cannot send message");
      return;
    }

    if (!modelConfig.apiKeyId) {
      console.error("Chat does not have an API key, cannot send message");
      return;
    }

    console.log(
      "Sending message:",
      message,
      " with model:",
      modelConfig.modelId
    );

    const newMessage = await sendMessage({
      apiKeyId: modelConfig.apiKeyId,
      branchId: currentBranch._id,
      modelId: modelConfig.modelId,
      prompt: message,
      rawDecryptKey: session.decryptKey,
    });

    console.log("New message sent:", newMessage._id);

    setMessages((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      total: prev.total + 1,
    }));

    setCurrentBranch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messageCount: prev.messageCount + 1,
      };
    });
  };

  useEffect(() => {
    loadChat(chatId);
  }, [chatId]);

  useEffect(() => {
    console.log("Current branch:", selectedBranch);
    if (selectedBranch) {
      loadMessages({ branchId: selectedBranch }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

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
          branches={branches}
          currentBranchId={currentBranch?._id}
          messagesCount={messages.total}
          showBranches={false}
          isAuthenticated={isAuthenticated}
          chat={chat!}
          updateChat={updateChat}
          modelConfig={modelConfig}
          onChangeModelConfig={onChangeModelConfig}
        />
      </div>

      {/* SCROLLABLE CONTENT AREA - Full height with padding for floating elements */}
      <div className="h-full overflow-y-auto">
        <ChatArea
          messages={[...messages.messages, currentStreamMessage]}
          isLoading={messagesLoading}
        />
      </div>

      {/* FLOATING INPUT AND TOOLS - Positioned absolutely at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-t from-chat-container via-chat-container/95 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
          toggleTool={toggleTool}
          toolStates={toolStates}
          onChangeModelConfig={onChangeModelConfig}
          modelConfig={modelConfig}
          placeholder={"Type your message here... (Shift+Enter for new line)"}
        />
      </div>
    </div>
  );
}
