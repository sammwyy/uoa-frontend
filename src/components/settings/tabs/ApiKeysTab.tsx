import { AlertCircle, Check, Key, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";

interface APIKeyStatus {
  status: "none" | "valid" | "invalid";
  error?: string;
}

const getStatusIcon = (status: APIKeyStatus["status"]) => {
  switch (status) {
    case "valid":
      return <Check className="w-4 h-4" />;
    case "invalid":
      return <X className="w-4 h-4" />;
    default:
      return <Key className="w-4 h-4" />;
  }
};

const getStatusText = (status: APIKeyStatus["status"]) => {
  switch (status) {
    case "valid":
      return "Connected";
    case "invalid":
      return "Invalid";
    default:
      return "Not Set";
  }
};

const getStatusColor = (status: APIKeyStatus["status"]) => {
  switch (status) {
    case "valid":
      return "text-green-600 dark:text-green-400";
    case "invalid":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

export function ApiKeysTab() {
  const [showApiKeyModal, setShowApiKeyModal] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSettingApiKey, setIsSettingApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, APIKeyStatus>>({
    openai: { status: "valid" },
    anthropic: { status: "none" },
    google: { status: "invalid", error: "Invalid API key format" },
    openrouter: { status: "none" },
  });

  const handleSetApiKey = async (provider: string) => {
    if (!apiKeyInput.trim()) {
      alert("Please enter an API key");
      return;
    }

    setIsSettingApiKey(true);

    // Simulate API key validation
    setTimeout(() => {
      const isValid = Math.random() > 0.3; // 70% chance of being valid

      setApiKeys((prev) => ({
        ...prev,
        [provider]: {
          status: isValid ? "valid" : "invalid",
          error: isValid
            ? undefined
            : "Invalid API key or insufficient permissions",
        },
      }));

      setIsSettingApiKey(false);
      setShowApiKeyModal(null);
      setApiKeyInput("");
    }, 2000);
  };

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          API Keys
        </h3>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            Object.entries(apiKeys).map(([provider, keyStatus]) => (
              <Card key={provider} padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                        {provider === "openrouter" ? "OpenRouter" : provider}
                      </h4>
                      <div
                        className={`flex items-center gap-2 text-sm ${getStatusColor(
                          keyStatus.status
                        )}`}
                      >
                        {getStatusIcon(keyStatus.status)}
                        <span>{getStatusText(keyStatus.status)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowApiKeyModal(provider)}
                  >
                    {keyStatus.status === "none" ? "Set Key" : "Update Key"}
                  </Button>
                </div>
                {keyStatus.status === "invalid" && keyStatus.error && (
                  <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {keyStatus.error}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Model Configuration
        </h3>
        <Card padding="md" className="space-y-4">
          <Switch
            checked={false}
            onChange={() => {}}
            label="Auto-select Best Model"
            description="Automatically choose the most suitable model for each task"
          />
          <Switch
            checked={true}
            onChange={() => {}}
            label="Fallback Models"
            description="Use backup models when primary model is unavailable"
          />
          <Switch
            checked={false}
            onChange={() => {}}
            label="Cost Optimization"
            description="Prefer lower-cost models when quality difference is minimal"
          />
        </Card>
      </div>

      <Modal
        isOpen={showApiKeyModal !== null}
        onClose={() => setShowApiKeyModal(null)}
        size="sm"
        title={`Set ${
          showApiKeyModal?.charAt(0).toUpperCase() ||
          "" + showApiKeyModal?.slice(1)
        } API Key`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Security Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your API key will be stored securely and never displayed. You
                  can update it anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Input
              label="API Key"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={`Enter your ${showApiKeyModal} API key`}
              icon={Key}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowApiKeyModal(null)}
              className="flex-1"
              disabled={isSettingApiKey}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSetApiKey(showApiKeyModal!)}
              disabled={!apiKeyInput.trim() || isSettingApiKey}
              className="flex-1"
            >
              {isSettingApiKey ? "Setting..." : "Set API Key"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
