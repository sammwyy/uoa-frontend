import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { usePreferences } from "@/hooks/usePreferences";
import { useSidebarStore } from "@/stores/sidebar-store";

export function ClientTab() {
  const { preferences, updatePreference, isLoading } = usePreferences();
  const { isOpen: showSidebar, toggle: toggleSidebar } = useSidebarStore();

  return (
    <div className="space-y-6">
      {/* Interface Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Interface Settings
        </h3>
        <Card padding="lg" className="space-y-6">
          <Switch
            checked={showSidebar}
            onChange={toggleSidebar}
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
        </Card>
      </div>

      {/* Settings Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
        <p className="mb-1">
          <strong>About Client Settings:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            These settings are synced to your account and apply across all
            devices
          </li>
          <li>Changes are saved automatically to the server</li>
          <li>Some settings may require a page refresh to take full effect</li>
          <li>Performance settings help optimize the app for your device</li>
        </ul>
      </div>
    </div>
  );
}
