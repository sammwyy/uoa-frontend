import { AlertTriangle } from "lucide-react";
import React from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          iconBg: "bg-red-100/80 dark:bg-red-900/40",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          iconBg: "bg-yellow-100/80 dark:bg-yellow-900/40",
        };
      default:
        return {
          icon: "text-blue-500",
          iconBg: "bg-blue-100/80 dark:bg-blue-900/40",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-full ${styles.iconBg} backdrop-blur-md flex items-center justify-center flex-shrink-0`}
        >
          <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          {cancelText}
        </Button>
        <Button
          variant={type === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          className="flex-1"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
