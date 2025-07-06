import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary: Error caught:', error);
    console.error('ErrorBoundary: Error stack:', error.stack);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}