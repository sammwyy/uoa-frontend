import { Bot, Key, Sliders, Thermometer } from "lucide-react";
import React, { useEffect, useState } from "react";

import { useApiKeys } from "@/hooks/useApiKeys";
import { AIModel, ModelConfig } from "@/lib/graphql";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { Modal } from "../ui/Modal";
import { Slider } from "../ui/Slider";

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel?: AIModel | null;
  onConfigChange: (config: ModelConfig) => void;
  initialConfig?: ModelConfig;
}

export const ModelConfigModal: React.FC<ModelConfigModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  onConfigChange,
  initialConfig = {
    temperature: 0.7,
    maxTokens: 2048,
  },
}) => {
  const { apiKeys } = useApiKeys();

  const [config, setConfig] = useState<ModelConfig>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Filter API keys by current model's provider
  const compatibleApiKeys = apiKeys.filter(
    (key) => key.provider.toLowerCase() === currentModel?.provider.toLowerCase()
  );

  const handleConfigChange = (
    key: keyof ModelConfig,
    value: number | string
  ) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSave = () => {
    onConfigChange(config);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ModelConfig = {
      temperature: 0.7,
      maxTokens: 2048,
      apiKeyId: undefined,
    };
    setConfig(defaultConfig);
  };

  const formatTemperature = (value: number) => {
    return `${value.toFixed(2)} ${
      value < 0.3 ? "(Conservative)" : value > 0.8 ? "(Creative)" : "(Balanced)"
    }`;
  };

  const formatTokens = (value: number) => {
    return `${value.toLocaleString()} tokens`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Tools Configuration"
    >
      <div className="space-y-6">
        {/* Current Model Info */}
        {currentModel && (
          <div className="p-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg border border-primary-200/50 dark:border-primary-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-800 dark:text-primary-200">
                  {currentModel.name}
                </h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {currentModel.provider} • {currentModel.category}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Temperature Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Temperature
            </h3>
          </div>
          <Slider
            value={config.temperature || 0.7}
            onChange={(value) => handleConfigChange("temperature", value)}
            min={0}
            max={2}
            step={0.1}
            formatValue={formatTemperature}
            description="Controls randomness in responses. Lower values are more focused and deterministic."
            marks={[
              { value: 0, label: "0" },
              { value: 0.5, label: "0.5" },
              { value: 1, label: "1" },
              { value: 1.5, label: "1.5" },
              { value: 2, label: "2" },
            ]}
          />
        </div>

        {/* Max Tokens Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Max Tokens
            </h3>
          </div>
          <Slider
            value={config.maxTokens || 2048}
            onChange={(value) => handleConfigChange("maxTokens", value)}
            min={256}
            max={8192}
            step={256}
            formatValue={formatTokens}
            description="Maximum number of tokens in the response. Higher values allow longer responses."
            marks={[
              { value: 512, label: "512" },
              { value: 2048, label: "2K" },
              { value: 4096, label: "4K" },
              { value: 8192, label: "8K" },
            ]}
          />
        </div>

        {/* API Key Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              API Key
            </h3>
          </div>

          {compatibleApiKeys.length > 0 ? (
            <Dropdown
              options={[
                ...compatibleApiKeys.map((key) => ({
                  value: key._id,
                  label: key.alias,
                  description: `${key.provider} • Last used: ${
                    key.lastUsed
                      ? new Date(key.lastUsed).toLocaleDateString()
                      : "Never"
                  }`,
                  icon: Key,
                })),
              ]}
              value={config.apiKeyId || ""}
              onSelect={(value) => handleConfigChange("apiKeyId", value)}
              placeholder="Select API key..."
            />
          ) : (
            <div className="p-3 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                No API keys found for {currentModel?.provider}.
                <br />
                Add an API key in Settings to use custom configurations.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            Reset to Defaults
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Apply Settings
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
          <p className="mb-1">
            <strong>Configuration Tips:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Lower temperature (0.1-0.3) for factual, consistent responses
            </li>
            <li>Higher temperature (0.8-1.2) for creative, varied responses</li>
            <li>Increase max tokens for longer, more detailed responses</li>
            <li>
              Custom API keys allow you to use your own rate limits and billing
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
