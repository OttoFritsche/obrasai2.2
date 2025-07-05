import { useCallback } from 'react';

import { toast } from '@/hooks/use-toast';
import { secureLogger } from '@/lib/secure-logger';

/**
 * Interface para definir diferentes tipos de erro
 */
export interface ErrorInfo {
  message: string;
  code?: string;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userMessage?: string;
}

/**
 * Hook personalizado para tratamento centralizado de erros
 * Fornece funções para capturar, logar e exibir erros de forma consistente
 */
export const useErrorHandler = () => {
  /**
   * Função principal para tratar erros
   */
  const handleError = useCallback((error: Error | ErrorInfo | unknown, context?: string) => {
    let errorInfo: ErrorInfo;

    // Normalizar o erro para o formato ErrorInfo
    if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        code: error.name,
        context: { stack: error.stack, contextInfo: context },
        severity: 'medium',
        userMessage: 'Ocorreu um erro inesperado. Tente novamente.'
      };
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorInfo = error as ErrorInfo;
    } else {
      errorInfo = {
        message: String(error),
        severity: 'low',
        userMessage: 'Ocorreu um erro inesperado. Tente novamente.'
      };
    }

    // Logar o erro de forma segura
    secureLogger.error('Error handled by useErrorHandler', {
      message: errorInfo.message,
      code: errorInfo.code,
      severity: errorInfo.severity,
      context: errorInfo.context,
      timestamp: new Date().toISOString()
    });

    // Exibir toast para o usuário
    const userMessage = errorInfo.userMessage || 'Ocorreu um erro inesperado.';
    
    toast({
      title: 'Erro',
      description: userMessage,
      variant: 'destructive'
    });

    return errorInfo;
  }, []);

  /**
   * Função específica para erros de API
   */
  const handleApiError = useCallback((error: unknown, operation: string) => {
    const errorInfo: ErrorInfo = {
      message: error?.message || 'Erro na comunicação com o servidor',
      code: error?.code || 'API_ERROR',
      context: { operation, error },
      severity: 'high',
      userMessage: 'Erro na comunicação com o servidor. Verifique sua conexão e tente novamente.'
    };

    return handleError(errorInfo);
  }, [handleError]);

  /**
   * Função específica para erros de validação
   */
  const handleValidationError = useCallback((error: unknown, field?: string) => {
    const errorInfo: ErrorInfo = {
      message: error?.message || 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      context: { field, error },
      severity: 'medium',
      userMessage: field 
        ? `Erro no campo ${field}: ${error?.message || 'dados inválidos'}`
        : 'Por favor, verifique os dados informados.'
    };

    return handleError(errorInfo);
  }, [handleError]);

  /**
   * Função específica para erros de autenticação
   */
  const handleAuthError = useCallback((error: any) => {
    const errorInfo: ErrorInfo = {
      message: error?.message || 'Erro de autenticação',
      code: 'AUTH_ERROR',
      context: { error },
      severity: 'high',
      userMessage: 'Sessão expirada. Faça login novamente.'
    };

    return handleError(errorInfo);
  }, [handleError]);

  /**
   * Função para capturar erros assíncronos
   */
  const wrapAsync = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (_error) {
        handleError(_error, context);
        return undefined;
      }
    };
  }, [handleError]);

  /**
   * Função para reportar erro crítico (para monitoramento)
   */
  const reportCriticalError = useCallback((error: Error | ErrorInfo, context?: Record<string, any>) => {
    const errorInfo: ErrorInfo = error instanceof Error 
      ? {
          message: error.message,
          code: error.name,
          context: { stack: error.stack, ...context },
          severity: 'critical',
          userMessage: 'Erro crítico detectado. Nossa equipe foi notificada.'
        }
      : { ...error, severity: 'critical' };

    // Log crítico
    secureLogger.error('CRITICAL ERROR', {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Exibir toast crítico
    toast({
      title: 'Erro Crítico',
      description: errorInfo.userMessage || 'Erro crítico detectado. Nossa equipe foi notificada.',
      variant: 'destructive'
    });

    return errorInfo;
  }, []);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleAuthError,
    wrapAsync,
    reportCriticalError
  };
};

/**
 * Hook para criar um wrapper de função que captura erros automaticamente
 */
export const useErrorBoundary = () => {
  const { handleError } = useErrorHandler();

  const captureError = useCallback((error: Error, errorInfo?: { componentStack: string }) => {
    handleError({
      message: error.message,
      code: error.name,
      context: {
        stack: error.stack,
        componentStack: errorInfo?.componentStack
      },
      severity: 'high',
      userMessage: 'Ocorreu um erro na interface. A página será recarregada.'
    });
  }, [handleError]);

  return { captureError };
};

export default useErrorHandler;