/**
 * Sistema de Tratamento de Erros do ObrasAI
 * 
 * Este arquivo serve como ponto de entrada principal para todo o sistema
 * de tratamento de erros, exportando todos os componentes, hooks, tipos
 * e utilitários necessários.
 */

// ============================================================================
// COMPONENTES
// ============================================================================

export {
  ErrorBoundary,
  withErrorBoundary,
} from '../components/error/ErrorBoundary';

export {
  ErrorFallback,
  SimpleErrorFallback,
} from '../components/error/ErrorFallback';

// ============================================================================
// HOOKS
// ============================================================================

export {
  useErrorHandler,
  useErrorBoundary,
} from '../hooks/useErrorHandler';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type {
  // Tipos básicos
  ErrorType,
  LogLevel,
  HttpStatus,
  
  // Interfaces principais
  ErrorInfo,
  ErrorHandlerOptions,
  ApiErrorHandlerOptions,
  AsyncWrapperOptions,
  CriticalErrorOptions,
  
  // Interfaces de componentes
  ErrorBoundaryProps,
  ErrorFallbackProps,
  SimpleErrorFallbackProps,
  
  // Interfaces de hooks
  UseErrorHandlerReturn,
  UseErrorBoundaryReturn,
  
  // Configurações
  ErrorSystemConfig,
} from '../types/error';

export {
  // Classes de erro
  ApiError,
  ValidationError,
  AuthError,
  NetworkError,
  
  // Type guards
  isApiError,
  isValidationError,
  isAuthError,
  isNetworkError,
  isError,
  
  // Configuração padrão
  DEFAULT_ERROR_CONFIG,
} from '../types/error';

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

export {
  errorConfig as config,
  ERROR_MESSAGES,
  RETRY_CONFIG,
  LOGGING_CONFIG,
  NOTIFICATION_CONFIG,
  
  // Utilitários de configuração
  isRetryableStatus,
  isNonRetryableStatus,
  getRetryConfigForStatus,
  shouldUseDetailedLogging,
  isSensitiveField,
  sanitizeData,
  isCriticalError,
  getCurrentLoggingConfig,
} from '../config/errorConfig';

// ============================================================================
// UTILITÁRIOS PRINCIPAIS
// ============================================================================

import { useErrorHandler } from '../hooks/useErrorHandler';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { ErrorFallback } from '../components/error/ErrorFallback';
import { errorConfig, ERROR_MESSAGES } from '../config/errorConfig';
import { ApiError, ValidationError, AuthError, NetworkError } from '../types/error';
import type { ErrorHandlerOptions, ApiErrorHandlerOptions } from '../types/error';

/**
 * Instância global do error handler para uso direto
 * 
 * @example
 * ```typescript
 * import { errorSystem } from '@/lib/errorSystem';
 * 
 * // Tratar erro genérico
 * errorSystem.handleError(error, { context: 'user-action' });
 * 
 * // Tratar erro de API
 * errorSystem.handleApiError(error, { context: 'fetch-data' });
 * ```
 */
export const errorSystem = {
  /**
   * Instância do error handler (deve ser usado dentro de componentes React)
   */
  useHandler: useErrorHandler,
  
  /**
   * Componentes principais
   */
  components: {
    ErrorBoundary,
    ErrorFallback,
  },
  
  /**
   * Classes de erro
   */
  errors: {
    ApiError,
    ValidationError,
    AuthError,
    NetworkError,
  },
  
  /**
   * Mensagens de erro pré-definidas
   */
  messages: ERROR_MESSAGES,
  
  /**
   * Configuração do sistema
   */
  config: errorConfig,
};

// ============================================================================
// UTILITÁRIOS DE CONVENIÊNCIA
// ============================================================================

/**
 * Cria um wrapper de erro para funções assíncronas
 * 
 * @example
 * ```typescript
 * import { createAsyncWrapper } from '@/lib/errorSystem';
 * 
 * const safeApiCall = createAsyncWrapper(apiCall, {
 *   context: 'fetch-users',
 *   fallbackMessage: 'Erro ao carregar usuários'
 * });
 * 
 * const result = await safeApiCall();
 * ```
 */
export function createAsyncWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    context: string;
    fallbackMessage?: string;
    showToast?: boolean;
    autoRetry?: boolean;
    maxRetries?: number;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Em um contexto real, isso seria tratado pelo useErrorHandler
      console.error(`Error in ${options.context}:`, error);
      
      if (options.showToast !== false) {
        // Aqui seria chamado o toast system
        console.warn('Toast:', options.fallbackMessage || 'Algo deu errado');
      }
      
      throw error;
    }
  }) as T;
}

/**
 * Cria um Error Boundary com configurações pré-definidas
 * 
 * @example
 * ```typescript
 * import { createErrorBoundary } from '@/lib/errorSystem';
 * 
 * const MyErrorBoundary = createErrorBoundary({
 *   fallbackMessage: 'Erro no componente de usuários',
 *   onError: (error) => console.log('Erro capturado:', error)
 * });
 * 
 * <MyErrorBoundary>
 *   <UserComponent />
 * </MyErrorBoundary>
 * ```
 */
