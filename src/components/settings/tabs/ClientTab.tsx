import { Monitor, Sidebar, Clock, Zap } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export function ClientTab() {
  const { preferences, updatePreference, isLoading } = useUserPreferences();

  return (
    <div className="space-y-6">
      {/* Interface Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Interface Settings
        </h3>
        <Card padding="lg" className="space-y-6">
          <Switch
            checked={preferences.showSidebar}
            onChange={(checked) => updatePreference("showSidebar", checked)}
            disabled={isLoading}
            label="Show Sidebar"
            description="Display the sidebar with chat history and navigation"
          />

          <Switch
            checked={preferences.showTimestamps}
            onChange={(checked) => updatePreference("showTimestamps", checked)}
            disabled={isLoading}
            label="Show Timestamps"
            description="Display message timestamps in conversations"
          />

          <Switch
            checked={preferences.smoothAnimations}
            onChange={(checked) => updatePreference("smoothAnimations", checked)}
            disabled={isLoading}
            label="Smooth Animations"
            description="Enable smooth transitions and micro-interactions"
          />
        </Card>
      </div>

      {/* Display Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Display Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            variant={preferences.showSidebar ? "glass" : "default"}
            padding="md"
            className="text-center"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto">
                <Sidebar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Sidebar
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {preferences.showSidebar ? "Visible" : "Hidden"}
              </p>
            </div>
          </Card>

          <Card
            variant={preferences.showTimestamps ? "glass" : "default"}
            padding="md"
            className="text-center"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Timestamps
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {preferences.showTimestamps ? "Shown" : "Hidden"}
              </p>
            </div>
          </Card>

          <Card
            variant={preferences.smoothAnimations ? "glass" : "default"}
            padding="md"
            className="text-center"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Animations
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {preferences.smoothAnimations ? "Enabled" : "Disabled"}
              </p>
            </div>
          </Card>

          <Card
            variant="default"
            padding="md"
            className="text-center"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Theme
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Managed in Appearance
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Performance
        </h3>
        <Card padding="lg" className="space-y-4">
          <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Animation Performance
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {preferences.smoothAnimations 
                    ? "Smooth animations are enabled. This provides a better visual experience but may impact performance on slower devices."
                    : "Animations are disabled. This improves performance on slower devices but reduces visual feedback."
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
        <p className="mb-1">
          <strong>About Client Settings:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>These settings are synced to your account and apply across all devices</li>
          <li>Changes are saved automatically to the server</li>
          <li>Some settings may require a page refresh to take full effect</li>
          <li>Performance settings help optimize the app for your device</li>
        </ul>
      </div>
    </div>
  );
}