import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { ApolloProvider } from "@apollo/client";
import { LoadingScreen } from "./components/layout/LoadingScreen";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { useAuth } from "./hooks/useAuth";
import { apolloClient } from "./lib/apollo/apollo-client";
import { logger } from "./lib/logger";
import { indexedDB } from "./lib/storage/indexed-db";
import { AppRouter } from "./router";
import { useConnectionStore } from "./stores/connection-store";

// Main app content that shows loading screens
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const { initializeConnectionMonitoring } = useConnectionStore();

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        logger.info("Initializing UOA Chat Client...");

        // Initialize IndexedDB for offline storage
        if (indexedDB.isAvailable()) {
          await indexedDB.init();
          logger.info("IndexedDB initialized");
        } else {
          logger.warn("IndexedDB not available");
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add debug logging for auth state changes
  useEffect(() => {
    logger.debug("Auth state changed:", { isAuthenticated });
  }, [isAuthenticated]);

  // Show loading screen during auth operations
  if (authLoading || !isInitialized) {
    return (
      <LoadingScreen
        message="Authenticating..."
        submessage="Please wait while we verify your credentials"
      />
    );
  }

  return <AppRouter />;
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
