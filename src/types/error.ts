/**
 * Tipos TypeScript para o Sistema de Tratamento de Erros
 * 
 * Este arquivo define todas as interfaces e tipos utilizados
 * pelo sistema de tratamento de erros do ObrasAI.
 */

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

/**
 * Tipos de erro suportados pelo sistema
 */
export type ErrorType = 
  | 'generic'     // Erro genérico
  | 'api'         // Erro de API/rede
  | 'validation'  // Erro de validação
  | 'auth'        // Erro de autenticação/autorização
  | 'critical';   // Erro crítico do sistema

/**
 * Níveis de log para diferentes tipos de erro
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Status HTTP comuns para tratamento de erros de API
 */
export type HttpStatus = 
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504; // Gateway Timeout

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

/**
 * Informações estruturadas sobre um erro
 */
export interface ErrorInfo {
  /** Mensagem do erro */
  message: string;
  
  /** Contexto onde o erro ocorreu */
  context: string;
  
  /** Tipo do erro */
  type: ErrorType;
  
  /** Stack trace (apenas em desenvolvimento) */
  stack?: string;
  
  /** Timestamp do erro */
  timestamp: string;
  
  /** ID do usuário (se disponível) */
  userId?: string;
  
  /** ID da sessão */
  sessionId?: string;
  
  /** User agent do browser */
  userAgent?: string;
  
  /** URL onde o erro ocorreu */
  url?: string;
  
  /** Status HTTP (para erros de API) */
  httpStatus?: HttpStatus;
  
  /** Dados adicionais seguros */
  additionalData?: Record<string, any>;
  
  /** Se o erro é recuperável */
  recoverable?: boolean;
  
  /** Número de tentativas (para retry) */
  retryCount?: number;
}

/**
 * Opções para tratamento de erro genérico
 */
export interface ErrorHandlerOptions {
  /** Contexto da operação */
  context: string;
  
  /** Tipo do erro */
  type?: ErrorType;
  
  /** Se deve exibir toast */
  showToast?: boolean;
  
  /** Nível de log */
  logLevel?: LogLevel;
  
  /** Dados adicionais para logging */
  additionalData?: Record<string, any>;
  
  /** Se o erro é recuperável */
  recoverable?: boolean;
}

/**
 * Opções específicas para erros de API
 */
export interface ApiErrorHandlerOptions {
  /** Contexto da operação */
  context: string;
  
  /** Mensagem alternativa para exibir ao usuário */
  fallbackMessage?: string;
  
  /** Se o erro permite retry */
  retryable?: boolean;
  
  /** Tipo específico do erro */
  type?: ErrorType;
  
  /** Se deve exibir toast */
  showToast?: boolean;
  
  /** Dados adicionais para logging */
  additionalData?: Record<string, any>;
}

/**
 * Opções para wrapper de funções assíncronas
 */
export interface AsyncWrapperOptions {
  /** Contexto da operação */
  context: string;
  
  /** Mensagem alternativa em caso de erro */
  fallbackMessage?: string;
  
  /** Se deve exibir toast em caso de erro */
  showToast?: boolean;
  
  /** Tipo do erro esperado */
  type?: ErrorType;
  
  /** Se deve fazer retry automático */
  autoRetry?: boolean;
  
  /** Número máximo de tentativas */
  maxRetries?: number;
  
  /** Delay entre tentativas (ms) */
  retryDelay?: number;
}

/**
 * Opções para reportar erros críticos
 */
export interface CriticalErrorOptions {
  /** Contexto da operação */
  context: string;
  
  /** Dados adicionais importantes */
  additionalData?: Record<string, any>;
  
  /** Se deve notificar administradores */
  notifyAdmins?: boolean;
  
  /** Prioridade do erro */
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// INTERFACES DE COMPONENTES
// ============================================================================

/**
 * Props para o componente ErrorBoundary
 */
export interface ErrorBoundaryProps {
  /** Componentes filhos */
  children: React.ReactNode;
  
  /** Função de fallback customizada */
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
  
  /** Callback quando erro é capturado */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** Se deve fazer reset automático após tempo */
  autoReset?: boolean;
  
  /** Tempo para reset automático (ms) */
  resetTimeout?: number;
}

/**
 * Props para o componente ErrorFallback
 */
export interface ErrorFallbackProps {
  /** Erro capturado */
  error: Error;
  
  /** Função para tentar novamente */
  retry: () => void;
  
  /** Se deve exibir detalhes técnicos */
  showDetails?: boolean;
  
  /** Título customizado */
  title?: string;
  
  /** Mensagem customizada */
  message?: string;
  
  /** Ações customizadas */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  }>;
}

/**
 * Props para o SimpleErrorFallback
 */
export interface SimpleErrorFallbackProps {
  /** Mensagem de erro */
  message: string;
  
