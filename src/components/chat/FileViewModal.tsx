import { Download, FileText, Image, Music, Palette, X } from "lucide-react";
import React from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { FileAttachment } from "./FileAttachmentList";

interface FileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: FileAttachment | null;
}

export const FileViewModal: React.FC<FileViewModalProps> = ({
  isOpen,
  onClose,
  attachment,
}) => {
  if (!attachment) return null;

  const handleDownload = () => {
    if (attachment.type === "file" && attachment.upload?._id) {
      // Download uploaded file
      const downloadUrl = `${import.meta.env.VITE_WORKER_ENDPOINT}/file/${
        attachment.upload._id
      }`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.upload.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (attachment.type === "drawing" && attachment.data) {
      // Download drawing as PNG
      const link = document.createElement("a");
      link.href = attachment.data;
      link.download = `${attachment.name || "drawing"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (attachment.type === "audio" && attachment.data) {
      // Download audio recording
      const link = document.createElement("a");
      link.href = attachment.data;
      link.download = `${attachment.name || "recording"}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getIcon = () => {
    switch (attachment.type) {
      case "drawing":
        return <Palette className="w-6 h-6 text-purple-500" />;
      case "audio":
        return <Music className="w-6 h-6 text-green-500" />;
      default: {
        const mimeType = attachment.upload?.mimetype || "";
        if (mimeType.startsWith("image/")) {
          return <Image className="w-6 h-6 text-blue-500" />;
        }
        return <FileText className="w-6 h-6 text-gray-500" />;
      }
    }
  };

  const getTitle = () => {
    if (attachment.type === "drawing") return attachment.name || "Drawing";
    if (attachment.type === "audio")
      return attachment.name || "Audio Recording";
    return attachment.upload?.filename || "File";
  };

  const renderContent = () => {
    if (attachment.type === "drawing" && attachment.data) {
      return (
        <div className="text-center">
          <img
            src={attachment.data}
            alt="Drawing"
            className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      );
    }

    if (attachment.type === "audio" && attachment.data) {
      return (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <audio
            src={attachment.data}
            controls
            className="w-full max-w-md mx-auto"
          />
        </div>
      );
    }

    if (attachment.type === "file" && attachment.upload) {
      const mimeType = attachment.upload.mimetype;

      if (mimeType.startsWith("image/")) {
        const imageUrl = `${import.meta.env.VITE_WORKER_ENDPOINT}/file/${
          attachment.upload._id
        }`;
        return (
          <div className="text-center">
            <img
              src={imageUrl}
              alt={attachment.upload.filename}
              className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        );
      }

      // For non-image files, show file info
      return (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {attachment.upload.filename}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {attachment.upload.mimetype}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(attachment.upload.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to preview this file
        </p>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {getTitle()}
              </h2>
              {attachment.type === "file" && attachment.upload && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {attachment.upload.mimetype} •{" "}
                  {(attachment.upload.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Content */}
        <div className="min-h-[200px]">{renderContent()}</div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleDownload}
            icon={Download}
            className="flex-1"
          >
            Download
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
