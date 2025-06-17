import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useSidebarStore } from "@/stores/sidebar-store";

export function AppLayout() {
  // Settings
  const { isOpen: showSidebar } = useSidebarStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-theme-gradient transition-colors duration-300">
      {/* Sidebar - Conditionally visible based on user preference */}
      {showSidebar && <Sidebar onOpenSettings={() => setSettingsOpen(true)} />}

      {/* Main Content Container */}
      <div
        className={`h-screen transition-all duration-300 overflow-hidden ${
          showSidebar ? "lg:pl-72" : ""
        }`}
      >
        <div className="h-screen overflow-hidden flex items-center justify-center sm:p-4 p-0">
          <Outlet />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
