import { Download, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import React from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ImageModalProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = alt || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="relative">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {alt || "Image"}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={isZoomed ? ZoomOut : ZoomIn}
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? "Zoom out" : "Zoom in"}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={handleDownload}
              title="Download image"
            />
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                title="Delete image"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
              title="Close"
            />
          </div>
        </div>

        {/* Image container */}
        <div
          className={`relative overflow-auto max-h-[70vh] ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
        >
          <img
            src={src}
            alt={alt || "Image"}
            className={`w-full h-auto rounded-lg transition-transform duration-300 ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {/* Image info */}
        <div className="mt-4 p-3 bg-theme-bg-surface/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Source:</strong> {src}
            </p>
            {alt && (
              <p>
                <strong>Alt text:</strong> {alt}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
