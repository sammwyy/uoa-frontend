import {
  AlertCircle,
  Bell,
  Bot,
  Check,
  Clock,
  Code,
  FileText,
  Globe,
  Image,
  Key,
  Moon,
  Palette,
  Puzzle,
  Scan,
  Settings,
  Shield,
  Smartphone,
  Sun,
  User,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

import { useModels } from "@/hooks/useModels";
import { useThemeStore } from "@/stores/theme-store";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Dropdown } from "../ui/Dropdown";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "../ui/PasswordInput";
import { Switch } from "../ui/Switch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeOption {
  id: "default" | "deep" | "wind" | "candy" | "shad";
  name: string;
  description: string;
  colors: {
    light: string;
    dark: string;
  };
}

interface NotificationSettings {
  desktop: boolean;
  sound: boolean;
  email: boolean;
  emailDigest: boolean;
  mentions: boolean;
  newFeatures: boolean;
}

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
  region?: string;
}

interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

interface DateFormatOption {
  value: string;
  label: string;
  example: string;
}

interface APIKeyStatus {
  status: "none" | "valid" | "invalid";
  error?: string;
}

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

const themeOptions: ThemeOption[] = [
  {
    id: "default",
    name: "Sunset",
    description: "Warm orange to pink gradient",
    colors: {
      light: "linear-gradient(135deg, #f97316, #ec4899)",
      dark: "linear-gradient(135deg, #ea580c, #db2777)",
    },
  },
  {
    id: "deep",
    name: "Ocean",
    description: "Deep blue marine tones",
    colors: {
      light: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
      dark: "linear-gradient(135deg, #0284c7, #2563eb)",
    },
  },
  {
    id: "wind",
    name: "Forest",
    description: "Soft green nature vibes",
    colors: {
      light: "linear-gradient(135deg, #10b981, #059669)",
      dark: "linear-gradient(135deg, #059669, #047857)",
    },
  },
  {
    id: "candy",
    name: "Candy",
    description: "Sweet pink pastels",
    colors: {
      light: "linear-gradient(135deg, #f472b6, #ec4899)",
      dark: "linear-gradient(135deg, #ec4899, #db2777)",
    },
  },
  {
    id: "shad",
    name: "Monochrome",
    description: "Pure black and white",
    colors: {
      light: "linear-gradient(135deg, #374151, #111827)",
      dark: "linear-gradient(135deg, #f9fafb, #e5e7eb)",
    },
  },
];

const languageOptions: LanguageOption[] = [
  { value: "en-US", label: "English", flag: "🇺🇸", region: "United States" },
  { value: "en-GB", label: "English", flag: "🇬🇧", region: "United Kingdom" },
  { value: "es-ES", label: "Español", flag: "🇪🇸", region: "España" },
  { value: "es-MX", label: "Español", flag: "🇲🇽", region: "México" },
  { value: "fr-FR", label: "Français", flag: "🇫🇷", region: "France" },
  { value: "de-DE", label: "Deutsch", flag: "🇩🇪", region: "Deutschland" },
  { value: "it-IT", label: "Italiano", flag: "🇮🇹", region: "Italia" },
  { value: "pt-BR", label: "Português", flag: "🇧🇷", region: "Brasil" },
  { value: "ja-JP", label: "日本語", flag: "🇯🇵", region: "Japan" },
  { value: "ko-KR", label: "한국어", flag: "🇰🇷", region: "Korea" },
  { value: "zh-CN", label: "中文", flag: "🇨🇳", region: "简体" },
  { value: "zh-TW", label: "中文", flag: "🇹🇼", region: "繁體" },
];

