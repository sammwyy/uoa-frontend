import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Switch } from "@/components/ui/Switch";
import { Clock } from "lucide-react";
import { useState } from "react";

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

export function LanguageTab() {
  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York");
  const [selectedDateFormat, setSelectedDateFormat] = useState("MM/DD/YYYY");

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
}
