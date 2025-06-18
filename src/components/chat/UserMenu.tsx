import { LogOut, Moon, Settings, Sun, UserIcon } from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "../ui/Button";

interface UserMenuProps {
  onOpenSettings: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { baseTheme, toggleBaseTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full"
      >
        <UserIcon className="w-4 h-4 text-white" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-theme-bg-dropdown/95 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-600/30 shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/20 dark:border-gray-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {user?.displayName || "User"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  toggleBaseTheme();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-theme-bg-surface-hover/50 transition-all duration-200"
              >
                {baseTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-gray-800 dark:text-gray-200">
                  {baseTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-theme-bg-surface-hover/50 transition-all duration-200"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-800 dark:text-gray-200">
                  Settings
                </span>
              </button>

              <div className="border-t border-white/20 dark:border-gray-600/20 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
