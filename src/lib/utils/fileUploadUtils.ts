import {
  UploadError,
  UploadOptions,
  UploadProgress,
  UploadResponse,
} from "@/types";

export class FileUploadClient {
  private baseUrl: string;
  private token: string | (() => string) | undefined;
  private abortController: AbortController | undefined;
  private defaultOptions: UploadOptions;

  constructor(options: Partial<UploadOptions> = {}) {
    this.baseUrl = options.baseUrl || "http://localhost:3000";
    this.token = options.token || undefined;

    this.defaultOptions = {
      baseUrl: this.baseUrl,
      token: this.token,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      timeout: 30000, // 30 seconds
      ...options,
    };
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    this.defaultOptions.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    if (typeof this.token === "function") {
      return this.token();
    }
    return this.token || null;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const { maxFileSize, allowedTypes } = this.defaultOptions;

    // Check file size
    if (maxFileSize && file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds limit (${formatBytes(maxFileSize)})`,
      };
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(
          ", "
        )}`,
      };
    }

    // Check if file is not empty
    if (file.size === 0) {
      return {
        valid: false,
        error: "File is empty",
      };
    }

    return { valid: true };
  }

  /**
   * Upload single file
   */
  async upload(
    file: File,
    options: Partial<UploadOptions> = {}
  ): Promise<UploadResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { onProgress, onSuccess, onError, onStart, onComplete, timeout } =
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

    // Create abort controller for cancellation
    this.abortController = new AbortController();

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);

    // Prepare headers
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    onStart?.();

    try {
      const response = await this.uploadWithProgress(
        `${this.baseUrl}/files/upload`,
        formData,
        headers,
        onProgress,
        timeout
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: UploadError = {
          message: errorData.message || "Upload failed",
          statusCode: response.status,
          error: errorData.error,
        };
        onError?.(error);
        throw new Error(error.message);
      }

      const result: UploadResponse = await response.json();
      onSuccess?.(result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          const abortError: UploadError = {
            message: "Upload cancelled",
            statusCode: 0,
          };
          onError?.(abortError);
          throw new Error("Upload cancelled");
        }

        const uploadError: UploadError = {
          message: error.message,
          statusCode: 0,
        };
        onError?.(uploadError);
        throw error;
      }
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
  ): Promise<UploadResponse[]> {
    const results: UploadResponse[] = [];
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

  /**
   * Upload with progress tracking
   */
  private uploadWithProgress(
    url: string,
    formData: FormData,
    headers: Record<string, string>,
    onProgress?: (progress: UploadProgress) => void,
    timeout?: number
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set timeout
      if (timeout) {
        xhr.timeout = timeout;
      }

      // Handle progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(
            xhr
              .getAllResponseHeaders()
              .split("\r\n")
              .reduce((acc, line) => {
                const [key, value] = line.split(": ");
                if (key && value) {
                  acc[key] = value;
                }
                return acc;
              }, {} as Record<string, string>)
          ),
        });
        resolve(response);
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      // Handle abort controller
      if (this.abortController) {
        this.abortController.signal.addEventListener("abort", () => {
          xhr.abort();
        });
      }

      // Set up request
      xhr.open("POST", url);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Send request
      xhr.send(formData);
    });
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
