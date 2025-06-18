import { ArrowDown, MessageCircle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { usePreferences } from "@/hooks/usePreferences";
import { Message } from "@/lib/graphql";
import { MessageSkeleton, Skeleton } from "../ui/Skeleton";
import { MessageCard } from "./MessageCard";

type Nullable<T> = T | null;

interface ChatAreaProps {
  messages: Nullable<Message>[];
  isLoading: boolean;
  pendingStreamMessage?: Message | null;
  pendingSendingMessage?: Message | null;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onDeleteAttachment?: (messageId: string, attachmentId: string) => void;
  canDeleteAttachments?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  pendingStreamMessage,
  pendingSendingMessage,
  scrollContainerRef,
  onDeleteAttachment,
  canDeleteAttachments = false,
}) => {
  const { preferences } = usePreferences();
  const filteredMessages: Message[] = messages.filter(Boolean) as Message[];

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const lastMessageCountRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(preferences.language, {
      hour12: !preferences.use24HourFormat,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteAttachment = (messageId: string) => (attachmentId: string) => {
    onDeleteAttachment?.(messageId, attachmentId);
  };

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: smooth ? "smooth" : "instant",
        });
      }
    },
    [scrollContainerRef]
  );

  // Check if user is at bottom of scroll
  const checkIfAtBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const threshold = 50;
      const atBottom = scrollHeight - scrollTop - clientHeight <= threshold;

      setIsAtBottom(atBottom);

      if (atBottom) {
        setShowNewMessageButton(false);
        setNewMessagesCount(0);
      }

      return atBottom;
    }
    return true;
  }, [scrollContainerRef]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!isUserScrollingRef.current) return;

    setTimeout(() => {
      checkIfAtBottom();
    }, 100);
  }, [checkIfAtBottom]);

  // Handle new message button click
  const handleNewMessageClick = () => {
    scrollToBottom(true);
    setShowNewMessageButton(false);
    setNewMessagesCount(0);
  };

  // Effect for auto-scroll on new messages
  useEffect(() => {
    if (filteredMessages.length > lastMessageCountRef.current) {
      const newMessagesDiff =
        filteredMessages.length - lastMessageCountRef.current;

      if (isAtBottom) {
        setTimeout(() => scrollToBottom(true), 100);
      } else {
        setNewMessagesCount((prev) => prev + newMessagesDiff);
        setShowNewMessageButton(true);
      }
    }

    lastMessageCountRef.current = filteredMessages.length;
  }, [
    filteredMessages.length,
    pendingSendingMessage,
    pendingStreamMessage,
    isAtBottom,
    scrollToBottom,
  ]);

  // Effect for streaming messages auto-scroll
  useEffect(() => {
    if (pendingStreamMessage && isAtBottom) {
      const interval = setInterval(() => {
        if (isAtBottom) {
          scrollToBottom(false); // Instant scroll during streaming
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [pendingStreamMessage, isAtBottom, scrollToBottom]);

  // Handle scroll start and end detection + window scroll events
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollTimeout: NodeJS.Timeout;

    const onScrollStart = () => {
      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeout);
    };

    const onScrollEnd = () => {
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    scrollContainer.addEventListener("scroll", onScrollStart);
    scrollContainer.addEventListener("scroll", onScrollEnd);
    scrollContainer.addEventListener("scroll", handleScroll);

    // Initial check
    setTimeout(checkIfAtBottom, 100);

    return () => {
      scrollContainer.removeEventListener("scroll", onScrollStart);
      scrollContainer.removeEventListener("scroll", onScrollEnd);
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll, checkIfAtBottom, scrollContainerRef]);

  // Empty state
  if (
    messages.length === 0 &&
    !isLoading &&
    !pendingSendingMessage &&
    !pendingStreamMessage
  ) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <Skeleton height="1rem" width="100%" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Regular messages */}
        {filteredMessages.map((message) => (
          <MessageCard
            key={message._id}
            message={message}
            showTimestamps={preferences.showTimestamps}
            formatTimestamp={formatTimestamp}
            onCopyMessage={copyMessage}
            onDeleteAttachment={handleDeleteAttachment(message._id)}
            canDeleteAttachments={canDeleteAttachments}
          />
        ))}

        {/* Pending sending message */}
        {pendingSendingMessage && (
          <MessageCard
            key={`pending-sending-${pendingSendingMessage._id || "temp"}`}
            message={pendingSendingMessage}
            showTimestamps={preferences.showTimestamps}
            formatTimestamp={formatTimestamp}
            onCopyMessage={copyMessage}
            isPending={true}
            onDeleteAttachment={handleDeleteAttachment(pendingSendingMessage._id || "temp")}
            canDeleteAttachments={canDeleteAttachments}
          />
        )}

        {/* Pending stream message */}
        {pendingStreamMessage && (
          <MessageCard
            key={`pending-stream-${pendingStreamMessage._id || "temp"}`}
            message={pendingStreamMessage}
            showTimestamps={preferences.showTimestamps}
            formatTimestamp={formatTimestamp}
            onCopyMessage={copyMessage}
            isStreaming={true}
            onDeleteAttachment={handleDeleteAttachment(pendingStreamMessage._id || "temp")}
            canDeleteAttachments={canDeleteAttachments}
          />
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <MessageSkeleton role="assistant" />
            {Math.random() > 0.5 && <MessageSkeleton role="assistant" />}
          </div>
        )}
      </div>

      {/* New Messages Button */}
      {showNewMessageButton && (
        <div className="sticky bottom-32 flex justify-center z-50">
          <button
            onClick={handleNewMessageClick}
            className="group bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {newMessagesCount > 0
                  ? `${newMessagesCount} new message${
                      newMessagesCount > 1 ? "s" : ""
                    }`
                  : "New messages"}
              </span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};