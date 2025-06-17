import { AlertCircle, Check, Key, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useApiKeys } from "@/hooks/useApiKeys";
import {
  AIProviderId,
  ApiKey,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from "@/lib/graphql";

const getStatusIcon = (isValid: boolean) => {
  return isValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />;
};

const getStatusText = (isValid: boolean) => {
  return isValid ? "Connected" : "Invalid";
};

const getStatusColor = (isValid: boolean) => {
  return isValid
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
};

const providerOptions = [
  {
    value: AIProviderId.ANTHROPIC,
    label: "Anthropic",
    description: "Claude models",
  },
  { value: AIProviderId.GOOGLE, label: "Google", description: "Gemini models" },
  { value: "openai", label: "OpenAI", description: "GPT models" },
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Multiple providers",
  },
];

export function ApiKeysTab() {
  const {
    apiKeys,
    isLoading,
    error,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    clearError,
  } = useApiKeys();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating/editing API keys
  const [formData, setFormData] = useState<{
    alias: string;
    apiKey: string;
    provider: AIProviderId | string;
  }>({
    alias: "",
    apiKey: "",
    provider: AIProviderId.ANTHROPIC,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.alias.trim()) {
      errors.alias = "Alias is required";
    }

    if (!formData.apiKey.trim()) {
      errors.apiKey = "API key is required";
    }

    if (!formData.provider) {
      errors.provider = "Provider is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateApiKey = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const createData: CreateApiKeyDto = {
        alias: formData.alias.trim(),
        apiKey: formData.apiKey.trim(),
        provider: formData.provider as AIProviderId,
      };

      await createApiKey(createData);

      // Reset form and close modal
      setFormData({ alias: "", apiKey: "", provider: AIProviderId.ANTHROPIC });
      setFormErrors({});
      setShowApiKeyModal(false);
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateApiKey = async (id: string) => {
    if (!formData.alias.trim()) {
      setFormErrors({ alias: "Alias is required" });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: UpdateApiKeyDto = {
        alias: formData.alias.trim(),
      };

      await updateApiKey(id, updateData);

      // Reset form and exit edit mode
      setFormData({ alias: "", apiKey: "", provider: AIProviderId.ANTHROPIC });
      setFormErrors({});
      setEditingApiKey(null);
    } catch (error) {
      console.error("Failed to update API key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteApiKey(id);
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  const startEditing = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey._id);
    setFormData({
      alias: apiKey.alias,
      apiKey: "",
      provider: apiKey.provider,
    });
    setFormErrors({});
  };

  const cancelEditing = () => {
    setEditingApiKey(null);
    setFormData({ alias: "", apiKey: "", provider: AIProviderId.ANTHROPIC });
    setFormErrors({});
  };

  const openCreateModal = () => {
    setFormData({ alias: "", apiKey: "", provider: AIProviderId.ANTHROPIC });
    setFormErrors({});
    setShowApiKeyModal(true);
  };

  const closeCreateModal = () => {
    setShowApiKeyModal(false);
    setFormData({ alias: "", apiKey: "", provider: AIProviderId.ANTHROPIC });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            API Keys
          </h3>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateModal}
            disabled={isLoading}
          >
            Add API Key
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
                <button
                  onClick={clearError}
                  className="mt-1 text-red-600 hover:text-red-700 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : apiKeys.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  No API Keys
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add your first API key to start using AI models
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={openCreateModal}
                >
                  Add API Key
                </Button>
              </div>
            </Card>
          ) : (
            apiKeys.map((apiKey) => (
              <Card key={apiKey._id} padding="md" className="space-y-3">
                {editingApiKey === apiKey._id ? (
                  <div className="space-y-4">
                    <Input
                      label="Alias"
                      value={formData.alias}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          alias: e.target.value,
                        }))
                      }
                      error={!!formErrors.alias}
                      helperText={formErrors.alias}
                      placeholder="Enter a name for this API key"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateApiKey(apiKey._id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {apiKey.alias}
                        </h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400 capitalize">
                            {apiKey.provider}
                          </span>
                          <div
                            className={`flex items-center gap-1 ${getStatusColor(
                              true
                            )}`}
                          >
                            {getStatusIcon(true)}
                            <span>{getStatusText(true)}</span>
                          </div>
                          {apiKey.lastUsed && (
                            <span className="text-gray-500 dark:text-gray-400">
                              Last used:{" "}
                              {new Date(apiKey.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEditing(apiKey)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteApiKey(apiKey._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showApiKeyModal}
        onClose={closeCreateModal}
        size="sm"
        title="Add API Key"
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
                  Your API key will be stored securely and encrypted. You can
                  update or delete it anytime.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Alias"
            value={formData.alias}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, alias: e.target.value }))
            }
            error={!!formErrors.alias}
            helperText={formErrors.alias}
            placeholder="Enter a name for this API key (e.g., 'My OpenAI Key')"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <Dropdown
              options={providerOptions}
              value={formData.provider}
              onSelect={(value) =>
                setFormData((prev) => ({ ...prev, provider: value }))
              }
              placeholder="Select provider..."
            />
            {formErrors.provider && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {formErrors.provider}
              </p>
            )}
          </div>

          <Input
            label="API Key"
            type="password"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
            }
            error={!!formErrors.apiKey}
            helperText={formErrors.apiKey}
            placeholder="Enter your API key"
            icon={Key}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={closeCreateModal}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateApiKey}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Adding..." : "Add API Key"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
