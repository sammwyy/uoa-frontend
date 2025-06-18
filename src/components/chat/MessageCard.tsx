import { Message } from "@/lib/graphql";
import { Bot, Copy, Loader2 } from "lucide-react";
import React from "react";
import { MessageAttachments } from "./MessageAttachments";
import { MessageRenderer } from "./MessageRenderer";
import { TTSButton } from "./TTSButton";

interface MessageCardProps {
  message: Message;
  showTimestamps: boolean;
  formatTimestamp: (timestamp: string) => string;
  onCopyMessage: (content: string) => void;
  isPending?: boolean;
  isStreaming?: boolean;
  onDeleteAttachment?: (attachmentId: string) => void;
  canDeleteAttachments?: boolean;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  showTimestamps,
  formatTimestamp,
  onCopyMessage,
  isPending = false,
  isStreaming = false,
  onDeleteAttachment,
  canDeleteAttachments = false,
}) => {
  const getMessageTextContent = (message: Message) => {
    return message.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("");
  };

  const messageContent = getMessageTextContent(message);
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div
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
        {/* User attachments - shown above message */}
        {message.role === "user" && hasAttachments && (
          <MessageAttachments
            attachments={message.attachments}
            role={message.role}
            onDeleteAttachment={onDeleteAttachment}
            canDelete={canDeleteAttachments}
          />
        )}

        <div
          className={`
            p-3 sm:p-4 rounded-xl shadow-sm backdrop-blur-md
            ${
              message.role === "user"
                ? "bg-primary-500 to-secondary-600 dark:bg-primary-200 dark:to-secondary-300 text-white ml-auto shadow-lg"
                : "bg-primary-200/80 to-secondary-300/80 dark:bg-primary-500/80 dark:to-secondary-600/80 border border-gray-200/30 dark:border-gray-700/30 text-gray-800 dark:text-gray-200"
            }
            ${isPending ? "opacity-75" : ""}
          `}
        >
          <MessageRenderer content={messageContent} role={message.role} />

          {/* Streaming indicator cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary-500 animate-pulse ml-1"></span>
          )}
        </div>

        {/* Assistant attachments - shown below message */}
        {message.role === "assistant" && hasAttachments && (
          <MessageAttachments
            attachments={message.attachments}
            role={message.role}
            onDeleteAttachment={onDeleteAttachment}
            canDelete={canDeleteAttachments}
          />
        )}

        {/* Pending/Sending status */}
        {isPending && message.role === "user" && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Sending...</span>
          </div>
        )}

        {/* Streaming status */}
        {isStreaming && message.role === "assistant" && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating response...</span>
          </div>
        )}

        {/* Timestamp */}
        {showTimestamps && message.createdAt && !isPending && (
          <div
            className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            {formatTimestamp(message.createdAt)}
          </div>
        )}

        {/* Action buttons - only show for completed assistant messages */}
        {message.role === "assistant" && !isPending && !isStreaming && (
          <div className="flex items-center gap-1 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onCopyMessage(messageContent)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <TTSButton
              text={messageContent}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            />

            {/**
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
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};
