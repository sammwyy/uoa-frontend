import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Switch } from "@/components/ui/Switch";
import { useModels } from "@/hooks/useModels";
import { Code, FileText, Image, Scan, Zap } from "lucide-react";
import { useState } from "react";

interface AddonSettings {
  vlm: {
    enabled: boolean;
    selectedModel: string;
  };
  codeExecutor: boolean;
  draw: boolean;
  pdfReader: boolean;
  imageOCR: boolean;
}

export function AddonsTab() {
  // Models filtering
  const { models } = useModels();
  const vlmModels = models.filter((m) => m.capabilities.imageAnalysis);

  // Addons state
  const [addonSettings, setAddonSettings] = useState<AddonSettings>({
    vlm: {
      enabled: false,
      selectedModel: "gpt-4-vision-preview",
    },
    codeExecutor: false,
    draw: false,
    pdfReader: false,
    imageOCR: false,
  });

  const updateAddonSetting = (key: keyof AddonSettings, value: unknown) => {
    setAddonSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Deprecation warning */}
      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/40">
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">
              Removed Feature
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This feature has been removed from the MVP. To make it easier to
            self-host (and because I don't have the resources to host my own
            instance right now), functions that relied on microservices (such as
            the Code Runner plugin) were removed. Others, such as Draw, were
            integrated natively.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Plugins
        </h3>
        <div className="space-y-4">
          {/* Visual Large Model */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Visual Large Model (VLM)
                  </h4>
                  <Switch
                    checked={addonSettings.vlm.enabled}
                    onChange={(enabled) =>
                      updateAddonSetting("vlm", {
                        ...addonSettings.vlm,
                        enabled,
                      })
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Enable image understanding capabilities. For models that don't
                  support images, an auxiliary model will be used.
                </p>
                {addonSettings.vlm.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred VLM Model
                    </label>
                    <Dropdown
                      options={vlmModels.map((model) => ({
                        value: model.id,
                        label: model.name,
                        description: model.provider,
                      }))}
                      value={addonSettings.vlm.selectedModel}
                      onSelect={(value) =>
                        updateAddonSetting("vlm", {
                          ...addonSettings.vlm,
                          selectedModel: value,
                        })
                      }
                      placeholder="Select VLM model..."
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Code Executor */}
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Code Executor
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Execute code in a secure sandbox environment
                    </p>
                  </div>
                  <Switch
                    checked={addonSettings.codeExecutor}
                    onChange={(enabled) =>
                      updateAddonSetting("codeExecutor", enabled)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Draw */}
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Draw
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Draw and send sketches to the AI model
                    </p>
                  </div>
                  <Switch
                    checked={addonSettings.draw}
                    onChange={(enabled) => updateAddonSetting("draw", enabled)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* PDF Reader */}
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      PDF Reader
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extract and analyze text from PDF documents
                    </p>
                  </div>
                  <Switch
                    checked={addonSettings.pdfReader}
                    onChange={(enabled) =>
                      updateAddonSetting("pdfReader", enabled)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Image OCR */}
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                <Scan className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Image OCR
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extract text from images locally at low cost
                    </p>
                  </div>
                  <Switch
                    checked={addonSettings.imageOCR}
                    onChange={(enabled) =>
                      updateAddonSetting("imageOCR", enabled)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Addons Summary */}
        {Object.values(addonSettings).some((setting) =>
          typeof setting === "boolean" ? setting : setting.enabled
        ) && (
          <Card
            padding="md"
            className="bg-primary-50/50 dark:bg-primary-900/20 border-primary-200/50 dark:border-primary-700/50"
          >
            <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-3">
              Active Addons
            </h4>
            <div className="flex flex-wrap gap-2">
              {addonSettings.vlm.enabled && (
                <Badge variant="primary" size="sm">
                  VLM
                </Badge>
              )}
              {addonSettings.codeExecutor && (
                <Badge variant="primary" size="sm">
                  Code Executor
                </Badge>
              )}
              {addonSettings.draw && (
                <Badge variant="primary" size="sm">
                  Draw
                </Badge>
              )}
              {addonSettings.pdfReader && (
                <Badge variant="primary" size="sm">
                  PDF Reader
                </Badge>
              )}
              {addonSettings.imageOCR && (
                <Badge variant="primary" size="sm">
                  Image OCR
                </Badge>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
