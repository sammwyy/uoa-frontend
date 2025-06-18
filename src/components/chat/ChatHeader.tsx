import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  GitBranch,
  Lock,
  LogIn,
  Menu,
  Settings,
  Unlock,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useModels } from "@/hooks/useModels";
import {
  AIModel,
  Chat,
  ChatBranch,
  ModelConfig,
  UpdateChatDto,
} from "@/lib/graphql";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { Input } from "../ui/Input";
import { BranchDropdown } from "./BranchDropdown";
import { ForkBranchModal } from "./ForkBranchModal";
import { MobileConfigModal } from "./MobileConfigModal";
import { ModelConfigModal } from "./ModelConfigModal";
import { ModelSelector } from "./ModelSelector";
import { UserMenu } from "./UserMenu";

interface ChatHeaderProps {
  chat: Chat;
  updateChat: (id: string, updateData: UpdateChatDto) => void;
  onOpenSettings: () => void;
  hideModelSelector?: boolean;
  isAuthenticated?: boolean;
  // Branch-related props
  branches: ChatBranch[];
  currentBranchId?: string;
  onBranchSelect: (branchId: string) => void;
  showBranches?: boolean;
  onToggleBranches?: () => void;
  // Messages count
  messagesCount?: number;
  // Model config
  modelConfig: ModelConfig;
  onChangeModelConfig: (config: ModelConfig) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  updateChat,
  branches,
  modelConfig,
  onChangeModelConfig,
  onOpenSettings,
  hideModelSelector = false,
  isAuthenticated,
  currentBranchId,
  onBranchSelect,
  showBranches = false,
  onToggleBranches,
}) => {
  const { toggle: toggleSidebar } = useSidebarStore();
  const { models } = useModels();
  const selectedModel = models.find((m) => m.id === modelConfig.modelId);

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [createBranchModalOpen, setCreateBranchModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleStartEdit = () => {
    if (!chat || !isAuthenticated) return;
    setEditTitle(chat.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!chat) return;
    if (editTitle.trim() && editTitle !== chat.title) {
      updateChat(chat._id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const onSelectModel = (model: AIModel) => {
    if (!chat || !isAuthenticated) return;
    onChangeModelConfig({
      ...modelConfig,
      modelId: model.id,
    });
  };

  const privacyOptions = [
    {
      value: "public",
      label: "Public",
      icon: Unlock,
      description: "Visible to others",
    },
    {
      value: "private",
      label: "Private",
      icon: Lock,
      description: "Only visible to you",
    },
  ];

  const handlePrivacyChange = (value: string) => {
    if (!chat || !isAuthenticated) return;
    updateChat(chat._id, { isPublic: value === "public" });
  };

  const currentBranch = branches.find((b) => b._id === currentBranchId);

  const handleCreateBranch = () => {
    setCreateBranchModalOpen(true);
  };

  const handleModelConfigChange = (config: ModelConfig) => {
    onChangeModelConfig(config);
  };

  return (
    <>
      <div className="backdrop-blur-md border-b border-white/20 dark:border-gray-700/30 mx-5">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3">
          {/* Left Section - Sidebar Toggle and Model Selector */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Sidebar Toggle - Only show if authenticated */}
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="sm"
                icon={Menu}
                onClick={toggleSidebar}
                className="p-2 flex-shrink-0"
                title="Toggle sidebar"
              />
            )}

            {/* Model Selector - Only show on desktop if not hidden and user is authenticated */}
            {!hideModelSelector && isAuthenticated && (
              <div className="hidden sm:block flex-shrink-0">
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onSelectModel={onSelectModel}
                />
              </div>
            )}

            {/* Model Settings Button - Next to model selector */}
            {!hideModelSelector && isAuthenticated && (
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Settings}
                  onClick={() => setConfigModalOpen(true)}
                  className="p-2"
                  title="Configure model settings"
                />
              </div>
            )}
          </div>

          {/* Center Section - Chat Title and Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center max-w-xs sm:max-w-md mx-2 sm:mx-4 min-w-0">
            {chat ? (
              <>
                {isEditing && isAuthenticated ? (
                  <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="text-sm sm:text-lg font-semibold text-center min-w-0"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Check}
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100/50 dark:hover:bg-green-900/30 p-1 sm:p-2 flex-shrink-0"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30 p-1 sm:p-2 flex-shrink-0"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h1 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-full text-center">
                        {chat.title}
                      </h1>
                      {isAuthenticated && (
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit3}
                            onClick={handleStartEdit}
                            className="text-gray-500 dark:text-gray-400 p-1 sm:p-2 hidden sm:flex"
                          />

                          {/* Privacy Toggle - only for authenticated users on desktop */}
                          <div className="hidden sm:block">
                            <Dropdown
                              options={privacyOptions}
                              value={chat.isPublic ? "public" : "private"}
                              onSelect={handlePrivacyChange}
                              className="min-w-[100px] sm:min-w-[120px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/*  Branch Info */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {/* Branch Info and Toggle */}
                      {isAuthenticated &&
                        branches.length > 0 &&
                        onToggleBranches && (
                          <button
                            onClick={onToggleBranches}
                            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>{branches.length} branches</span>
                            {showBranches ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <h1 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                AI Assistant
              </h1>
            )}
          </div>

          {/* Right Section - Branch Selector + User Menu or Sign In + Mobile Config */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
            {/* Branch Selector - Only show if authenticated and has branches */}
            {isAuthenticated && branches.length > 0 && (
              <div className="hidden sm:block">
                <BranchDropdown
                  branches={branches}
                  currentBranchId={currentBranchId}
                  onBranchSelect={onBranchSelect}
                  onCreateBranch={handleCreateBranch}
                />
              </div>
            )}

            {/* Mobile Config Button - Only show if authenticated */}
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="sm"
                icon={Bot}
                onClick={() => setMobileConfigOpen(true)}
                className="p-2 flex-shrink-0 sm:hidden"
                title="Configuration"
              />
            )}

            {isAuthenticated ? (
              <UserMenu onOpenSettings={onOpenSettings} />
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={LogIn}
                onClick={() => navigate("/auth")}
                className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Configuration Modal */}
      <MobileConfigModal
        isOpen={mobileConfigOpen}
        onClose={() => setMobileConfigOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />

      {/* Create Branch Modal */}
      <ForkBranchModal
        isOpen={createBranchModalOpen}
        onClose={() => setCreateBranchModalOpen(false)}
        chatId={chat?._id || ""}
        currentBranch={currentBranch}
      />

      {/* Model Configuration Modal */}
      <ModelConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        currentModel={selectedModel}
        onConfigChange={handleModelConfigChange}
        initialConfig={modelConfig}
      />
    </>
  );
};
