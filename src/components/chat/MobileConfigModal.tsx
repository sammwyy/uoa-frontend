import { Bot, Check, Settings, Wrench, X } from "lucide-react";
import React, { useState } from "react";

import { useTools } from "@/hooks/useTools";
import { useToolsStore } from "@/stores/tools-store";
import { AIModel } from "@/types/graphql";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";

interface MobileConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIModel[];
  selectedModel: AIModel | null;
  onSelectModel: (model: AIModel) => void;
}

export const MobileConfigModal: React.FC<MobileConfigModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel,
}) => {
  const [activeTab, setActiveTab] = useState<"model" | "tools">("model");
  const { toggleTool } = useToolsStore();
  const toolStates = useTools();
  const activeTools = toolStates.filter((t) => t.isEnabled);

  const handleModelSelect = (model: AIModel) => {
    if (model.enabled) {
      onSelectModel(model);
    }
  };

  const getSpeedIcon = (speed?: string) => {
    switch (speed) {
      case "high":
        return "⚡";
      case "low":
        return "🐌";
      default:
        return "⚖️";
    }
  };

  const getCostColor = (cost?: string) => {
    switch (cost) {
      case "low":
        return "text-green-600 dark:text-green-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  const enabledModels = models.filter((m) => m.enabled);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Configuration
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your AI model and tools
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

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("model")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "model"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Model
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "tools"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tools
            {activeTools.length > 0 && (
              <Badge variant="primary" size="sm">
                {activeTools.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {activeTab === "model" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Select AI Model
                </h3>
                <Badge variant="secondary" size="sm">
                  {enabledModels.length} available
                </Badge>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {enabledModels.map((model) => {
                  const isSelected = selectedModel?.id === model.id;

                  return (
                    <Card
                      key={model.id}
                      variant={isSelected ? "glass" : "default"}
                      padding="md"
                      onClick={() => handleModelSelect(model)}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-primary-500"
                          : "hover:scale-[1.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-gradient-to-r from-primary-500 to-secondary-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <Bot
                            className={`w-5 h-5 ${
                              isSelected
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-semibold truncate ${
                                isSelected
                                  ? "text-primary-700 dark:text-primary-300"
                                  : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {model.name}
                            </h4>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {model.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <span>{getSpeedIcon(model.speed)}</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {model.speed || "medium"}
                              </span>
                            </span>
                            {model.cost && (
                              <span
                                className={`font-medium ${getCostColor(
                                  model.cost
                                )}`}
                              >
                                {model.cost} cost
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  AI Tools
                </h3>
                <Badge variant="secondary" size="sm">
                  {activeTools.length} active
                </Badge>
              </div>

              <div className="space-y-3">
                {toolStates.map(({ tool, isEnabled }) => (
                  <Card
                    key={tool.id}
                    variant={isEnabled ? "glass" : "default"}
                    padding="md"
                    onClick={() => toggleTool(tool.id)}
                    className={`cursor-pointer transition-all duration-200 ${
                      isEnabled
                        ? "ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                        : "hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isEnabled
                            ? "bg-gradient-to-r from-primary-500 to-secondary-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {/* Icon mapping */}
                        {tool.icon === "Globe" && (
                          <svg
                            className={`w-5 h-5 ${
                              isEnabled
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                        )}
                        {tool.icon === "Brain" && (
                          <svg
                            className={`w-5 h-5 ${
                              isEnabled
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        )}
                        {tool.icon === "Wrench" && (
                          <svg
                            className={`w-5 h-5 ${
                              isEnabled
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                        {tool.icon === "Puzzle" && (
                          <svg
                            className={`w-5 h-5 ${
                              isEnabled
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`font-semibold ${
                              isEnabled
                                ? "text-primary-700 dark:text-primary-300"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {tool.id} Name
                          </h4>
                          {isEnabled && (
                            <Badge variant="primary" size="sm">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.id} Description
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {activeTools.length > 0 && (
                <div className="mt-6 p-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg border border-primary-200/50 dark:border-primary-700/50">
                  <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-2">
                    Active Tools Summary
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTools.map(({ tool }) => (
                      <Badge key={tool.id} variant="primary" size="sm">
                        {tool.id} Name
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="primary" onClick={onClose} className="px-6">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
