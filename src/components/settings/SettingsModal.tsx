import {
  Globe,
  HardDrive,
  Key,
  Palette,
  Puzzle,
  Settings,
  Shield,
  User,
} from "lucide-react";
import React, { useState } from "react";

import { Modal } from "../ui/Modal";
import { AccountTab } from "./tabs/AccountTab";
import { AddonsTab } from "./tabs/AddonsTab";
import { ApiKeysTab } from "./tabs/ApiKeysTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { StorageTab } from "./tabs/StorageTab";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "addons", label: "Addons", icon: Puzzle },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "account", label: "Account", icon: User },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("appearance");

  const renderTabContent = () => {
    switch (activeTab) {
      case "appearance":
        return <AppearanceTab />;

      case "language":
        return <LanguageTab />;

      case "apikeys":
        return <ApiKeysTab />;

      case "storage":
        return <StorageTab />;

      case "addons":
        return <AddonsTab />;

      case "account":
        return <AccountTab />;

      case "privacy":
        return <PrivacyTab />;

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
          <div className="flex-1 lg:pl-6 p-5 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </Modal>
    </>
  );
};