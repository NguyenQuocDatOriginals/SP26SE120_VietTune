import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { reportError } from "@/services/errorReporting";

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
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
        <div
          className="min-h-screen flex items-center justify-center px-4 bg-neutral-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
              <AlertTriangle className="w-8 h-8" aria-hidden />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-neutral-600 mb-6">
              Ứng dụng gặp sự cố không mong muốn. Bạn có thể thử lại hoặc quay về trang chủ.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-neutral-200 text-neutral-800 p-3 rounded-lg mb-6 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Thử lại
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
