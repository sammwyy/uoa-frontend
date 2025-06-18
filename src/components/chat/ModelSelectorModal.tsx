import {
  Bot,
  Building2,
  Check,
  Code2,
  FunctionSquare,
  GlobeIcon,
  Grid,
  ImageDownIcon,
  ImageUpIcon,
  Key,
  List,
  PlusSquareIcon,
  Search,
  SortAsc,
  SortDesc,
  TextIcon,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { useModels } from "@/hooks/useModels";
import { AIModel } from "@/lib/graphql";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Switch } from "../ui/Switch";

type SortOption = "name" | "provider" | "cost" | "speed";
type ViewMode = "list" | "grid";

const categories = [
  {
    id: "all",
    name: "All Models",
    icon: Bot,
    predicate: () => true,
  },
  {
    id: "text",
    name: "Text Generation",
    icon: TextIcon,
    predicate: (model: AIModel) => model?.capabilities?.textGeneration,
  },
  {
    id: "image",
    name: "Image Generation",
    icon: ImageDownIcon,
    predicate: (model: AIModel) => model?.capabilities?.imageGeneration,
  },
  {
    id: "image-analysis",
    name: "Image Analysis",
    icon: ImageUpIcon,
    predicate: (model: AIModel) => model?.capabilities?.imageAnalysis,
  },
  {
    id: "code-execution",
    name: "Code Execution",
    icon: Code2,
    predicate: (model: AIModel) => model?.capabilities?.codeExecution,
  },
  {
    id: "web-browsing",
    name: "Web Browsing",
    icon: GlobeIcon,
    predicate: (model: AIModel) => model?.capabilities?.webBrowsing,
  },
  {
    id: "function-calling",
    name: "Function Calling/MCP",
    icon: FunctionSquare,
    predicate: (model: AIModel) => model?.capabilities?.functionCalling,
  },
  {
    id: "multimodal",
    name: "Multimodal",
    icon: PlusSquareIcon,
    predicate: (model: AIModel) => {
      let caps = 0;

      if (model.capabilities.fileAnalysis) caps++;
      if (model.capabilities.imageAnalysis) caps++;
      if (model.capabilities.imageGeneration) caps++;
      if (model.capabilities.textGeneration) caps++;

      return caps > 1;
    },
  },
];

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIModel[];
  selectedModel: AIModel | null | undefined;
  onSelectModel: (model: AIModel) => void;
  onConfigureModel: (model: AIModel) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const selectedCategoryPredicate = categories.find(
    (c) => c.id === selectedCategory
  )?.predicate;
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const { models } = useModels();

  const filteredAndSortedModels = useMemo(() => {
    const filtered = models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategoryPredicate || selectedCategoryPredicate(model);
      const matchesEnabled = !showOnlyEnabled || model.enabled;

      return matchesSearch && matchesCategory && matchesEnabled;
    });

    // Sort models
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "provider":
          comparison = a.provider.localeCompare(b.provider);
          break;
        case "cost": {
          const costOrder = { low: 0, medium: 1, high: 2 };
          comparison =
            (costOrder[a.cost || "medium"] || 0) -
            (costOrder[b.cost || "medium"] || 0);
          break;
        }
        case "speed": {
          const speedOrder = { slow: 0, medium: 1, fast: 2 };
          comparison =
            (speedOrder[a.speed as keyof typeof speedOrder] ||
              speedOrder.medium) -
            (speedOrder[b.speed as keyof typeof speedOrder] ||
              speedOrder.medium);
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    models,
    searchQuery,
    selectedCategoryPredicate,
    showOnlyEnabled,
    sortBy,
    sortOrder,
  ]);

  const handleModelSelect = (model: AIModel) => {
    if (model.enabled) {
      onSelectModel(model);
      onClose();
    }
  };

  const getSpeedIcon = (speed?: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="w-4 h-4 text-green-500" />;
      case "slow":
        return <ZapOff className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-500" />;
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

  const renderModelCard = (model: AIModel) => {
    const isSelected = selectedModel?.id === model.id;

    if (viewMode === "grid") {
      return (
        <Card
          key={model.id}
          variant={isSelected ? "glass" : "default"}
          padding="md"
          onClick={() => handleModelSelect(model)}
          className={`cursor-pointer transition-all duration-200 group ${
            !model.enabled ? "opacity-50" : "hover:scale-[1.02]"
          } ${isSelected ? "ring-2 ring-primary-500" : ""}`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    model.enabled
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {model.provider}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {model.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSpeedIcon(model.speed)}

                <span className={getCostColor(model.cost)}>{model.cost}</span>
              </div>
              <div className="flex gap-1">
                <Badge
                  variant={model.enabled ? "success" : "default"}
                  size="sm"
                >
                  {model.enabled ? "Enabled" : "Disabled"}
                </Badge>
                {model.enabled && (
                  <Badge variant="primary" size="sm">
                    <Key className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // List view
    return (
      <Card
        key={model.id}
        variant={isSelected ? "glass" : "default"}
        padding="md"
        onClick={() => handleModelSelect(model)}
        className={`cursor-pointer transition-all duration-200 group ${
          !model.enabled ? "opacity-50" : "hover:scale-[1.01]"
        } ${isSelected ? "ring-2 ring-primary-500" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              model.enabled
                ? "bg-gradient-to-r from-primary-500 to-secondary-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {model.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm">
                  <Building2 className="w-3 h-3 mr-1" />
                  {model.provider}
                </Badge>
                <Badge variant="default" size="sm">
                  {model.category}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {model.description}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                {getSpeedIcon(model.speed)}
                <span className="text-gray-500 dark:text-gray-400">
                  {model.speed || "medium"} speed
                </span>
              </div>
              {model.cost && (
                <span className={`${getCostColor(model.cost)} font-medium`}>
                  {model.cost} cost
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-2">
              <Badge variant={model.enabled ? "success" : "default"} size="sm">
                {model.enabled ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    Disabled
                  </>
                )}
              </Badge>
              {model.enabled && (
                <Badge variant="primary" size="sm">
                  <Key className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title="Select AI Model"
      >
        <div className="flex h-[70vh]">
          {/* Sidebar with categories */}
          <div className="w-64 border-r border-white/20 dark:border-gray-600/20 pr-6">
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const count =
                  category.id === "all"
                    ? models.length
                    : models.filter((m) => category.predicate(m)).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-primary-100/60 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/50"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-theme-bg-surface-hover/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                Filters
              </h4>
              <Switch
                checked={showOnlyEnabled}
                onChange={setShowOnlyEnabled}
                label="Show only enabled"
                size="sm"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 pl-6">
            {/* Search and controls */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-theme-bg-input text-gray-800 dark:text-gray-200 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="provider">Sort by Provider</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="speed">Sort by Speed</option>
                </select>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={sortOrder === "asc" ? SortAsc : SortDesc}
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                />

                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Button
                    variant={viewMode === "list" ? "primary" : "secondary"}
                    size="sm"
                    icon={List}
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  />
                  <Button
                    variant={viewMode === "grid" ? "primary" : "secondary"}
                    size="sm"
                    icon={Grid}
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  />
                </div>
              </div>
            </div>

            {/* Models list/grid */}
            <div className="overflow-y-auto p-5 max-h-[calc(70vh-120px)]">
              {filteredAndSortedModels.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    No models found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-3"
                  }
                >
                  {filteredAndSortedModels.map(renderModelCard)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Model Configuration Modal */}
      {/**
      <ModelConfigModal
        isOpen={!!configModel}
        onClose={() => setConfigModel(null)}
        model={configModel}
        onSave={handleSaveConfig}
      /> */}
    </>
  );
};
