import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { ApolloProvider } from "@apollo/client";
import { LoadingScreen } from "./components/layout/LoadingScreen";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { apolloClient } from "./lib/apollo/apollo-client";
import { logger } from "./lib/logger";
import { indexedDB } from "./lib/storage/indexed-db";
import { useAuthStore } from "./stores/auth-store";
import { useConnectionStore } from "./stores/connection-store";
import { AppView } from "./views/AppView";
import { AuthView } from "./views/AuthView";

// Main app content that shows loading screens
const AppContent: React.FC = () => {
  const { isLoading: authLoading } = useAuth();

  // Show loading screen during auth operations
  if (authLoading) {
    return (
      <LoadingScreen
        message="Authenticating..."
        submessage="Please wait while we verify your credentials"
      />
    );
  }

  return (
    <Routes>
      {/* Auth route - only for authentication */}
      <Route path="/auth" element={<AuthView />} />

      {/* All other routes go to AppView - it handles everything internally */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const { initializeConnectionMonitoring } = useConnectionStore();

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        logger.info("Initializing AI Chat Client...");

        // Initialize IndexedDB for offline storage
        if (indexedDB.isAvailable()) {
          await indexedDB.init();
          logger.info("IndexedDB initialized");
        } else {
          logger.warn("IndexedDB not available");
        }

        // Initialize authentication state from localStorage
        // This is now also called automatically in the store, but we call it here too for safety
        initializeAuth();

        // Initialize connection monitoring
        const cleanupConnection = initializeConnectionMonitoring();

        logger.info("Application initialized successfully");

        // Return cleanup function
        return cleanupConnection;
      } catch (error) {
        logger.error("Failed to initialize application:", error);
      }
    };

    const cleanup = initializeApp();

    // Cleanup on unmount
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then((cleanupFn) => {
          if (cleanupFn && typeof cleanupFn === "function") {
            cleanupFn();
          }
        });
      } else if (cleanup && typeof cleanup === "function") {
        (cleanup as () => void)();
      }
    };
  }, [initializeAuth, initializeConnectionMonitoring]);

  // Add debug logging for auth state changes
  useEffect(() => {
    logger.debug("Auth state changed:", { isAuthenticated });
  }, [isAuthenticated]);

  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <AppContent />
      </Router>
    </ApolloProvider>
  );
}

export default App;
