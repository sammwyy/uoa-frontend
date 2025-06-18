import { Button } from "@/components/ui/Button";
import { Zap } from "lucide-react";

export function PrivacyTab() {
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
            Due to a refactor (Chat Branches Feature) this feature needs to be
            reviewed.
          </p>
        </div>
      </div>

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
