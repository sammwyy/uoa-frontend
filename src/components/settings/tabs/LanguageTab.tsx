import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Switch } from "@/components/ui/Switch";
import { usePreferences } from "@/hooks/usePreferences";

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
  region?: string;
}

interface DateFormatOption {
  value: string;
  label: string;
  example: string;
}

const languageOptions: LanguageOption[] = [
  { value: "en", label: "English", flag: "🇺🇸", region: "United States" },
  { value: "en-GB", label: "English", flag: "🇬🇧", region: "United Kingdom" },
  { value: "es", label: "Español", flag: "🇪🇸", region: "España" },
  { value: "es-MX", label: "Español", flag: "🇲🇽", region: "México" },
  { value: "fr", label: "Français", flag: "🇫🇷", region: "France" },
  { value: "de", label: "Deutsch", flag: "🇩🇪", region: "Deutschland" },
  { value: "it", label: "Italiano", flag: "🇮🇹", region: "Italia" },
  { value: "pt", label: "Português", flag: "🇧🇷", region: "Brasil" },
  { value: "ja", label: "日本語", flag: "🇯🇵", region: "Japan" },
  { value: "ko", label: "한국어", flag: "🇰🇷", region: "Korea" },
  { value: "zh", label: "中文", flag: "🇨🇳", region: "简体" },
  { value: "zh-TW", label: "中文", flag: "🇹🇼", region: "繁體" },
];

const dateFormatOptions: DateFormatOption[] = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/31/2024" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "31/12/2024" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2024-12-31" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY", example: "31 Dec 2024" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY", example: "Dec 31, 2024" },
];

export function LanguageTab() {
  const { preferences, updatePreference, isLoading } = usePreferences();

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
              value={preferences.language}
              onSelect={(value) => updatePreference("language", value)}
              placeholder="Select language..."
              disabled={true}
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
              value={preferences.dateFormat}
              onSelect={(value) => updatePreference("dateFormat", value)}
              placeholder="Select date format..."
              disabled={isLoading}
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
            checked={preferences.use24HourFormat}
            onChange={(checked) => updatePreference("use24HourFormat", checked)}
            disabled={isLoading}
            label="Use 24-hour time format"
            description="Display time in 24-hour format (14:30) instead of 12-hour format (2:30 PM)"
          />
        </Card>
      </div>

      {/* Current Settings Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Preview
        </h3>
        <Card padding="lg" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Current Time:
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date().toLocaleTimeString(preferences.language || "en", {
                  hour12: !preferences.use24HourFormat,
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Current Date:
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString(preferences.language || "en")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
        <p className="mb-1">
          <strong>About Language Settings:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            Language settings are synced to your account across all devices
          </li>
          <li>
            Time zone affects how timestamps are displayed in conversations
          </li>
          <li>Date format applies to all dates shown in the interface</li>
          <li>Regional settings affect units and number formatting</li>
        </ul>
      </div>
    </div>
  );
}
