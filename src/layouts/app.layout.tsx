import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isOpen: sidebarOpen } = useSidebarStore();

  return (
    <div className="h-screen overflow-hidden bg-theme-gradient transition-colors duration-300">
      {/* Sidebar - Always visible */}
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main Content Container */}
      <div
        className={`h-screen transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "lg:pl-80" : ""
        }`}
      >
        <div className="h-screen overflow-hidden flex items-center justify-center p-2 sm:p-4">
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
