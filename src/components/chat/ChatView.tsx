// ToDo: Nuke this file.
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useModels } from "@/hooks/useModels";
import { useTools } from "@/hooks/useTools";
import { apolloClient } from "@/lib/apollo/apollo-client";
import {
  GET_CHAT_MESSAGES_QUERY,
  GET_CHAT_QUERY,
  UPDATE_BRANCH_MUTATION,
} from "@/lib/apollo/queries";
import {
  AddMessageDto,
  Chat,
  ChatBranch,
  GetMessagesDto,
  Message,
  MessagesResponse,
  ModelConfig,
} from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { socketManager } from "@/lib/socket/socket-client";
import { createDummyMessage } from "@/lib/utils/messageUtils";
import { getToolsForModel } from "@/lib/utils/modelUtils";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "../layout/LoadingScreen";
import { ChatArea } from "./ChatArea";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { FileAttachment } from "./FileAttachmentList";

export interface ChatViewProps {
  chatId: string;
  compact?: boolean;
  hideSidebarToggle?: boolean;
  showCloseButton?: boolean;
  onClick?: () => void;
  isFocus?: boolean;
}

export function ChatView({
  chatId,
  compact,
  hideSidebarToggle,
  showCloseButton,
  isFocus,
  onClick,
}: ChatViewProps) {
  const { updateChat, sendMessage } = useChats();
  const { models } = useModels();
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
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const isFocused = isFocus === undefined ? true : isFocus;

  const [currentStreamMessage, setCurrentStreamMessage] =
    useState<Message | null>(null);
  const [currentSendingMessage, setCurrentSendingMessage] =
    useState<Message | null>(null);

  const selectedModel = models.find(
    (m) => m.id === currentBranch?.modelConfig?.modelId
  );
  const { toggleTool, toolStates, toolStateMap } = useTools(
    getToolsForModel(selectedModel)
  );

  // Tools configuration state
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    maxTokens: 2048,
    apiKeyId: undefined,
    modelId: undefined,
  });

  // Validation for chat input
  const getChatInputError = (): string | null => {
    if (!isAuthenticated) {
      return "Please sign in to send messages";
    }

    if (!modelConfig.modelId) {
      return "Please select an AI model to continue";
    }

    if (!modelConfig.apiKeyId) {
      return "Please select an API key to use in model settings (Next to model selector)";
    }

    if (!session?.decryptKey) {
      return "Session error: Please sign in again";
    }

    return null;
  };

  useEffect(() => {
    const pendingMessage = localStorage.getItem("uoa:tempPendingMessage");
    if (!pendingMessage || !chat) {
      return;
    }

    localStorage.removeItem("uoa:tempPendingMessage");
    const message = JSON.parse(pendingMessage) as AddMessageDto;

    setTimeout(async () => {
      sendMessageServer(message);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  // Register socket listeners
  useEffect(() => {
    if (!isFocused) return;

    socketManager.setListeners({
      "message:start": () => {
        const dummy = createDummyMessage({
          _id: "stream-pending",
          branchId: currentBranch?._id,
          role: "assistant",
          content: [{ type: "text", text: "" }],
        });
        setCurrentStreamMessage(dummy);
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
      "message:end": () => {
        setCurrentStreamMessage(null);
      },
      "message:new": (message: Message) => {
        setMessages((prev) => ({
          ...prev,
          total: prev.total + 1,
          messages: [...prev.messages, message],
        }));
        setCurrentBranch((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messageCount: prev.messageCount + 1,
          };
        });
      },
      "message:error": (error: string) => {
        setError(error);
      },
      "branch:created": (branch: ChatBranch) => {
        if (branch.chatId !== chatId) {
          return;
        }

        setBranches((prev) => [...prev, branch]);
      },
      "branch:updated": (branch: ChatBranch) => {
        if (branch.chatId !== chatId) {
          return;
        }

        setBranches((prev) =>
          prev.map((b) => (b._id === branch._id ? branch : b))
        );
      },
      "branch:deleted": (branchId: string) => {
        setBranches((prev) => prev.filter((b) => b._id !== branchId));
      },
      "chat:updated": (chat: Chat) => {
        if (chat._id !== chatId) {
          return;
        }

        setChat(chat);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

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
        fetchPolicy: "no-cache",
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
    setSelectedBranch(branchId);

    const newBranch = branches.find((b) => b._id === branchId);
    if (newBranch) setCurrentBranch(newBranch);
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

  const sendMessageServer = async (dto: AddMessageDto) => {
    if (!chat) {
      console.error("Chat not loaded, cannot send message");
      return;
    }

    if (!dto.prompt.trim()) {
      console.warn("Empty message, not sending");
      return;
    }

    if (!dto.modelId) {
      console.error("No model selected, cannot send message");
      return;
    }

    if (!dto.branchId) {
      console.error("No current branch selected, cannot send message");
      return;
    }

    if (!dto.rawDecryptKey) {
      console.error("No session decrypt key available, cannot send message");
      return;
    }

    if (!dto.apiKeyId) {
      console.error("Chat does not have an API key, cannot send message");
      return;
    }

    console.log("Sending message:", dto.prompt, " with model:", dto.modelId);

    const sending = createDummyMessage({
      _id: "user-pending",
      branchId: dto.branchId,
      role: "user",
      content: [{ type: "text", text: dto.prompt }],
      attachments: dto.attachments || [],
    });

    if (toolStateMap["image-generation"]) {
      dto.useImageTool = true;
    }

    setCurrentSendingMessage(sending);
    await sendMessage(dto);
    setCurrentSendingMessage(null);
  };

  const handleSendMessage = async (message: string) => {
    console.log(attachments);
    // ToDo: Damn...
    sendMessageServer({
      prompt: message,
      apiKeyId: modelConfig.apiKeyId!,
      branchId: selectedBranch!,
      modelId: modelConfig.modelId!,
      rawDecryptKey: session?.decryptKey as string,
      attachments: attachments.map((a) => a.upload?._id || ""),
    });
  };

  const handleDeleteAttachment = async (
    messageId: string,
    attachmentId: string
  ) => {
    // TODO: Implement attachment deletion
    // This would typically involve:
    // 1. Call API to remove attachment from message
    // 2. Update local message state
    // 3. Optionally delete the file if no longer referenced
    console.log("Delete attachment:", attachmentId, "from message:", messageId);
  };

  useEffect(() => {
    setMessages({ hasMore: false, messages: [], total: -1 });
    setTimeout(() => {
      loadChat(chatId);
    }, 1);
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
    <div
      ref={scrollContainerRef}
      className={`w-full flex flex-col h-[100vh] sm:h-[95vh] ${
        isFocused ? "bg-chat-container" : "bg-chat-container/50"
      } backdrop-blur-md rounded-none sm:rounded-3xl shadow-glass dark:shadow-glass-dark border-0 sm:border border-white/20 dark:border-gray-700/30 relative overflow-y-auto`}
      onClick={onClick}
    >
      {/* Top */}
      <div className="sticky top-0 z-20 bg-chat-container/95 backdrop-blur-md">
        <ChatHeader
          onBranchSelect={onBranchSelect}
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
          compact={compact}
          hideSidebarToggle={hideSidebarToggle}
          showCloseButton={showCloseButton}
        />
      </div>

      {/* Middle (Scrollable) */}
      <div className="flex-1">
        <ChatArea
          messages={messages.messages}
          isLoading={messagesLoading}
          pendingStreamMessage={currentStreamMessage}
          pendingSendingMessage={currentSendingMessage}
          scrollContainerRef={scrollContainerRef}
          onDeleteAttachment={handleDeleteAttachment}
          canDeleteAttachments={isAuthenticated}
        />
      </div>

      {/* Bottom */}
      <div className="sticky bottom-0 z-20 p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-t from-chat-container via-chat-container/95 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
          toggleTool={toggleTool}
          toolStates={toolStates}
          placeholder={"Type your message here... (Shift+Enter for new line)"}
          attachments={attachments}
          setAttachments={setAttachments}
          error={getChatInputError()}
        />
      </div>
    </div>
  );
}
