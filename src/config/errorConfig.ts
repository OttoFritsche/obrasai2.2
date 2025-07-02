/**
 * Configuração Global do Sistema de Tratamento de Erros
 * 
 * Este arquivo centraliza todas as configurações do sistema de tratamento
 * de erros do ObrasAI, permitindo customização fácil do comportamento.
 */

import type { ErrorSystemConfig} from '../types/error';
import { DEFAULT_ERROR_CONFIG } from '../types/error';

// ============================================================================
// CONFIGURAÇÃO DO AMBIENTE
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// ============================================================================
// CONFIGURAÇÃO PERSONALIZADA
// ============================================================================

/**
 * Configuração específica para o ObrasAI
 */
const OBRASAI_ERROR_CONFIG: ErrorSystemConfig = {
  logging: {
    level: isDevelopment ? 'debug' : 'error',
    includeStackTrace: isDevelopment,
    console: isDevelopment || isTest,
    endpoint: isProduction ? process.env.REACT_APP_ERROR_LOGGING_ENDPOINT : undefined,
  },
  
  toast: {
    duration: 6000, // 6 segundos para dar tempo de ler
    position: 'top-right',
    maxToasts: 3,
  },
  
  retry: {
    maxAttempts: 3,
    baseDelay: 1500, // 1.5 segundos
    backoffMultiplier: 2,
  },
  
  fallback: {
    defaultMessage: 'Ops! Algo deu errado. Nossa equipe foi notificada.',
    showDetailsInDev: isDevelopment,
    autoResetTimeout: 15000, // 15 segundos
  },
};

// ============================================================================
// MENSAGENS DE ERRO PERSONALIZADAS
// ============================================================================

/**
 * Mensagens de erro específicas por contexto
 */
