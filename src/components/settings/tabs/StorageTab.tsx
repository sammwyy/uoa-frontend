import { useMutation, useQuery } from "@apollo/client";
import {
  Download,
  Eye,
  FileText,
  HardDrive,
  Image,
  Music,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  DELETE_FILE_MUTATION,
  GET_USER_FILES_QUERY,
  GET_USER_STORAGE_STATS_QUERY,
} from "@/lib/apollo/queries";
import type { FileUpload, UserStorageStats } from "@/lib/graphql";
import { logger } from "@/lib/logger";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimetype: string, size: "sm" | "lg" = "sm") => {
  const iconSize = size === "lg" ? "w-8 h-8" : "w-5 h-5";

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

const getFileTypeColor = (mimetype: string) => {
  if (mimetype.startsWith("image/"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  if (mimetype.startsWith("video/"))
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
  if (mimetype.startsWith("audio/"))
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (mimetype.includes("pdf"))
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
};

const getFilePreview = (file: FileUpload) => {
  if (file.mimetype.startsWith("image/")) {
    const imageUrl = `${import.meta.env.VITE_WORKER_ENDPOINT}/files/${
      file._id
    }`;
    return (
      <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={file.filename}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div className="hidden w-full h-full flex items-center justify-center">
          {getFileIcon(file.mimetype, "lg")}
        </div>
      </div>
    );
  }

  // For non-image files, show large icon
  return (
    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      {getFileIcon(file.mimetype, "lg")}
    </div>
  );
};

export function StorageTab() {
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  // Queries
  const {
    data: storageData,
    loading: storageLoading,
    error: storageError,
    refetch: refetchStorage,
  } = useQuery(GET_USER_STORAGE_STATS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filesData,
    loading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useQuery(GET_USER_FILES_QUERY, {
    skip: !filesModalOpen,
    fetchPolicy: "cache-and-network",
  });

  // Mutations
  const [deleteFileMutation] = useMutation(DELETE_FILE_MUTATION);

  const storageStats: UserStorageStats | null =
    storageData?.getUserStorageStats || null;
  const files: FileUpload[] = filesData?.getUserFiles || [];

  const handleDeleteFile = async (fileId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingFile(fileId);
      logger.info("Deleting file:", fileId);

      const { data } = await deleteFileMutation({
        variables: { id: fileId },
      });

      if (data?.deleteFile) {
        await refetchFiles();
        await refetchStorage();
        logger.info("File deleted successfully");
      }
    } catch (error) {
      logger.error("Failed to delete file:", error);
      // TODO: Show error toast
    } finally {
      setDeletingFile(null);
    }
  };

  const handleViewFile = (file: FileUpload) => {
    const fileUrl = `${import.meta.env.VITE_WORKER_ENDPOINT}/files/${file._id}`;
    window.open(fileUrl, "_blank");
  };

  const handleDownloadFile = (file: FileUpload) => {
    const downloadUrl = `${import.meta.env.VITE_WORKER_ENDPOINT}/files/${
      file._id
    }`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUsagePercentage = () => {
    if (!storageStats) return 0;
    return Math.round((storageStats.used / storageStats.limit) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Storage Usage
        </h3>

        {storageError ? (
          <Card padding="lg" className="text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
                <HardDrive className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                Failed to Load Storage Stats
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {storageError.message}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchStorage()}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : storageLoading ? (
          <CardSkeleton />
        ) : storageStats ? (
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  File Storage
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatBytes(storageStats.used)} of{" "}
                  {formatBytes(storageStats.limit)} used
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {getUsagePercentage()}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatBytes(storageStats.remaining)} remaining
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getUsageColor()}`}
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0</span>
                <span>{formatBytes(storageStats.limit)}</span>
              </div>
            </div>

            {/* Usage Warning */}
            {getUsagePercentage() >= 90 && (
              <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Storage Almost Full:</strong> You're using{" "}
                  {getUsagePercentage()}% of your storage. Consider deleting
                  some files to free up space.
                </p>
              </div>
            )}
          </Card>
        ) : null}
      </div>

      {/* File Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            File Management
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilesModalOpen(true)}
          >
            Manage Files
          </Button>
        </div>

        <Card padding="lg">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              File Management
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View, download, and delete your uploaded files to manage storage
              space.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFilesModalOpen(true)}
            >
              Open File Manager
            </Button>
          </div>
        </Card>
      </div>

      {/* Files Management Modal */}
      <Modal
        isOpen={filesModalOpen}
        onClose={() => setFilesModalOpen(false)}
        size="xl"
        title="File Manager"
      >
        <div className="space-y-4">
          {/* Summary Header */}
          {files.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total size:{" "}
                  {formatBytes(
                    files.reduce((total, file) => total + file.size, 0)
                  )}
                </p>
              </div>
            </div>
          )}

          {filesError ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Failed to Load Files
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filesError.message}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchFiles()}
              >
                Try Again
              </Button>
            </div>
          ) : filesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                No Files Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't uploaded any files yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {files.map((file) => (
                  <Card
                    key={file._id}
                    padding="none"
                    className="group hover:shadow-lg transition-all duration-200"
                  >
                    <div className="relative">
                      {/* File Preview */}
                      {getFilePreview(file)}

                      {/* File Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(
                            file.mimetype
                          )}`}
                        >
                          {file.mimetype.split("/")[1].toUpperCase()}
                        </span>
                      </div>

                      {/* Action Buttons - Show on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleViewFile(file)}
                            className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                            title="View file"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Download}
                            onClick={() => handleDownloadFile(file)}
                            className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                            title="Download file"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteFile(file._id)}
                            disabled={deletingFile === file._id}
                            className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                            title="Delete file"
                          />
                        </div>
                      </div>

                      {/* Loading overlay for deletion */}
                      {deletingFile === file._id && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="text-white text-sm font-medium">
                            Deleting...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-3 space-y-2">
                      <h4
                        className="font-medium text-gray-800 dark:text-gray-200 truncate"
                        title={file.filename}
                      >
                        {file.filename}
                      </h4>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatBytes(file.size)}</span>
                        <span>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {file.filename && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {file.filename}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setFilesModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