const timeZoneOptions: TimeZoneOption[] = [
  { value: "America/New_York", label: "Eastern Time", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time", offset: "UTC-8" },
  { value: "Europe/London", label: "Greenwich Mean Time", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Central European Time", offset: "UTC+1" },
  { value: "Europe/Moscow", label: "Moscow Time", offset: "UTC+3" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", offset: "UTC+9" },
  { value: "Asia/Shanghai", label: "China Standard Time", offset: "UTC+8" },
  {
    value: "Australia/Sydney",
    label: "Australian Eastern Time",
    offset: "UTC+10",
  },
];

const dateFormatOptions: DateFormatOption[] = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/31/2024" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "31/12/2024" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2024-12-31" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY", example: "31 Dec 2024" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY", example: "Dec 31, 2024" },
];

const tabs = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "models", label: "Models", icon: Bot },
  { id: "addons", label: "Addons", icon: Puzzle },
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "language", label: "Language", icon: Globe },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("appearance");
  const { baseTheme, accentTheme, setAccentTheme, toggleBaseTheme } =
    useThemeStore();
  const { models } = useModels();

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isSettingUpTwoFactor, setIsSettingUpTwoFactor] = useState(false);

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    desktop: true,
    sound: false,
    email: true,
    emailDigest: false,
    mentions: true,
    newFeatures: false,
  });

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York");
  const [selectedDateFormat, setSelectedDateFormat] = useState("MM/DD/YYYY");

  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, APIKeyStatus>>({
    openai: { status: "valid" },
    anthropic: { status: "none" },
    google: { status: "invalid", error: "Invalid API key format" },
    openrouter: { status: "none" },
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSettingApiKey, setIsSettingApiKey] = useState(false);

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

  const handlePasswordChange = async () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsChangingPassword(true);
      // Simulate API call
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        alert("Password changed successfully!");
      }, 2000);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setShowPasswordForm(false);
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorEnabled(false);
      alert("Two-factor authentication disabled");
    } else {
      // Enable 2FA
      setShowTwoFactorSetup(true);
    }
  };

  const handleTwoFactorSetup = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setIsSettingUpTwoFactor(true);
    // Simulate API call
    setTimeout(() => {
      setIsSettingUpTwoFactor(false);
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setTwoFactorCode("");
      alert("Two-factor authentication enabled successfully!");
    }, 2000);
  };

  const updateNotification = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

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

      if (isValid) {
        alert(
          `${
            provider.charAt(0).toUpperCase() + provider.slice(1)
          } API key set successfully!`
        );
      }
    }, 2000);
  };

  const updateAddonSetting = (key: keyof AddonSettings, value: unknown) => {
    setAddonSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  const vlmModels = models.filter((m) => m.capabilities.imageAnalysis);

  const renderTabContent = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <div className="space-y-6">
            {/* Theme Mode */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Theme Mode
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card
                  variant={baseTheme === "light" ? "glass" : "default"}
                  padding="md"
                  onClick={() => baseTheme === "dark" && toggleBaseTheme()}
                  className={`cursor-pointer transition-all duration-200 ${
                    baseTheme === "light"
                      ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                        Light Mode
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Bright and clean
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  variant={baseTheme === "dark" ? "glass" : "default"}
                  padding="md"
                  onClick={() => baseTheme === "light" && toggleBaseTheme()}
                  className={`cursor-pointer transition-all duration-200 ${
                    baseTheme === "dark"
                      ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                        Dark Mode
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Easy on the eyes
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Color Themes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Color Theme
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {themeOptions.map((theme) => (
                  <Card
                    key={theme.id}
                    variant={accentTheme === theme.id ? "glass" : "default"}
                    padding="md"
                    onClick={() => setAccentTheme(theme.id)}
                    className={`cursor-pointer group transition-all duration-200 ${
                      accentTheme === theme.id
                        ? "bg-primary-100/60 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-700/50"
                        : "hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm border border-white/30 dark:border-gray-600/30"
                          style={{ background: theme.colors[baseTheme] }}
                        />
                        {accentTheme === theme.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div
                          className={`font-medium text-sm sm:text-base ${
                            accentTheme === theme.id
                              ? "text-primary-700 dark:text-primary-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {theme.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {theme.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Display Settings
              </h3>
              <div className="space-y-4">
                <Switch
                  checked={false}
                  onChange={() => {}}
                  label="Compact Mode"
                  description="Reduce spacing and padding throughout the interface"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Show Timestamps"
                  description="Display message timestamps in conversations"
                />
                <Switch
                  checked={false}
                  onChange={() => {}}
                  label="Smooth Animations"
                  description="Enable smooth transitions and micro-interactions"
                />
              </div>
            </div>
          </div>
        );

      case "models":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                API Keys
              </h3>
              <div className="space-y-4">
                {Object.entries(apiKeys).map(([provider, keyStatus]) => (
                  <Card key={provider} padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                            {provider === "openrouter"
                              ? "OpenRouter"
                              : provider}
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
                ))}
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
          </div>
        );

      case "addons":
        return (
          <div className="space-y-6">
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
                        Enable image understanding capabilities. For models that
                        don't support images, an auxiliary model will be used.
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
                          onChange={(enabled) =>
                            updateAddonSetting("draw", enabled)
                          }
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

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Profile Information
              </h3>
              <Card padding="lg" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      User
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      user@example.com
                    </p>
                    <Badge variant="primary" size="sm" className="mt-1">
                      Free Plan
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hidden sm:block"
                  >
                    Edit Profile
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:hidden"
                >
                  Edit Profile
                </Button>
              </Card>
            </div>

            {/* Change Password */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Change Password
              </h3>
              <Card padding="lg" className="space-y-4">
                {!showPasswordForm ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        Password
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last changed 3 months ago
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      icon={Key}
                      onClick={() => setShowPasswordForm(true)}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-primary-500" />
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        Change Your Password
                      </h4>
                    </div>

                    <PasswordInput
                      label="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter your current password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      autoComplete="current-password"
                    />

                    <PasswordInput
                      label="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter your new password"
                      error={!!passwordErrors.newPassword}
                      helperText={
                        passwordErrors.newPassword ||
                        "Must be at least 8 characters long"
                      }
                      autoComplete="new-password"
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm your new password"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      autoComplete="new-password"
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        variant="secondary"
                        onClick={handleCancelPasswordChange}
                        className="flex-1"
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className="flex-1"
                      >
                        {isChangingPassword
                          ? "Changing Password..."
                          : "Change Password"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Two-Factor Authentication */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Two-Factor Authentication
              </h3>
              <Card padding="lg" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Authenticator App
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {twoFactorEnabled
                        ? "Two-factor authentication is currently enabled. Your account is protected with an additional security layer."
                        : "Add an extra layer of security to your account by enabling two-factor authentication using an authenticator app."}
                    </p>

                    {twoFactorEnabled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Last used: 2 hours ago
                          </span>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleTwoFactorToggle}
                          className="w-full sm:w-auto"
                        >
                          Disable Two-Factor Authentication
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleTwoFactorToggle}
                        className="w-full sm:w-auto"
                      >
                        Enable Two-Factor Authentication
                      </Button>
                    )}
                  </div>
                </div>

                {showTwoFactorSetup && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      Setup Two-Factor Authentication
                    </h5>
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          1. Download an authenticator app like Google
                          Authenticator or Authy
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          2. Scan this QR code with your authenticator app:
                        </p>
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3 mx-auto sm:mx-0">
                          <span className="text-xs text-gray-500">QR Code</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          3. Enter the 6-digit code from your authenticator app:
                        </p>
                      </div>

                      <Input
                        label="Verification Code"
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) =>
                          setTwoFactorCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        placeholder="000000"
                        className="text-center text-lg tracking-widest font-mono"
                        maxLength={6}
                      />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setShowTwoFactorSetup(false);
                            setTwoFactorCode("");
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleTwoFactorSetup}
                          disabled={
                            isSettingUpTwoFactor || twoFactorCode.length !== 6
                          }
                          className="flex-1"
                        >
                          {isSettingUpTwoFactor
                            ? "Verifying..."
                            : "Verify & Enable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Notification Preferences
              </h3>
              <Card padding="lg" className="space-y-6">
                <Switch
                  checked={notifications.desktop}
                  onChange={(checked) => updateNotification("desktop", checked)}
                  label="Desktop Notifications"
                  description="Show browser notifications for new messages and updates"
                />

                <Switch
                  checked={notifications.sound}
                  onChange={(checked) => updateNotification("sound", checked)}
                  label="Sound Notifications"
                  description="Play notification sounds for new messages"
                />

                <Switch
                  checked={notifications.mentions}
                  onChange={(checked) =>
                    updateNotification("mentions", checked)
                  }
                  label="Mentions & Replies"
                  description="Get notified when someone mentions you or replies to your message"
                />
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Email Notifications
              </h3>
              <Card padding="lg" className="space-y-6">
                <Switch
                  checked={notifications.email}
                  onChange={(checked) => updateNotification("email", checked)}
                  label="Email Notifications"
                  description="Receive important updates and notifications via email"
                />

                <Switch
                  checked={notifications.emailDigest}
                  onChange={(checked) =>
                    updateNotification("emailDigest", checked)
                  }
                  label="Weekly Digest"
                  description="Get a weekly summary of your activity and conversations"
                />

                <Switch
                  checked={notifications.newFeatures}
                  onChange={(checked) =>
                    updateNotification("newFeatures", checked)
                  }
                  label="Product Updates"
                  description="Be the first to know about new features and improvements"
                />
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Do Not Disturb
              </h3>
              <Card padding="lg" className="space-y-4">
                <Switch
                  checked={false}
                  onChange={() => {}}
                  label="Enable Do Not Disturb"
                  description="Temporarily disable all notifications"
                />

                <div className="pl-0 sm:pl-8 space-y-3 opacity-50">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Schedule quiet hours:
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Input
                      type="time"
                      value="22:00"
                      className="w-full sm:w-32"
                      disabled
                    />
                    <span className="text-sm text-gray-500 hidden sm:inline">
                      to
                    </span>
                    <Input
                      type="time"
                      value="08:00"
                      className="w-full sm:w-32"
                      disabled
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Privacy Settings
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-theme-bg-surface/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      Data Collection
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Allow usage analytics
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Manage
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-theme-bg-surface/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      Chat History
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Control conversation storage
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Settings
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-theme-bg-surface/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      Export Data
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Download your information
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Language & Region
              </h3>
              <Card padding="lg" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interface Language
                  </label>
                  <Dropdown
                    options={languageOptions.map((lang) => ({
                      value: lang.value,
                      label: `${lang.flag} ${lang.label}`,
                      description: lang.region,
                    }))}
                    value={selectedLanguage}
                    onSelect={setSelectedLanguage}
                    placeholder="Select language..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Zone
                  </label>
                  <Dropdown
                    options={timeZoneOptions.map((tz) => ({
                      value: tz.value,
                      label: tz.label,
                      description: tz.offset,
                      icon: Clock,
                    }))}
                    value={selectedTimeZone}
                    onSelect={setSelectedTimeZone}
                    placeholder="Select time zone..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <Dropdown
                    options={dateFormatOptions.map((format) => ({
                      value: format.value,
                      label: format.label,
                      description: format.example,
                    }))}
                    value={selectedDateFormat}
                    onSelect={setSelectedDateFormat}
                    placeholder="Select date format..."
                  />
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Regional Settings
              </h3>
              <Card padding="lg" className="space-y-4">
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Use 24-hour time format"
                  description="Display time in 24-hour format (14:30) instead of 12-hour format (2:30 PM)"
                />

                <Switch
                  checked={false}
                  onChange={() => {}}
                  label="Use metric units"
                  description="Display measurements in metric units (km, kg, °C) instead of imperial"
                />

                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Auto-detect language"
                  description="Automatically detect and suggest language based on your location"
                />
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="flex flex-col lg:flex-row h-[70vh]">
          {/* Sidebar with tabs - Responsive */}
          <div className="lg:border-r border-b lg:border-b-0 border-white/20 dark:border-gray-600/20 lg:pr-6 pb-4 lg:pb-0 mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                Settings
              </h2>
            </div>

            {/* Mobile: Horizontal scroll tabs */}
            <nav className="lg:space-y-2">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink lg:w-full ${
                        activeTab === tab.id
                          ? "bg-primary-100/60 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/50"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-theme-bg-surface-hover/50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1 lg:pl-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </Modal>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <Modal
          isOpen={!!showApiKeyModal}
          onClose={() => setShowApiKeyModal(null)}
          size="sm"
          title={`Set ${
            showApiKeyModal.charAt(0).toUpperCase() + showApiKeyModal.slice(1)
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
                    Your API key will be stored securely and never displayed.
                    You can update it anytime.
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
                onClick={() => handleSetApiKey(showApiKeyModal)}
                disabled={!apiKeyInput.trim() || isSettingApiKey}
                className="flex-1"
              >
                {isSettingApiKey ? "Setting..." : "Set API Key"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
