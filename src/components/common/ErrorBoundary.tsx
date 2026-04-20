import { Component, type ErrorInfo, type ReactNode } from 'react';

import ErrorFallback from '@/components/common/ErrorFallback';
import { reportError } from '@/services/errorReporting';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Khu vực (main, auth, admin) để gửi kèm khi báo lỗi lên Sentry/LogRocket */
  region?: string;
  /** Optional custom fallback; if not provided, default UI is used */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary: catches JavaScript errors in the child tree,
 * displays a fallback UI instead of a blank screen, and optionally logs the error.
 * Must be a class component (React does not yet support error boundaries in function components).
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, errorInfo, { region: this.props.region });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} variant="fullPage" />
      );
    }
    return this.props.children;
  }
}
