/**
 * Sistema de logging seguro
 * Evita exposição de dados sensíveis em logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

/**
 * Lista de campos sensíveis que devem ser removidos dos logs
 */
const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'key', 'auth', 'authorization',
  'access_token', 'refresh_token', 'jwt', 'session', 'cookie',
  'cpf', 'cnpj', 'email', 'phone', 'telefone', 'endereco'
];

/**
 * Remove ou mascara dados sensíveis de um objeto
 */
const sanitizeData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    
    // Verificar se é um campo sensível
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field)
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Extrai apenas informações seguras de erros
 */
const sanitizeError = (error: Error | unknown): Record<string, unknown> | null => {
  if (!error) return null;
  
  const err = error as Error & { code?: string; status?: number; statusCode?: number };
  
  return {
    name: err.name,
    code: err.code,
    status: err.status,
    statusCode: err.statusCode,
    // NÃO incluir message completa que pode ter dados sensíveis
    hasMessage: !!err.message,
    stack: import.meta.env.DEV ? err.stack : '[HIDDEN]'
  };
};

/**
 * Logger seguro
 */
export const secureLogger = {
  info: (message: string, context?: unknown, userId?: string) => {
    log('info', message, context, userId);
  },
  
  warn: (message: string, context?: unknown, userId?: string) => {
    log('warn', message, context, userId);
  },
  
  error: (message: string, error?: Error | unknown, context?: unknown, userId?: string) => {
    const sanitizedError = sanitizeError(error);
    const fullContext = { 
      ...sanitizeData(context) as Record<string, unknown>, 
      error: sanitizedError 
    };
    log('error', message, fullContext, userId);
  },
  
  debug: (message: string, context?: unknown, userId?: string) => {
    if (import.meta.env.DEV) {
      log('debug', message, context, userId);
    }
  },
};

/**
 * Função interna de log
 */
const log = (level: LogLevel, message: string, context?: unknown, userId?: string) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: sanitizeData(context) as Record<string, unknown>,
    userId,
    sessionId: generateSessionId(),
  };
  
  // Em desenvolvimento, mostrar logs detalhados
  if (import.meta.env.DEV) {
    console[level === 'debug' ? 'log' : level](
      `[${logEntry.level.toUpperCase()}] ${logEntry.message}`,
      logEntry.context || ''
    );
  } else {
    // Em produção, logs mais limpos
    console[level === 'debug' ? 'log' : level](
      `[${logEntry.level.toUpperCase()}] ${logEntry.message}`,
      {
        timestamp: logEntry.timestamp,
        userId: logEntry.userId,
        sessionId: logEntry.sessionId,
        ...(logEntry.context && Object.keys(logEntry.context).length > 0 && { context: logEntry.context })
      }
    );
  }
  
  // Aqui você pode enviar logs para um serviço externo se necessário
  // sendToLogService(logEntry);
};

/**
 * Gera um ID de sessão simples para rastreamento
 */
let sessionId: string;
const generateSessionId = (): string => {
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9);
  }
  return sessionId;
};

/**
 * Alias para compatibilidade com console.log existente
 */
export const logger = secureLogger; 