import DOMPurify from 'dompurify';

/**
 * Sistema de sanitização de inputs
 * Previne XSS, SQL Injection e outros ataques
 */

/**
 * Configuração do DOMPurify para diferentes contextos
 */
const createDOMPurifyConfig = (strict: boolean = false) => ({
  ALLOWED_TAGS: strict 
    ? [] // Nenhuma tag HTML permitida
    : ['b', 'i', 'em', 'strong', 'p', 'br'], // Tags básicas permitidas
  ALLOWED_ATTR: strict 
    ? [] // Nenhum atributo permitido
    : ['class'], // Apenas class permitida
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  SANITIZE_DOM: true,
});

/**
 * Sanitiza texto simples (sem HTML)
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, createDOMPurifyConfig(true))
    .trim()
    .slice(0, 10000); // Limite de tamanho
};

/**
 * Sanitiza HTML básico (mantém formatação simples)
 */
export const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, createDOMPurifyConfig(false))
    .trim()
    .slice(0, 50000); // Limite maior para HTML
};

/**
 * Sanitiza URLs
 */
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const parsedURL = new URL(url);
    
    // Permitir apenas protocolos seguros
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      return '';
    }
    
    return parsedURL.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitiza e-mails
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const sanitized = sanitizeText(email.toLowerCase());
  
  // Validação básica de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitiza números (remove caracteres não numéricos)
 */
export const sanitizeNumber = (input: string | number): number | null => {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return null;
  
  const cleaned = input.replace(/[^\d.,-]/g, '');
  const number = parseFloat(cleaned.replace(',', '.'));
  
  return isNaN(number) ? null : number;
};

/**
 * Sanitiza CPF/CNPJ (remove formatação)
 */
export const sanitizeDocument = (doc: string): string => {
  if (!doc || typeof doc !== 'string') return '';
  
  return doc.replace(/[^\d]/g, '');
};

/**
 * Sanitiza telefone (remove formatação)
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitiza CEP
 */
export const sanitizeCEP = (cep: string): string => {
  if (!cep || typeof cep !== 'string') return '';
  
  const cleaned = cep.replace(/[^\d]/g, '');
  return cleaned.length === 8 ? cleaned : '';
};

/**
 * Sanitização específica para formulários
 */
export const sanitizeFormData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = {} as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Diferentes tipos de sanitização baseados no nome do campo
      if (key.includes('email')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizeEmail(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else if (key.includes('url') || key.includes('link')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizeURL(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else if (key.includes('cpf') || key.includes('cnpj') || key.includes('documento')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizeDocument(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else if (key.includes('telefone') || key.includes('phone')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizePhone(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else if (key.includes('cep')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizeCEP(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else if (key.includes('descricao') || key.includes('observacao') || key.includes('html')) {
        sanitized[key as keyof Record<string, unknown>] = sanitizeHTML(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      } else {
        sanitized[key as keyof Record<string, unknown>] = sanitizeText(value as string) as Record<string, unknown>[keyof Record<string, unknown>];
      }
    } else if (typeof value === 'number') {
      sanitized[key as keyof Record<string, unknown>] = value;
    } else if (value instanceof Date) {
      // Preservar objetos Date sem alterar
      sanitized[key as keyof Record<string, unknown>] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Recursão para objetos aninhados (mas não Date)
      sanitized[key as keyof Record<string, unknown>] = sanitizeFormData(value as Record<string, unknown>) as Record<string, unknown>[keyof Record<string, unknown>];
    } else {
      sanitized[key as keyof Record<string, unknown>] = value;
    }
  }
  
  return sanitized;
};

/**
 * Sanitiza parâmetros de query string
 */
export const sanitizeQueryParams = (params: URLSearchParams): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    sanitized[sanitizeText(key)] = sanitizeText(value);
  }
  
  return sanitized;
};

/**
 * Validação adicional para SQL injection
 */
export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/)/,
    /(\b(EXEC|EXECUTE|SP_|XP_)\b)/i,
    /(\bSCRIPT\b)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Patterns maliciosos mais específicos que devem ser removidos
const maliciousPatterns = [
  /<script[\s\S]*?<\/script>/gi,  // Scripts completos
  /javascript:/gi,                 // Protocolo javascript
  /vbscript:/gi,                  // Protocolo vbscript
  /on\w+\s*=/gi,                  // Event handlers (onclick, onload, etc)
  /data:text\/html/gi,            // Data URLs HTML
  /data:application\/x-javascript/gi, // Data URLs JavaScript
  /expression\s*\(/gi,            // CSS expressions
  /import\s+/gi,                  // ES6 imports
  /require\s*\(/gi,               // Node.js require
  /eval\s*\(/gi,                  // Função eval
  /function\s*\(/gi,              // Declarações de função
  /\{\s*\[/gi,                    // Início de template literals suspeitos
  /\$\{.*\}/gi,                   // Template literals
  /<!--[\s\S]*?-->/gi,            // Comentários HTML
  /<!\[CDATA\[[\s\S]*?\]\]>/gi,   // Seções CDATA
  /&\w+;/gi,                      // Entities HTML básicas (pode ser muito restritivo)
  /&#x?\d+;/gi,                   // Entities numéricas
  /[<>'"&]/g,                     // Caracteres HTML básicos
  /\r?\n|\r/gi,                   // Quebras de linha
  /\t/gi,                         // Tabs
  /\0/gi,                         // Null bytes
  /[\u2000-\u206f]/gi,            // Espaços especiais Unicode
  /[\u2070-\u209f]/gi,            // Sobrescritos e subscritos
  /[\ufff0-\uffff]/gi,            // Caracteres especiais Unicode
]; 