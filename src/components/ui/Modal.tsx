import { X } from "lucide-react";
import React, { useEffect } from "react";

import { Button } from "./Button";
import { Portal } from "./Portal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
  };

  return (
    <Portal>
      {/* Full screen overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop with blur */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal container */}
        <div
          className={`
          relative z-10 
          bg-theme-bg-modal/95 
          backdrop-blur-md 
          rounded-2xl 
          border border-white/30 dark:border-gray-600/30 
          shadow-2xl 
          w-full 
          overflow-y-auto
          m-4
          ${sizeClasses[size]} 
          ${className}
        `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-600/20">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Portal>
  );
};
