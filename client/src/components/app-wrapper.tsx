import { ReactNode, useEffect, useState } from "react";
import { ErrorBoundary } from "./error-boundary";

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught:", event.reason);
      console.error("Stack trace:", event.reason?.stack);
      
      // Log the specific error details for debugging
      if (event.reason?.message) {
        console.error("Error message:", event.reason.message);
      }
      
      // Prevent the error from crashing the app
      event.preventDefault();
      
      // Don't set error state for fetch/network errors, just log them
      if (!event.reason?.message?.includes('fetch') && 
          !event.reason?.message?.includes('NetworkError') &&
          !event.reason?.message?.includes('Failed to fetch')) {
        setHasError(true);
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      console.error("Error details:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Prevent the error from crashing the app
      event.preventDefault();
    };

    // Add global error handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            The application encountered an error. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}