// Configuração CORS segura centralizada para todas as Edge Functions

// Domínios permitidos para produção e desenvolvimento
const ALLOWED_ORIGINS = [
  // Desenvolvimento local
  'http://localhost:3000',
  'http://localhost:8080', 
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
  // Produção - substitua pelos seus domínios reais
  'https://obrasai.com',
  'https://www.obrasai.com',
  'https://app.obrasai.com'
];

/**
 * Valida se a origem da requisição é permitida
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Gera headers CORS seguros baseados na origem da requisição
 */
export function getSecureCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : 'null';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  };
}

/**
 * Headers CORS para requisições OPTIONS (preflight)
 */
export function getPreflightHeaders(origin: string | null): Record<string, string> {
  return {
    ...getSecureCorsHeaders(origin),
    'Access-Control-Max-Age': '86400' // Cache preflight por 24 horas
  };
}

/**
 * Valida token CSRF robusto
 */
export function validateCSRFToken(token: string | null, origin: string | null): boolean {
  // Rejeitar se não há token nem origem
  if (!token && !origin) return false;
  
  // Verificar se a origem é permitida
  if (!isOriginAllowed(origin)) return false;
  
  // Token deve ter pelo menos 32 caracteres para ser considerado seguro
  if (!token || token.length < 32) {
    // Em desenvolvimento, ser mais flexível apenas para localhost
    const isDevelopment = origin?.includes('localhost') || origin?.includes('127.0.0.1');
    return isDevelopment && token && token.length > 0;
  }
  
  return true;
}

/**
 * Rate limiting simples por IP/origem
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Limpa registros antigos do rate limiting
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}