export const ERROR_MESSAGES = {
  // Erros de autenticação
  AUTH: {
    UNAUTHORIZED: 'Você precisa fazer login para acessar esta funcionalidade.',
    FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
    TOKEN_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
    INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  },
  
  // Erros de API
  API: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente em alguns minutos.',
    NOT_FOUND: 'Recurso não encontrado.',
    BAD_REQUEST: 'Dados inválidos enviados.',
    TIMEOUT: 'A operação demorou muito para responder. Tente novamente.',
    RATE_LIMIT: 'Muitas tentativas. Aguarde um momento antes de tentar novamente.',
  },
  
  // Erros de validação
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    INVALID_EMAIL: 'Email inválido.',
    INVALID_PHONE: 'Telefone inválido.',
    INVALID_CPF: 'CPF inválido.',
    INVALID_CNPJ: 'CNPJ inválido.',
    INVALID_DATE: 'Data inválida.',
    INVALID_FILE_TYPE: 'Tipo de arquivo não suportado.',
    FILE_TOO_LARGE: 'Arquivo muito grande.',
    INVALID_FORMAT: 'Formato inválido.',
  },
  
  // Erros específicos do domínio
  OBRAS: {
    NOT_FOUND: 'Obra não encontrada.',
    ACCESS_DENIED: 'Você não tem acesso a esta obra.',
    ALREADY_EXISTS: 'Já existe uma obra com este nome.',
    CANNOT_DELETE: 'Não é possível excluir esta obra.',
  },
  
  NOTAS: {
    UPLOAD_FAILED: 'Falha no upload da nota fiscal.',
    INVALID_XML: 'Arquivo XML da nota fiscal inválido.',
    DUPLICATE_NOTE: 'Esta nota fiscal já foi cadastrada.',
    PROCESSING_ERROR: 'Erro ao processar a nota fiscal.',
  },
  
  FORNECEDORES: {
    NOT_FOUND: 'Fornecedor não encontrado.',
    DUPLICATE_DOCUMENT: 'Já existe um fornecedor com este documento.',
    INVALID_DATA: 'Dados do fornecedor inválidos.',
  },
  
  USUARIOS: {
    NOT_FOUND: 'Usuário não encontrado.',
    EMAIL_IN_USE: 'Este email já está em uso.',
    WEAK_PASSWORD: 'Senha muito fraca.',
    CANNOT_DELETE_SELF: 'Você não pode excluir sua própria conta.',
  },
  
  // Erros de arquivo
  FILE: {
    UPLOAD_FAILED: 'Falha no upload do arquivo.',
    INVALID_TYPE: 'Tipo de arquivo não suportado.',
    TOO_LARGE: 'Arquivo muito grande.',
    CORRUPTED: 'Arquivo corrompido.',
    NOT_FOUND: 'Arquivo não encontrado.',
  },
  
  // Erros gerais
  GENERAL: {
    UNKNOWN_ERROR: 'Erro desconhecido.',
    OPERATION_FAILED: 'Operação falhou.',
    TIMEOUT: 'Operação expirou.',
    CANCELLED: 'Operação cancelada.',
    MAINTENANCE: 'Sistema em manutenção. Tente novamente mais tarde.',
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DE RETRY POR TIPO DE ERRO
// ============================================================================

/**
 * Configurações específicas de retry por status HTTP
 */
export const RETRY_CONFIG = {
  // Erros que devem ter retry automático
  RETRYABLE_STATUS: [408, 429, 500, 502, 503, 504],
  
  // Erros que nunca devem ter retry
  NON_RETRYABLE_STATUS: [400, 401, 403, 404, 422],
  
  // Configurações específicas por status
  STATUS_CONFIG: {
    429: { // Rate limit
      maxAttempts: 5,
      baseDelay: 2000,
      backoffMultiplier: 2,
    },
    500: { // Server error
      maxAttempts: 3,
      baseDelay: 1000,
      backoffMultiplier: 1.5,
    },
    502: { // Bad gateway
      maxAttempts: 2,
      baseDelay: 2000,
      backoffMultiplier: 2,
    },
    503: { // Service unavailable
      maxAttempts: 4,
      baseDelay: 3000,
      backoffMultiplier: 1.8,
    },
    504: { // Gateway timeout
      maxAttempts: 2,
      baseDelay: 5000,
      backoffMultiplier: 2,
    },
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DE LOGGING
// ============================================================================

/**
 * Configurações específicas de logging por contexto
 */
export const LOGGING_CONFIG = {
  // Contextos que devem ter logging detalhado
  DETAILED_CONTEXTS: [
    'auth',
    'payment',
    'file-upload',
    'data-export',
    'user-management',
  ],
  
  // Contextos que devem ter logging mínimo
  MINIMAL_CONTEXTS: [
    'ui-interaction',
    'navigation',
    'form-validation',
  ],
  
  // Dados sensíveis que nunca devem ser logados
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'cpf',
    'cnpj',
    'phone',
    'email', // Em alguns contextos
  ],
  
  // Configurações por ambiente
  ENVIRONMENT_CONFIG: {
    development: {
      includeUserData: true,
      includeRequestData: true,
      includeStackTrace: true,
      logToConsole: true,
    },
    production: {
      includeUserData: false,
      includeRequestData: false,
      includeStackTrace: false,
      logToConsole: false,
    },
    test: {
      includeUserData: false,
      includeRequestData: false,
      includeStackTrace: true,
      logToConsole: false,
    },
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DE NOTIFICAÇÃO
// ============================================================================

/**
 * Configurações para notificações de erro
 */
export const NOTIFICATION_CONFIG = {
  // Erros que devem notificar administradores imediatamente
  CRITICAL_ERRORS: [
    'database-connection',
    'payment-processing',
    'security-breach',
    'data-corruption',
    'system-crash',
  ],
  
  // Canais de notificação por prioridade
  NOTIFICATION_CHANNELS: {
    critical: ['email', 'slack', 'sms'],
    high: ['email', 'slack'],
    medium: ['email'],
    low: ['log-only'],
  },
  
  // Configurações de throttling para evitar spam
  THROTTLING: {
    // Máximo de notificações por tipo de erro por hora
    maxPerHour: {
      critical: 10,
      high: 20,
      medium: 50,
      low: 100,
    },
    
    // Tempo mínimo entre notificações do mesmo erro (ms)
    minInterval: {
      critical: 5 * 60 * 1000,  // 5 minutos
      high: 15 * 60 * 1000,     // 15 minutos
      medium: 30 * 60 * 1000,   // 30 minutos
      low: 60 * 60 * 1000,      // 1 hora
    },
  },
} as const;

// ============================================================================
// CONFIGURAÇÃO FINAL
// ============================================================================

/**
 * Configuração final mesclada com valores padrão
 */
export const errorConfig: ErrorSystemConfig = {
  ...DEFAULT_ERROR_CONFIG,
  ...OBRASAI_ERROR_CONFIG,
};

// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================

/**
 * Verifica se um status HTTP é retryable
 */
export function isRetryableStatus(status: number): boolean {
  return RETRY_CONFIG.RETRYABLE_STATUS.includes(status);
}

/**
 * Verifica se um status HTTP não deve ter retry
 */
export function isNonRetryableStatus(status: number): boolean {
  return RETRY_CONFIG.NON_RETRYABLE_STATUS.includes(status);
}

/**
 * Obtém configuração de retry para um status específico
 */
export function getRetryConfigForStatus(status: number) {
  return RETRY_CONFIG.STATUS_CONFIG[status as keyof typeof RETRY_CONFIG.STATUS_CONFIG] || {
    maxAttempts: errorConfig.retry.maxAttempts,
    baseDelay: errorConfig.retry.baseDelay,
    backoffMultiplier: errorConfig.retry.backoffMultiplier,
  };
}

/**
 * Verifica se um contexto deve ter logging detalhado
 */
export function shouldUseDetailedLogging(context: string): boolean {
  return LOGGING_CONFIG.DETAILED_CONTEXTS.some(ctx => 
    context.toLowerCase().includes(ctx)
  );
}

/**
 * Verifica se um campo é sensível e não deve ser logado
 */
export function isSensitiveField(fieldName: string): boolean {
  return LOGGING_CONFIG.SENSITIVE_FIELDS.some(field => 
    fieldName.toLowerCase().includes(field)
  );
}

/**
 * Remove campos sensíveis de um objeto
 */
export function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (isSensitiveField(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Verifica se um erro é crítico e deve notificar administradores
 */
export function isCriticalError(context: string): boolean {
  return NOTIFICATION_CONFIG.CRITICAL_ERRORS.some(critical => 
    context.toLowerCase().includes(critical)
  );
}

/**
 * Obtém configuração de logging para o ambiente atual
 */
export function getCurrentLoggingConfig() {
  const env = process.env.NODE_ENV as keyof typeof LOGGING_CONFIG.ENVIRONMENT_CONFIG;
  return LOGGING_CONFIG.ENVIRONMENT_CONFIG[env] || LOGGING_CONFIG.ENVIRONMENT_CONFIG.development;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  OBRASAI_ERROR_CONFIG,
  ERROR_MESSAGES,
  RETRY_CONFIG,
  LOGGING_CONFIG,
  NOTIFICATION_CONFIG,
};

export default errorConfig;