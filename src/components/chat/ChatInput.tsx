import { Mic, Paperclip, PenTool, Send } from "lucide-react";
import React, { useState } from "react";

import { ToolState } from "@/hooks/useTools";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/TextArea";
import { ToolsBar } from "./ToolsBar";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  toggleTool?: (toolId: string) => void;
  toolStates?: ToolState[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled,
  placeholder,
  toggleTool,
  toolStates,
}) => {
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log("Files dropped:", files);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0">
      <div
        className={`relative transition-colors duration-200 ${
          isDragging
            ? "bg-primary-50/50 dark:bg-primary-900/20 rounded-2xl p-2 sm:p-4"
            : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-100/80 dark:bg-primary-900/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-600 z-10">
            <div className="text-center">
              <Paperclip className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-primary-700 dark:text-primary-300 font-medium text-sm sm:text-base">
                Drop files here to upload
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-2 bg-theme-bg-input/90 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-lg sm:px-4 py-1 sm:py-2"
        >
          <div className="flex items-end justify-center gap-2 sm:gap-3 px-3">
            {/* Action buttons - Hidden on mobile to save space */}
            <div className="hidden sm:flex align-center gap-2">
              <Button
                variant="ghost"
                size="md"
                icon={Paperclip}
                type="button"
                className="p-2.5"
                title="Attach file"
              />
              <Button
                variant="ghost"
                size="md"
                icon={Mic}
                type="button"
                className="p-2.5"
                title="Voice input"
              />
              <Button
                variant="ghost"
                size="md"
                icon={PenTool}
                type="button"
                className="p-2.5"
                title="Draw"
              />
            </div>

            {/* Text input */}
            <div className="flex-1">
              <Textarea
                variant="ghost"
                autoResize
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || disabled}
                rows={1}
                className="min-h-[24px] max-h-[240px] leading-6"
              />
            </div>

            {/* Send button */}
            <Button
              variant="primary"
              size="md"
              icon={Send}
              type="submit"
              disabled={!message.trim() || isLoading || disabled}
              className="p-2 sm:p-2.5 flex-shrink-0"
              title="Send message"
            />
          </div>

          {/* Tool selection badges */}
          {toolStates && toggleTool && toolStates.length > 0 && (
            <ToolsBar toolStates={toolStates} toggleTool={toggleTool} />
          )}
        </form>
      </div>
    </div>
  );
};
