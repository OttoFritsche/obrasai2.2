/**
 * 🔐 Configurações de Cabeçalhos de Segurança
 * 
 * Define políticas de segurança para Content Security Policy (CSP),
 * headers de segurança e outras configurações de proteção.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

// Domínios confiáveis para diferentes tipos de recursos
const TRUSTED_DOMAINS = {
  // APIs e serviços
  api: [
    'https://api.deepseek.com',
    'https://api.openai.com',
    'https://api.stripe.com',
    'https://*.supabase.co',
    'https://*.supabase.com'
  ],
  
  // CDNs e recursos estáticos
  cdn: [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  
  // Imagens
  images: [
    'data:',
    'blob:',
    'https://*.supabase.co',
    'https://*.supabase.com',
    'https://images.unsplash.com',
    'https://via.placeholder.com'
  ],
  
  // WebSockets
  websockets: [
    'wss://*.supabase.co',
    'wss://*.supabase.com'
  ]
};

/**
 * Gera Content Security Policy baseado no ambiente
 */
export function generateCSP(isDevelopment = false): string {
  const policies = {
    'default-src': ["'self'"],
    
    'script-src': [
      "'self'",
      isDevelopment ? "'unsafe-eval'" : null, // Apenas para desenvolvimento (Vite HMR)
      "'unsafe-inline'", // Para scripts inline necessários
      ...TRUSTED_DOMAINS.cdn
    ].filter(Boolean),
    
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Para estilos CSS-in-JS e bibliotecas de componentes
      ...TRUSTED_DOMAINS.cdn
    ],
    
    'img-src': [
      "'self'",
      ...TRUSTED_DOMAINS.images
    ],
    
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    
    'connect-src': [
      "'self'",
      isDevelopment ? 'ws://localhost:*' : null, // WebSocket para HMR
      isDevelopment ? 'http://localhost:*' : null, // APIs locais
      ...TRUSTED_DOMAINS.api,
      ...TRUSTED_DOMAINS.websockets
    ].filter(Boolean),
    
    'frame-src': ["'none'"], // Bloquear iframes
    'object-src': ["'none'"], // Bloquear plugins
    'base-uri': ["'self'"], // Restringir base URI
    'form-action': ["'self'"], // Restringir envio de formulários
    
    'upgrade-insecure-requests': [], // Forçar HTTPS
    'block-all-mixed-content': [] // Bloquear conteúdo misto
  };

  return Object.entries(policies)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Headers de segurança padrão
 */
export const SECURITY_HEADERS = {
  // Prevenir XSS
  'X-XSS-Protection': '1; mode=block',
  
  // Prevenir MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Política de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Forçar HTTPS (apenas em produção)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevenir download de arquivos executáveis
  'X-Download-Options': 'noopen',
  
  // Controlar recursos permitidos
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', ')
};

/**
 * Aplica headers de segurança a uma resposta
 */
export function applySecurityHeaders(
  headers: Record<string, string>,
  options: {
    isDevelopment?: boolean;
    includeCSP?: boolean;
    customCSP?: string;
  } = {}
): Record<string, string> {
  const { isDevelopment = false, includeCSP = true, customCSP } = options;
  
  const securityHeaders = { ...headers };
  
  // Aplicar headers básicos de segurança
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Não aplicar HSTS em desenvolvimento
    if (key === 'Strict-Transport-Security' && isDevelopment) {
      return;
    }
    securityHeaders[key] = value;
  });
  
  // Aplicar CSP se solicitado
  if (includeCSP) {
    const csp = customCSP || generateCSP(isDevelopment);
    securityHeaders['Content-Security-Policy'] = csp;
  }
  
  return securityHeaders;
}

/**
 * Valida se uma URL é de origem confiável
 */
export function isTrustedOrigin(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const origin = urlObj.origin;
    
    // Verificar se é localhost (desenvolvimento)
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return true;
    }
    
    // Verificar domínios confiáveis
    const allTrustedDomains = [
      ...TRUSTED_DOMAINS.api,
      ...TRUSTED_DOMAINS.cdn,
      ...TRUSTED_DOMAINS.websockets
    ];
    
    return allTrustedDomains.some(domain => {
      // Suporte a wildcards
      if (domain.includes('*')) {
        const pattern = domain.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return origin === domain || origin.startsWith(domain);
    });
  } catch {
    return false;
  }
}

/**
 * Sanitiza valores para uso em headers HTTP
 */
export function sanitizeHeaderValue(value: string): string {
  // Remove caracteres de controle e quebras de linha
  return value.replace(/[\r\n\x00-\x1f\x7f-\x9f]/g, '').trim();
}

/**
 * Gera nonce para CSP (Content Security Policy)
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}