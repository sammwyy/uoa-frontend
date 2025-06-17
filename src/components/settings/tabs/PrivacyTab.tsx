import { Button } from "@/components/ui/Button";

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Privacy Settings
        </h3>
        <div className="space-y-3">
          {/* Delete Chat History */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-theme-bg-surface/50">
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Purge Chat History
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Delete all of your chat history, branches and messages. This
                action cannot be undone.
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Purge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