export function createErrorBoundary(options: {
  fallbackMessage?: string;
  showDetails?: boolean;
  onError?: (error: Error) => void;
  autoReset?: boolean;
}) {
  return function CustomErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
      <ErrorBoundary
        onError={options.onError}
        autoReset={options.autoReset}
        fallback={(error, retry) => (
          <ErrorFallback
            error={error}
            retry={retry}
            message={options.fallbackMessage}
            showDetails={options.showDetails}
          />
        )}
      >
        {children}
      </ErrorBoundary>
    );
  };
}

/**
 * Utilitário para criar erros tipados
 * 
 * @example
 * ```typescript
 * import { createError } from '@/lib/errorSystem';
 * 
 * // Erro de API
 * throw createError.api('Usuário não encontrado', 404);
 * 
 * // Erro de validação
 * throw createError.validation('Email inválido', 'email');
 * 
 * // Erro de autenticação
 * throw createError.auth('Token expirado', 'TOKEN_EXPIRED');
 * ```
 */
export const createError = {
  /**
   * Cria um erro de API
   */
  api: (message: string, status: number, code?: string, details?: Record<string, any>) => {
    return new ApiError(message, status as any, code, details);
  },
  
  /**
   * Cria um erro de validação
   */
  validation: (message: string, field?: string, value?: any, rule?: string) => {
    return new ValidationError(message, field, value, rule);
  },
  
  /**
   * Cria um erro de autenticação
   */
  auth: (message: string, code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS', redirectTo?: string) => {
    return new AuthError(message, code, redirectTo);
  },
  
  /**
   * Cria um erro de rede
   */
  network: (message: string, timeout = false, offline = false) => {
    return new NetworkError(message, timeout, offline);
  },
};

/**
 * Utilitário para extrair informações de erro de forma segura
 * 
 * @example
 * ```typescript
 * import { extractErrorInfo } from '@/lib/errorSystem';
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const info = extractErrorInfo(error);
 *   console.log(info.message, info.type, info.status);
 * }
 * ```
 */
export function extractErrorInfo(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      type: 'api' as const,
      status: error.status,
      code: error.code,
      details: error.details,
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      type: 'validation' as const,
      field: error.field,
      value: error.value,
      rule: error.rule,
    };
  }
  
  if (error instanceof AuthError) {
    return {
      message: error.message,
      type: 'auth' as const,
      code: error.code,
      redirectTo: error.redirectTo,
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      type: 'network' as const,
      timeout: error.timeout,
      offline: error.offline,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'generic' as const,
      stack: error.stack,
    };
  }
  
  return {
    message: String(error),
    type: 'unknown' as const,
  };
}

/**
 * Utilitário para verificar se um erro é recuperável
 * 
 * @example
 * ```typescript
 * import { isRecoverableError } from '@/lib/errorSystem';
 * 
 * if (isRecoverableError(error)) {
 *   // Mostrar botão de retry
 * } else {
 *   // Mostrar mensagem de erro fatal
 * }
 * ```
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Erros 5xx são geralmente recuperáveis
    return error.status >= 500 && error.status < 600;
  }
  
  if (error instanceof NetworkError) {
    // Erros de rede são geralmente recuperáveis
    return true;
  }
  
  if (error instanceof AuthError) {
    // Apenas token expirado é recuperável
    return error.code === 'TOKEN_EXPIRED';
  }
  
  if (error instanceof ValidationError) {
    // Erros de validação não são recuperáveis automaticamente
    return false;
  }
  
  // Por padrão, considerar recuperável
  return true;
}

/**
 * Utilitário para formatar mensagem de erro para o usuário
 * 
 * @example
 * ```typescript
 * import { formatErrorMessage } from '@/lib/errorSystem';
 * 
 * const userMessage = formatErrorMessage(error, 'operação');
 * toast.error(userMessage);
 * ```
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  const info = extractErrorInfo(error);
  
  // Usar mensagens pré-definidas quando possível
  if (info.type === 'api' && 'status' in info) {
    switch (info.status) {
      case 401:
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.AUTH.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.API.NOT_FOUND;
      case 429:
        return ERROR_MESSAGES.API.RATE_LIMIT;
      case 500:
        return ERROR_MESSAGES.API.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.API.NETWORK_ERROR;
    }
  }
  
  if (info.type === 'auth') {
    return ERROR_MESSAGES.AUTH[info.code as keyof typeof ERROR_MESSAGES.AUTH] || info.message;
  }
  
  if (info.type === 'validation') {
    return info.message;
  }
  
  if (info.type === 'network') {
    return ERROR_MESSAGES.API.NETWORK_ERROR;
  }
  
  // Fallback para contexto específico
  if (context) {
    return `Erro ao ${context}. Tente novamente.`;
  }
  
  return errorConfig.fallback.defaultMessage;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

/**
 * Export padrão com as funcionalidades mais usadas
 */
export default {
  // Hooks
  useErrorHandler,
  
  // Componentes
  ErrorBoundary,
  ErrorFallback,
  
  // Utilitários
  createError,
  extractErrorInfo,
  isRecoverableError,
  formatErrorMessage,
  createAsyncWrapper,
  createErrorBoundary,
  
  // Configuração
  config: errorConfig,
  messages: ERROR_MESSAGES,
};