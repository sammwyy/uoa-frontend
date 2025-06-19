import { UploadError, UploadOptions, UploadProgress } from "@/types";
import { apolloClient } from "../apollo/apollo-client";
import {
  COMPLETE_FILE_MUTATION,
  CREATE_FILE_MUTATION,
} from "../apollo/queries";
import { FileUpload } from "../graphql";

interface FilePart {
  etag: string;
  partNumber: number;
}

interface FileResponse {
  _id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadId?: string;
  clientToken?: string;
  createdAt: string;
}

export class FileUploadClient {
  private workerEndpoint: string;
  private abortController: AbortController | undefined;
  private defaultOptions: UploadOptions;
  private readonly chunkSize = 5 * 1024 * 1024; // 5MB

  constructor(options: Partial<UploadOptions> = {}) {
    this.workerEndpoint =
      import.meta.env.VITE_WORKER_ENDPOINT || "http://localhost:8787";

    this.defaultOptions = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "video/mp4",
        "video/mpeg",
        "audio/mpeg",
        "audio/wav",
      ],
      timeout: 300000, // 5 minutes for large files
      ...options,
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const { maxFileSize, allowedTypes } = this.defaultOptions;

    if (file.size === 0) {
      return { valid: false, error: "File is empty" };
    }

    if (maxFileSize && file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds limit (${formatBytes(maxFileSize)})`,
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed (${
          file.type
        }). Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Create file record in database
   */
  private async createFileRecord(file: File): Promise<FileResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_FILE_MUTATION,
        variables: {
          payload: {
            filename: file.name,
            mimetype: file.type,
            size: file.size,
          },
        },
      });

      return data.createFile;
    } catch (error) {
      throw new Error(
        `Failed to create file record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Upload file chunks to worker
   */
  private async uploadFileChunks(
    file: File,
    fileRecord: FileResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FilePart[]> {
    const { uploadId, clientToken } = fileRecord;
    if (!uploadId || !clientToken) {
      throw new Error("Missing upload credentials");
    }

    const totalParts = Math.ceil(file.size / this.chunkSize);
    const parts: FilePart[] = [];
    let uploadedBytes = 0;

    this.abortController = new AbortController();

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);
      const isLastPart = partNumber === totalParts;

      try {
        const url = `${this.workerEndpoint}/upload/part/${partNumber}${
          isLastPart ? "?isLast=true" : ""
        }`;

        const response = await fetch(url, {
          method: "put",
          headers: {
            Authorization: `Bearer ${clientToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: chunk,
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to upload part ${partNumber}`
          );
        }

        const partData = await response.json();
        if (!partData.success) {
          throw new Error(partData.error || `Part ${partNumber} upload failed`);
        }

        parts.push({
          partNumber: partData.partNumber,
          etag: partData.etag,
        });

        uploadedBytes += chunk.size;

        // Report progress
        if (onProgress) {
          const progress: UploadProgress = {
            loaded: uploadedBytes,
            total: file.size,
            percentage: Math.round((uploadedBytes / file.size) * 100),
          };
          onProgress(progress);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload cancelled");
        }
        throw error;
      }
    }

    return parts;
  }

  /**
   * Complete file upload
   */
  private async completeFileUpload(
    fileId: string,
    parts: FilePart[]
  ): Promise<FileResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: COMPLETE_FILE_MUTATION,
        variables: {
          payload: {
            fileId,
            parts,
          },
        },
      });

      return data.completeFile;
    } catch (error) {
      throw new Error(
        `Failed to complete upload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Upload single file with new multipart flow
   */
  async upload(
    file: File,
    options: Partial<UploadOptions> = {}
  ): Promise<FileUpload> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { onProgress, onSuccess, onError, onStart, onComplete } =
      mergedOptions;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      const error: UploadError = {
        message: validation.error!,
        statusCode: 400,
      };
      onError?.(error);
      throw new Error(validation.error);
    }

    onStart?.();

    try {
      // Step 1: Create file record
      const fileRecord = await this.createFileRecord(file);

      // Step 2: Upload file chunks
      const parts = await this.uploadFileChunks(file, fileRecord, onProgress);

      // Step 3: Complete upload
      const completedFile = await this.completeFileUpload(
        fileRecord._id,
        parts
      );

      onSuccess?.(completedFile);
      return completedFile;
    } catch (error) {
      const uploadError: UploadError = {
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 0,
      };
      onError?.(uploadError);
      throw error;
    } finally {
      onComplete?.();
      this.abortController = undefined;
    }
  }

  /**
   * Upload multiple files sequentially
   */
  async uploadMultiple(
    files: File[],
    options: Partial<UploadOptions> = {}
  ): Promise<FileUpload[]> {
    const results: FileUpload[] = [];
    const errors: Array<{ file: File; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const fileOptions = {
          ...options,
          onProgress: (progress: UploadProgress) => {
            // Adjust progress for multiple files
            const overallProgress = {
              ...progress,
              percentage: Math.round(
                ((i + progress.percentage / 100) / files.length) * 100
              ),
            };
            options.onProgress?.(overallProgress);
          },
        };

        const result = await this.upload(file, fileOptions);
        results.push(result);
      } catch (error) {
        errors.push({
          file,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (errors.length > 0) {
      console.warn("Some files failed to upload:", errors);
    }

    return results;
  }

  /**
   * Cancel current upload
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

/**
 * Get file info
 */
export function getFileInfo(file: File): {
  name: string;
  size: string;
  type: string;
  lastModified: string;
} {
  return {
    name: file.name,
    size: formatBytes(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleDateString(),
  };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
