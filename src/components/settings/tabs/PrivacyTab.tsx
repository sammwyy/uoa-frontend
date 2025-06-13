import { Button } from "@/components/ui/Button";

export function PrivacyTab() {
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
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
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
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
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
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
