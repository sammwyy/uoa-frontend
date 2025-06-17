/**
 * Branch selector component for navigating chat branches
 */

import {
  Check,
  Edit2,
  GitBranch,
  MoreVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";

import {
  DELETE_BRANCH_MUTATION,
  FORK_BRANCH_MUTATION,
  UPDATE_BRANCH_MUTATION,
} from "@/lib/apollo/queries";
import type { ChatBranch } from "@/lib/graphql";
import { logger } from "@/lib/logger";
import { useMutation } from "@apollo/client";

interface BranchSelectorProps {
  branches: ChatBranch[];
  currentBranchId?: string;
  onBranchSelect: (branchId: string) => void;
  onBranchesUpdated: () => void;
  chatId: string;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  currentBranchId,
  onBranchSelect,
  onBranchesUpdated,
  chatId,
}) => {
  const [createBranchMutation] = useMutation(FORK_BRANCH_MUTATION);
  const [updateBranchMutation] = useMutation(UPDATE_BRANCH_MUTATION);
  const [deleteBranchMutation] = useMutation(DELETE_BRANCH_MUTATION);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState("");
  const [editBranchName, setEditBranchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const currentBranch = branches.find((b) => b._id === currentBranchId);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBranchName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      logger.info("Creating new branch:", newBranchName);

      const { data } = await createBranchMutation({
        variables: {
          payload: {
            chatId,
            name: newBranchName.trim(),
            parentBranchId: currentBranchId,
          },
        },
      });

      if (data?.createBranch) {
        setNewBranchName("");
        setShowCreateForm(false);
        onBranchesUpdated();
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

  const handleUpdateBranch = async (branchId: string) => {
    if (!editBranchName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      logger.info("Updating branch:", branchId);

      const { data } = await updateBranchMutation({
        variables: {
          id: branchId,
          payload: {
            name: editBranchName.trim(),
          },
        },
      });

      if (data?.updateBranch) {
        setEditingBranch(null);
        setEditBranchName("");
        onBranchesUpdated();
        logger.info("Branch updated successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update branch";
      setError(errorMessage);
      logger.error("Failed to update branch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this branch? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      logger.info("Deleting branch:", branchId);

      const { data } = await deleteBranchMutation({
        variables: { id: branchId },
      });

      if (data?.deleteBranch) {
        onBranchesUpdated();
        logger.info("Branch deleted successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete branch";
      setError(errorMessage);
      logger.error("Failed to delete branch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (branch: ChatBranch) => {
    setEditingBranch(branch._id);
    setEditBranchName(branch.name);
    setShowMenu(null);
  };

  const cancelEditing = () => {
    setEditingBranch(null);
    setEditBranchName("");
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-red-600 hover:text-red-700 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Branches</h3>
          <span className="text-sm text-gray-500">({branches.length})</span>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Branch</span>
        </button>
      </div>

      {/* Create Branch Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleCreateBranch} className="space-y-3">
            <div>
              <label
                htmlFor="branchName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Branch Name
              </label>
              <input
                type="text"
                id="branchName"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Enter branch name"
                required
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isLoading || !newBranchName.trim()}
                className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isLoading ? "Creating..." : "Create"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewBranchName("");
                }}
                className="flex items-center space-x-1 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branches List */}
      <div className="space-y-2">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              currentBranchId === branch._id
                ? "bg-indigo-50 border-indigo-200"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex-1">
              {editingBranch === branch._id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editBranchName}
                    onChange={(e) => setEditBranchName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateBranch(branch._id)}
                    disabled={isLoading || !editBranchName.trim()}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onBranchSelect(branch._id)}
                  className="text-left w-full"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-medium ${
                        currentBranchId === branch._id
                          ? "text-indigo-900"
                          : "text-gray-900"
                      }`}
                    >
                      {branch.name}
                    </span>
                    {currentBranchId === branch._id && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{branch.messageCount} messages</span>
                    {branch.parentBranchId && (
                      <span>From: {branch.parentBranchId.name}</span>
                    )}
                    {!branch.isActive && (
                      <span className="text-orange-600">Inactive</span>
                    )}
                  </div>
                </button>
              )}
            </div>

            {editingBranch !== branch._id && (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowMenu(showMenu === branch._id ? null : branch._id)
                  }
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu === branch._id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => startEditing(branch)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch._id)}
                      disabled={branches.length <= 1}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No branches available</p>
        </div>
      )}
    </div>
  );
};