  /** Função para tentar novamente */
  retry?: () => void;
  
  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// INTERFACES DE HOOKS
// ============================================================================

/**
 * Retorno do hook useErrorHandler
 */
export interface UseErrorHandlerReturn {
  /** Tratar erro genérico */
  handleError: (error: unknown, options: ErrorHandlerOptions) => void;
  
  /** Tratar erro de API */
  handleApiError: (error: unknown, options: ApiErrorHandlerOptions) => void;
  
  /** Tratar erro de validação */
  handleValidationError: (error: unknown, context: string) => void;
  
  /** Tratar erro de autenticação */
  handleAuthError: (error: unknown, context: string) => void;
  
  /** Wrapper para funções assíncronas */
  wrapAsync: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: AsyncWrapperOptions
  ) => T;
  
  /** Reportar erro crítico */
  reportCriticalError: (error: unknown, options: CriticalErrorOptions) => void;
}

/**
 * Retorno do hook useErrorBoundary
 */
export interface UseErrorBoundaryReturn {
  /** Capturar erro manualmente */
  captureError: (error: Error) => void;
  
  /** Reset do boundary */
  resetBoundary: () => void;
}

// ============================================================================
// TIPOS DE ERRO ESPECÍFICOS
// ============================================================================

/**
 * Erro de API com informações estruturadas
 */
export class ApiError extends Error {
  public readonly status: HttpStatus;
  public readonly code?: string;
  public readonly details?: Record<string, any>;
  
  constructor(
    message: string,
    status: HttpStatus,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Erro de validação com campo específico
 */
export class ValidationError extends Error {
  public readonly field?: string;
  public readonly value?: any;
  public readonly rule?: string;
  
  constructor(
    message: string,
    field?: string,
    value?: any,
    rule?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
  }
}

/**
 * Erro de autenticação/autorização
 */
export class AuthError extends Error {
  public readonly code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS';
  public readonly redirectTo?: string;
  
  constructor(
    message: string,
    code: AuthError['code'],
    redirectTo?: string
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.redirectTo = redirectTo;
  }
}

/**
 * Erro de rede/conectividade
 */
export class NetworkError extends Error {
  public readonly timeout: boolean;
  public readonly offline: boolean;
  
  constructor(
    message: string,
    timeout: boolean = false,
    offline: boolean = false
  ) {
    super(message);
    this.name = 'NetworkError';
    this.timeout = timeout;
    this.offline = offline;
  }
}

// ============================================================================
// UTILITÁRIOS DE TIPO
// ============================================================================

/**
 * Type guard para verificar se é um erro de API
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || 
         (error instanceof Error && error.name === 'ApiError');
}

/**
 * Type guard para verificar se é um erro de validação
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError || 
         (error instanceof Error && error.name === 'ValidationError');
}

/**
 * Type guard para verificar se é um erro de autenticação
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError || 
         (error instanceof Error && error.name === 'AuthError');
}

/**
 * Type guard para verificar se é um erro de rede
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError || 
         (error instanceof Error && error.name === 'NetworkError');
}

/**
 * Type guard genérico para verificar se é um Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

/**
 * Configuração global do sistema de tratamento de erros
 */
export interface ErrorSystemConfig {
  /** Configurações de logging */
  logging: {
    /** Nível mínimo de log */
    level: LogLevel;
    
    /** Se deve incluir stack trace */
    includeStackTrace: boolean;
    
    /** Se deve logar em console (desenvolvimento) */
    console: boolean;
    
    /** Endpoint para envio de logs (produção) */
    endpoint?: string;
  };
  
  /** Configurações de toast */
  toast: {
    /** Duração padrão dos toasts (ms) */
    duration: number;
    
    /** Posição dos toasts */
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    
    /** Máximo de toasts simultâneos */
    maxToasts: number;
  };
  
  /** Configurações de retry */
  retry: {
    /** Número máximo de tentativas padrão */
    maxAttempts: number;
    
    /** Delay base entre tentativas (ms) */
    baseDelay: number;
    
    /** Multiplicador para backoff exponencial */
    backoffMultiplier: number;
  };
  
  /** Configurações de fallback */
  fallback: {
    /** Mensagem padrão para erros */
    defaultMessage: string;
    
    /** Se deve exibir detalhes em desenvolvimento */
    showDetailsInDev: boolean;
    
    /** Timeout para reset automático (ms) */
    autoResetTimeout: number;
  };
}

/**
 * Configuração padrão do sistema
 */
export const DEFAULT_ERROR_CONFIG: ErrorSystemConfig = {
  logging: {
    level: 'error',
    includeStackTrace: process.env.NODE_ENV === 'development',
    console: process.env.NODE_ENV === 'development',
  },
  toast: {
    duration: 5000,
    position: 'top-right',
    maxToasts: 3,
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffMultiplier: 2,
  },
  fallback: {
    defaultMessage: 'Algo deu errado. Tente novamente.',
    showDetailsInDev: true,
    autoResetTimeout: 10000,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export type {
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
};

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
};