/**
 * Input validation and sanitization utilities
 * Provides comprehensive security validation for user inputs
 */

// Padrões maliciosos conhecidos
const MALICIOUS_PATTERNS = {
  // SQL Injection patterns
  sql: [
    /('|(--)|(;)|(\|\|)|(\*|\*))/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    /script|javascript|vbscript/i
  ],
  
  // XSS patterns
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ],
  
  // Path Traversal patterns
  pathTraversal: [
    /(\.\.\/|\.\.\\\/)/g
  ],
  
  // Command Injection patterns
  commandInjection: [
    /[;|&`$(){}]/g
  ],
  
  // LDAP Injection patterns
  ldap: [
    /[()=*!&|]/g
  ]
};

// Padrões permitidos para diferentes tipos de entrada
const ALLOWED_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\d\s\-()+]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  numeric: /^[0-9]+$/,
  decimal: /^[0-9]+(\.[0-9]+)?$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-?\d{3}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

/**
 * Detecta padrões maliciosos em uma string
 */
export function detectMaliciousPatterns(input: string): {
  isMalicious: boolean;
  detectedPatterns: string[];
} {
  const detectedPatterns: string[] = [];
  
  // Verifica SQL Injection
  for (const pattern of MALICIOUS_PATTERNS.sql) {
    if (pattern.test(input)) {
      detectedPatterns.push('SQL Injection');
      break;
    }
  }
  
  // Verifica XSS
  for (const pattern of MALICIOUS_PATTERNS.xss) {
    if (pattern.test(input)) {
      detectedPatterns.push('XSS');
      break;
    }
  }
  
  // Verifica Path Traversal
  for (const pattern of MALICIOUS_PATTERNS.pathTraversal) {
    if (pattern.test(input)) {
      detectedPatterns.push('Path Traversal');
      break;
    }
  }
  
  // Verifica Command Injection
  for (const pattern of MALICIOUS_PATTERNS.commandInjection) {
    if (pattern.test(input)) {
      detectedPatterns.push('Command Injection');
      break;
    }
  }
  
  // Verifica LDAP Injection
  for (const pattern of MALICIOUS_PATTERNS.ldap) {
    if (pattern.test(input)) {
      detectedPatterns.push('LDAP Injection');
      break;
    }
  }
  
  return {
    isMalicious: detectedPatterns.length > 0,
    detectedPatterns
  };
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean;
    preserveSpaces?: boolean;
    maxLength?: number;
  } = {}
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Limita o comprimento se especificado
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  // Remove HTML se não permitido
  if (!options.allowHtml) {
    sanitized = sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<[^>]*>/g, '');
  }
  
  // Remove padrões perigosos
  sanitized = sanitized
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove caracteres SQL perigosos
    .replace(/['"\\;]/g, '')
    // Remove caracteres de path traversal
    .replace(/\.\.\/|\.\.\\\\/g, '')
    // Remove caracteres de command injection
    .replace(/[;|&`$(){}]/g, '');
  
  // Remove espaços extras se não preservar
  if (!options.preserveSpaces) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }
  
  return sanitized;
}

/**
 * Valida entrada baseada em tipo específico
 */
export function validateInput(
  input: string,
  type: keyof typeof ALLOWED_PATTERNS,
  options: {
    required?: boolean;
    customPattern?: RegExp;
    minLength?: number;
    maxLength?: number;
  } = {}
): {
  isValid: boolean;
  errors: string[];
  sanitized: string;
} {
  const errors: string[] = [];
  const sanitized = sanitizeInput(input, { maxLength: options.maxLength });
  
  // Verifica se é obrigatório
  if (options.required && !sanitized.trim()) {
    errors.push('Campo obrigatório');
  }
  
  // Verifica comprimento mínimo
  if (options.minLength && sanitized.length < options.minLength) {
    errors.push(`Mínimo de ${options.minLength} caracteres`);
  }
  
  // Verifica comprimento máximo
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Máximo de ${options.maxLength} caracteres`);
  }
  
  // Verifica padrão personalizado ou padrão do tipo
  const pattern = options.customPattern || ALLOWED_PATTERNS[type];
  if (sanitized && pattern && !pattern.test(sanitized)) {
    errors.push(`Formato inválido para ${type}`);
  }
  
  // Verifica padrões maliciosos
  const maliciousCheck = detectMaliciousPatterns(sanitized);
  if (maliciousCheck.isMalicious) {
    errors.push(`Conteúdo suspeito detectado: ${maliciousCheck.detectedPatterns.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validações específicas para tipos comuns
 */
export const validateEmail = (email: string, required = false) => 
  validateInput(email, 'email', { required });

export const validatePhone = (phone: string, required = false) => 
  validateInput(phone, 'phone', { required });

export const validateCPF = (cpf: string, required = false) => 
  validateInput(cpf, 'cpf', { required });

export const validateCNPJ = (cnpj: string, required = false) => 
  validateInput(cnpj, 'cnpj', { required });

export const validateCEP = (cep: string, required = false) => 
  validateInput(cep, 'cep', { required });

export const validatePassword = (password: string, required = true) => 
  validateInput(password, 'password', { required, minLength: 8 });

export const validateURL = (url: string, required = false) => 
  validateInput(url, 'url', { required });

export const validateNumeric = (value: string, required = false) => 
  validateInput(value, 'numeric', { required });

export const validateDecimal = (value: string, required = false) => 
  validateInput(value, 'decimal', { required });

export const validateAlphanumeric = (value: string, required = false, maxLength = 255) => 
  validateInput(value, 'alphanumeric', { required, maxLength });

/**
 * Valida dados de requisição completos
 */
export function validateRequestData(
  data: Record<string, unknown>,
  schema: Record<string, {
    type: keyof typeof ALLOWED_PATTERNS;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    customPattern?: RegExp;
  }>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, string>;
} {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, string> = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const validation = validateInput(value || '', rules.type, rules);
    
    if (!validation.isValid) {
      errors[field] = validation.errors;
    }
    
    sanitizedData[field] = validation.sanitized;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Tipos para TypeScript
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  sanitized: string;
};

export type MaliciousPatternResult = {
  isMalicious: boolean;
  detectedPatterns: string[];
};

export type RequestValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, string>;
};

export type InputType = keyof typeof ALLOWED_PATTERNS;

export type ValidationOptions = {
  required?: boolean;
  customPattern?: RegExp;
  minLength?: number;
  maxLength?: number;
};

export type SanitizationOptions = {
  allowHtml?: boolean;
  preserveSpaces?: boolean;
  maxLength?: number;
};