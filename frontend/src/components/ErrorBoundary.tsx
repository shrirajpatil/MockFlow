'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches errors in the component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // Log to error tracking service (Sentry, etc.)
        this.logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    logErrorToService(error: Error, errorInfo: ErrorInfo) {
        // TODO: Integrate with Sentry or other error tracking service
        // Example:
        // if (window.Sentry) {
        //   window.Sentry.captureException(error, {
        //     contexts: {
        //       react: {
        //         componentStack: errorInfo.componentStack,
        //       },
        //     },
        //   });
        // }

        // For now, just log to console
        console.error('Error logged:', {
            error: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Description */}
                        <p className="text-center text-gray-600 mb-8">
                            We're sorry for the inconvenience. An unexpected error occurred while rendering this page.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && this.state.error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details (Dev Only):</h3>
                                <pre className="text-xs text-red-800 overflow-auto max-h-40 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>

                            <Button
                                onClick={this.handleReload}
                                variant="outline"
                                className="border-indigo-200 hover:bg-indigo-50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload Page
                            </Button>

                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                className="border-indigo-200 hover:bg-indigo-50"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="text-center text-sm text-gray-500 mt-8">
                            If this problem persists, please contact support or try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error boundary wrapper
 * Use this to wrap specific components that need error boundaries
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
