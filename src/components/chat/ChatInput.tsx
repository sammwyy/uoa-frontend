import { Mic, Paperclip, PenTool, Send, Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useModels } from "@/hooks/useModels";
import { ToolState } from "@/hooks/useTools";
import { ModelConfig } from "@/lib/graphql";
import { LocalStorage } from "@/lib/storage/local-storage";
import { FileUploadClient } from "@/lib/utils/fileUploadUtils";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/TextArea";
import { AudioRecordModal } from "./AudioRecordModal";
import { DrawingModal } from "./DrawingModal";
import { FileAttachment, FileAttachmentList } from "./FileAttachmentList";
import { FileViewModal } from "./FileViewModal";
import { ModelConfigModal } from "./ModelConfigModal";
import { ToolsBar } from "./ToolsBar";

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  toggleTool?: (toolId: string) => void;
  toolStates?: ToolState[];
  // Model config
  modelConfig: ModelConfig;
  onChangeModelConfig: (config: ModelConfig) => void;
  // Attachments
  attachments: FileAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
}

const generateFileId = () => {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled,
  placeholder,
  toggleTool,
  toolStates,
  onChangeModelConfig,
  modelConfig,
  attachments,
  setAttachments,
}) => {
  const { models } = useModels();
  const currentModel =
    models.find((model) => model.id === modelConfig?.modelId) || null;

  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [fileViewModal, setFileViewModal] = useState<{
    isOpen: boolean;
    attachment: FileAttachment | null;
  }>({ isOpen: false, attachment: null });

  // File attachments state
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  // File upload client
  const fileUploadClient = useRef<FileUploadClient | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize file upload client
  useEffect(() => {
    fileUploadClient.current = new FileUploadClient({
      baseUrl: import.meta.env.VITE_UPLOAD_API || "http://localhost:3000",
      token: () => {
        const tokens = LocalStorage.getAuthTokens();
        return tokens.accessToken || "";
      },
    });
  }, []);

  // Process files when filesToUpload changes
  useEffect(() => {
    if (filesToUpload.length > 0) {
      handleFilesAdded(filesToUpload);
      setFilesToUpload([]); // Clear after processing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesToUpload]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      // Only send completed attachments
      const completedAttachments = attachments.filter(
        (att) => att.status === "completed"
      );
      onSendMessage(message.trim(), completedAttachments);
      setMessage("");
      setAttachments([]); // Clear attachments after sending
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
      handleFilesAdded(files);
    }
  };

  // Handle paste events for files
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        handleFilesAdded(files);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAttachmentAdded = async (newAttachment: FileAttachment) => {
    if (!fileUploadClient.current) return;

    let file = newAttachment.file;

    if (!file) {
      //  Convert base64 data to file.
      const response = await fetch(newAttachment.data!);
      const blob = await response.blob();
      file = new File([blob], "upload.png", { type: blob.type });
    }

    setAttachments((prev) => [...prev, newAttachment]);

    try {
      // Upload the file
      const uploadResponse = await fileUploadClient.current.upload(file, {
        onProgress: (progress) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === newAttachment.id
                ? { ...att, progress: progress.percentage }
                : att
            )
          );
        },
      });

      // Update attachment with completed upload
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === newAttachment.id
            ? {
                ...att,
                status: "completed" as const,
                upload: uploadResponse.file,
                progress: 100,
              }
            : att
        )
      );
    } catch (error) {
      // Update attachment with error status
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === newAttachment.id
            ? {
                ...att,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : att
        )
      );
    }
  };

  const handleFilesAdded = async (files: File[]) => {
    if (!fileUploadClient.current) return;

    for (const file of files) {
      const fileId = generateFileId();

      // Add file to attachments with uploading status
      const newAttachment: FileAttachment = {
        id: fileId,
        file,
        status: "uploading",
        progress: 0,
        type: "file",
      };

      await handleAttachmentAdded(newAttachment);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFilesAdded(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleViewAttachment = (attachment: FileAttachment) => {
    setFileViewModal({ isOpen: true, attachment });
  };

  const handleModelConfigChange = (config: ModelConfig) => {
    if (onChangeModelConfig) {
      onChangeModelConfig(config);
    }
  };

  const handleDrawingSave = (imageData: string) => {
    const drawingId = generateFileId();
    const newAttachment: FileAttachment = {
      id: drawingId,
      status: "completed",
      type: "drawing",
      data: imageData,
      name: `Drawing ${new Date().toLocaleTimeString()}`,
    };

    handleAttachmentAdded(newAttachment);
  };

  const handleAudioSave = (audioBlob: Blob) => {
    const audioId = generateFileId();
    const audioUrl = URL.createObjectURL(audioBlob);

    const newAttachment: FileAttachment = {
      id: audioId,
      status: "completed",
      type: "audio",
      data: audioUrl,
      name: `Recording ${new Date().toLocaleTimeString()}`,
    };

    handleAttachmentAdded(newAttachment);
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

        {/* File Attachments List */}
        <FileAttachmentList
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          onView={handleViewAttachment}
        />

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
                onClick={handleAttachFileClick}
                className="p-2.5"
                title="Attach file"
              />
              <Button
                variant="ghost"
                size="md"
                icon={Mic}
                type="button"
                onClick={() => setAudioModalOpen(true)}
                className="p-2.5"
                title="Record audio"
              />
              <Button
                variant="ghost"
                size="md"
                icon={PenTool}
                type="button"
                onClick={() => setDrawingModalOpen(true)}
                className="p-2.5"
                title="Draw"
              />
            </div>

            {/* Mobile action buttons */}
            <div className="flex sm:hidden align-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon={Paperclip}
                type="button"
                onClick={handleAttachFileClick}
                className="p-2"
                title="Attach file"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Mic}
                type="button"
                onClick={() => setAudioModalOpen(true)}
                className="p-2"
                title="Record audio"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={PenTool}
                type="button"
                onClick={() => setDrawingModalOpen(true)}
                className="p-2"
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

            <div className="flex items-center">
              {/* Send button */}
              <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={() => setConfigModalOpen(true)}
                className="p-2 flex-shrink-0 ml-2"
                title="Configure tools settings"
              />

              <Button
                variant="primary"
                size="md"
                icon={Send}
                type="submit"
                disabled={
                  (!message.trim() && attachments.length === 0) ||
                  isLoading ||
                  disabled
                }
                className="p-2 sm:p-2.5 flex-shrink-0"
                title="Send message"
              />
            </div>
          </div>

          {/* Tool selection badges */}
          {toolStates && toggleTool && toolStates.length > 0 && (
            <ToolsBar toolStates={toolStates} toggleTool={toggleTool} />
          )}
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv,.json"
        />
      </div>

      {/* Tools Configuration Modal */}
      <ModelConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        currentModel={currentModel}
        onConfigChange={handleModelConfigChange}
        initialConfig={modelConfig}
      />

      {/* Drawing Modal */}
      <DrawingModal
        isOpen={drawingModalOpen}
        onClose={() => setDrawingModalOpen(false)}
        onSave={handleDrawingSave}
      />

      {/* Audio Recording Modal */}
      <AudioRecordModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        onSave={handleAudioSave}
      />

      {/* File View Modal */}
      <FileViewModal
        isOpen={fileViewModal.isOpen}
        onClose={() => setFileViewModal({ isOpen: false, attachment: null })}
        attachment={fileViewModal.attachment}
      />
    </div>
  );
};
