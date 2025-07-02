import type { ReactNode } from 'react';
import React, { Component } from 'react';
import type { ErrorFallbackProps } from './ErrorFallback';
import { ErrorFallback } from './ErrorFallback';
import { secureLogger } from '@/lib/secure-logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary - Componente para capturar e tratar erros em React
 * 
 * Funcionalidades:
 * - Captura erros JavaScript não tratados na árvore de componentes
 * - Exibe uma interface de fallback amigável ao usuário
 * - Registra erros de forma segura para análise
 * - Permite recuperação através de retry
 * - Suporte a fallback customizado
 * 
 * Uso:
 * ```tsx
 * <ErrorBoundary>
 *   <MeuComponente />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Atualizar estado com informações do erro
    this.setState({
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    });

    // Log seguro do erro
    secureLogger.error('ErrorBoundary caught an error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}



export default ErrorBoundary;

/**
 * Hook para usar o ErrorBoundary de forma programática
 * @deprecated Use useErrorHandler from '@/hooks/useErrorHandler' instead
 */
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
};

/**
 * HOC para envolver componentes com ErrorBoundary
 * 
 * @param Component - Componente a ser envolvido
 * @param fallback - Componente de fallback opcional
 * @returns Componente envolvido com ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};