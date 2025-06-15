import { GitBranch, Plus } from "lucide-react";
import React, { useState } from "react";

import { useMutation } from "@apollo/client";
import { CREATE_BRANCH_MUTATION } from "@/lib/apollo/queries";
import { logger } from "@/lib/logger";
import { ChatBranch } from "@/types/graphql";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  currentBranch?: ChatBranch;
  onBranchCreated: () => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  chatId,
  currentBranch,
  onBranchCreated,
}) => {
  const [createBranchMutation] = useMutation(CREATE_BRANCH_MUTATION);
  
  const [branchName, setBranchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchName.trim()) {
      setError("Branch name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      logger.info("Creating new branch:", branchName);

      const { data } = await createBranchMutation({
        variables: {
          payload: {
            chatId,
            name: branchName.trim(),
            parentBranchId: currentBranch?._id,
          },
        },
      });

      if (data?.createBranch) {
        setBranchName("");
        onClose();
        onBranchCreated();
        logger.info("Branch created successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create branch";
      setError(errorMessage);
      logger.error("Failed to create branch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBranchName("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Create New Branch
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fork the conversation from this point
            </p>
          </div>
        </div>

        {/* Current Branch Info */}
        {currentBranch && (
          <div className="p-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg border border-primary-200/50 dark:border-primary-700/50">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-primary-800 dark:text-primary-200">
                Forking from: {currentBranch.name}
              </span>
            </div>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              {currentBranch.messageCount} messages • Branch point: {currentBranch.branchPoint}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Branch Name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter branch name (e.g., 'Alternative approach')"
            error={!!error}
            autoFocus
            disabled={isLoading}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !branchName.trim()}
              className="flex-1"
              icon={isLoading ? undefined : Plus}
            >
              {isLoading ? "Creating..." : "Fork!"}
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
          <p className="mb-1">
            <strong>What is branching?</strong>
          </p>
          <p>
            Branching allows you to explore different conversation paths from the same point. 
            You can switch between branches to compare different AI responses or conversation directions.
          </p>
        </div>
      </div>
    </Modal>
  );
};