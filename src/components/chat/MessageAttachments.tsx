import {
  Download,
  Eye,
  FileText,
  Image,
  Music,
  Trash2,
  Video,
  X,
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface MessageAttachmentsProps {
  attachments: string[]; // Array of file IDs
  role: "user" | "assistant";
  onDeleteAttachment?: (attachmentId: string) => void;
  canDelete?: boolean;
}

interface AttachmentFile {
  _id: string;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimetype: string, size: "sm" | "md" | "lg" = "md") => {
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };
  const iconSize = iconSizes[size];

  if (mimetype.startsWith("image/")) {
    return <Image className={`${iconSize} text-blue-500`} />;
  }
  if (mimetype.startsWith("video/")) {
    return <Video className={`${iconSize} text-purple-500`} />;
  }
  if (mimetype.startsWith("audio/")) {
    return <Music className={`${iconSize} text-green-500`} />;
  }
  return <FileText className={`${iconSize} text-gray-500`} />;
};

const AttachmentPreview: React.FC<{
  file: AttachmentFile;
  size: "small" | "large";
  onView: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}> = ({ file, size, onView, onDelete, canDelete }) => {
  const [imageError, setImageError] = useState(false);
  const isImage = file.mimetype.startsWith("image/");
  const fileUrl = `${import.meta.env.VITE_UPLOAD_API}/files/serve/${file._id}`;

  if (size === "small") {
    // Small horizontal layout for user messages
    return (
      <div className="group relative bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 hover:bg-white/20 transition-all duration-200">
        <div className="flex items-center gap-2">
          {/* Preview/Icon */}
          <div className="w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-white/20">
            {isImage && !imageError ? (
              <img
                src={fileUrl}
                alt={file.originalName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getFileIcon(file.mimetype, "sm")}
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium text-white truncate"
              title={file.originalName}
            >
              {file.originalName}
            </p>
            <p className="text-xs text-white/70">{formatBytes(file.size)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={onView}
              className="p-1 text-white/70 hover:text-white hover:bg-white/20"
              title="View file"
            />
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={onDelete}
                className="p-1 text-white/70 hover:text-red-300 hover:bg-red-500/20"
                title="Delete attachment"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Large vertical layout for assistant messages
  return (
    <div className="group relative bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
      {/* Preview */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {isImage && !imageError ? (
          <img
            src={fileUrl}
            alt={file.originalName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getFileIcon(file.mimetype, "lg")}
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={onView}
              className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              title="View file"
            />
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={onDelete}
                className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                title="Delete attachment"
              />
            )}
          </div>
        </div>
      </div>

      {/* File info */}
      <div className="p-3">
        <h4
          className="font-medium text-gray-800 dark:text-gray-200 truncate mb-1"
          title={file.originalName}
        >
          {file.originalName}
        </h4>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatBytes(file.size)}</span>
          <span>{file.mimetype.split("/")[1].toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

const AttachmentModal: React.FC<{
  file: AttachmentFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}> = ({ file, isOpen, onClose, onDelete, canDelete }) => {
  if (!file) return null;

  const fileUrl = `${import.meta.env.VITE_UPLOAD_API}/files/serve/${file._id}`;
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");
  const isAudio = file.mimetype.startsWith("audio/");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {getFileIcon(file.mimetype, "md")}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {file.originalName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.mimetype} • {formatBytes(file.size)}
              </p>
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

        {/* Content Preview */}
        <div className="max-h-[60vh] overflow-auto">
          {isImage && (
            <div className="text-center">
              <img
                src={fileUrl}
                alt={file.originalName}
                className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}

          {isVideo && (
            <div className="text-center">
              <video
                src={fileUrl}
                controls
                className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}

          {isAudio && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <audio
                src={fileUrl}
                controls
                className="w-full max-w-md mx-auto"
              />
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                {getFileIcon(file.mimetype, "lg")}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Preview not available for this file type
              </p>
            </div>
          )}
        </div>

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
          {canDelete && onDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
              icon={Trash2}
              className="flex-1"
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
  attachments,
  role,
  onDeleteAttachment,
  canDelete = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock function to fetch file details - replace with actual API call
  React.useEffect(() => {
    const fetchFileDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call to get file details
        const mockFiles: AttachmentFile[] = attachments.map((id, index) => ({
          _id: id,
          originalName: `attachment-${index + 1}.jpg`,
          mimetype: "image/jpeg",
          size: 1024 * 1024, // 1MB
          createdAt: new Date().toISOString(),
        }));
        setFiles(mockFiles);
      } catch (error) {
        console.error("Failed to fetch file details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (attachments.length > 0) {
      fetchFileDetails();
    } else {
      setLoading(false);
    }
  }, [attachments]);

  const handleViewFile = (file: AttachmentFile) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  const handleDeleteFile = (fileId: string) => {
    onDeleteAttachment?.(fileId);
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
  };

  if (loading || attachments.length === 0) {
    return null;
  }

  if (role === "user") {
    // Small horizontal layout for user messages (shown above message)
    return (
      <>
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file) => (
            <AttachmentPreview
              key={file._id}
              file={file}
              size="small"
              onView={() => handleViewFile(file)}
              onDelete={() => handleDeleteFile(file._id)}
              canDelete={canDelete}
            />
          ))}
        </div>

        <AttachmentModal
          file={selectedFile}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onDelete={() => selectedFile && handleDeleteFile(selectedFile._id)}
          canDelete={canDelete}
        />
      </>
    );
  }

  // Large vertical layout for assistant messages (shown below message)
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {files.map((file) => (
          <AttachmentPreview
            key={file._id}
            file={file}
            size="large"
            onView={() => handleViewFile(file)}
            onDelete={() => handleDeleteFile(file._id)}
            canDelete={canDelete}
          />
        ))}
      </div>

      <AttachmentModal
        file={selectedFile}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={() => selectedFile && handleDeleteFile(selectedFile._id)}
        canDelete={canDelete}
      />
    </>
  );
};
