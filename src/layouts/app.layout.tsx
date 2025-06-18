import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/sidebar-store";

export function AppLayout() {
  // Check auth
  const { isAuthenticated } = useAuth();

  // Settings
  const { isOpen: showSidebar } = useSidebarStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mustShowSidebar = showSidebar && isAuthenticated;

  return (
    <div className="h-screen w-screen overflow-hidden bg-theme-gradient transition-colors duration-300">
      {/* Sidebar - Conditionally visible based on user preference */}
      {mustShowSidebar && (
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      )}

      {/* Main Content Container */}
      <div
        className={`h-screen transition-all duration-300 overflow-hidden ${
          mustShowSidebar ? "lg:pl-72" : ""
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
