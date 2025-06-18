import {
  Download,
  Eye,
  FileText,
  Image,
  Music,
  Palette,
  X,
} from "lucide-react";
import React from "react";

import { FileUpload } from "@/lib/graphql";
import { formatBytes } from "@/lib/utils/fileUploadUtils";
import { Button } from "../ui/Button";

export interface FileAttachment {
  id: string;
  file?: File; // For files being uploaded
  upload?: FileUpload; // For completed uploads
  progress?: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  type: "file" | "drawing" | "audio";
  data?: string; // For drawing (base64) or audio (blob URL)
  name?: string; // For drawing/audio custom names
}

interface FileAttachmentListProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onView: (attachment: FileAttachment) => void;
}

export const FileAttachmentList: React.FC<FileAttachmentListProps> = ({
  attachments,
  onRemove,
  onView,
}) => {
  if (attachments.length === 0) return null;

  const getFileIcon = (attachment: FileAttachment) => {
    if (attachment.type === "drawing") {
      return <Palette className="w-4 h-4" />;
    }

    if (attachment.type === "audio") {
      return <Music className="w-4 h-4" />;
    }

    // For regular files
    const mimeType = attachment.file?.type || attachment.upload?.mimetype || "";

    if (mimeType.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    }

    return <FileText className="w-4 h-4" />;
  };

  const getFileName = (attachment: FileAttachment) => {
    if (attachment.type === "drawing") {
      return attachment.name || "Drawing";
    }

    if (attachment.type === "audio") {
      return attachment.name || "Audio Recording";
    }

    return (
      attachment.file?.name || attachment.upload?.originalName || "Unknown file"
    );
  };

  const getFileSize = (attachment: FileAttachment) => {
    if (attachment.type === "drawing" || attachment.type === "audio") {
      return ""; // No size for drawings/audio
    }

    const size = attachment.file?.size || attachment.upload?.size || 0;
    return formatBytes(size);
  };

  const getStatusText = (attachment: FileAttachment) => {
    switch (attachment.status) {
      case "uploading":
        if (attachment.type === "file") {
          return `${attachment.progress || 0}%`;
        }
        return "Processing...";
      case "completed":
        return "Ready";
      case "error":
        return "Error";
      default:
        return "";
    }
  };

  const getStatusColor = (attachment: FileAttachment) => {
    switch (attachment.status) {
      case "uploading":
        return "text-blue-600 dark:text-blue-400";
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const canDownload = (attachment: FileAttachment) => {
    return attachment.status === "completed" && attachment.upload?._id;
  };

  const handleDownload = (attachment: FileAttachment) => {
    if (!canDownload(attachment)) return;

    const downloadUrl = `${import.meta.env.VITE_UPLOAD_API}/files/download/${
      attachment.upload!._id
    }`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = attachment.upload!.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 mb-3">
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
              ${
                attachment.status === "completed"
                  ? "bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50"
                  : attachment.status === "error"
                  ? "bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50"
                  : "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50"
              }
            `}
          >
            {/* File Icon */}
            <div className="flex-shrink-0">{getFileIcon(attachment)}</div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {getFileName(attachment)}
                </span>
                {getFileSize(attachment) && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getFileSize(attachment)}
                    </span>
                  </>
                )}
                <span className="text-gray-400">•</span>
                <span
                  className={`text-xs font-medium ${getStatusColor(
                    attachment
                  )}`}
                >
                  {getStatusText(attachment)}
                </span>
              </div>

              {/* Progress Bar for uploading files */}
              {attachment.status === "uploading" &&
                attachment.type === "file" && (
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${attachment.progress || 0}%` }}
                    />
                  </div>
                )}

              {/* Error Message */}
              {attachment.status === "error" && attachment.error && (
                <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {attachment.error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* View Button */}
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                onClick={() => onView(attachment)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="View"
              />

              {/* Download Button (only for completed file uploads) */}
              {canDownload(attachment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownload(attachment)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Download"
                />
              )}

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => onRemove(attachment.id)}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                title="Remove"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
