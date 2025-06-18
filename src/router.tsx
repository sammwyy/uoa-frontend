import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppLayout } from "./layouts/app.layout";
import { AppView } from "./views/AppView";
import { AuthView } from "./views/AuthView";

export function AppRouter() {
  return (
    <Routes>
      {/* Auth route - only for authentication */}
      <Route path="/auth" element={<AuthView />} />

      {/* All other routes go to AppView - it handles everything internally */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Root path shows welcome page */}
        <Route index element={<AppView />} />
        {/* New chat also shows welcome page */}
        <Route path="new" element={<AppView />} />
        {/* Specific chat shows chat view */}
        <Route path="c/:chatId" element={<AppView />} />
        {/* Specific double chat */}
        <Route path="c/:chatId/:secondaryChatId" element={<AppView />} />
      </Route>
    </Routes>
  );
}
