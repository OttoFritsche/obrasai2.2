/**
 * 🔐 Configurações de Cabeçalhos de Segurança
 *
 * Define políticas de segurança para Content Security Policy (CSP),
 * headers de segurança e outras configurações de proteção para Edge Functions.
 *
 * @author ObrasAI Team
 * @version 1.0.0
 */

// Domínios confiáveis para diferentes tipos de recursos
const TRUSTED_DOMAINS = {
    // APIs e serviços
    api: [
        "https://api.deepseek.com",
        "https://api.openai.com",
        "https://api.stripe.com",
        "https://*.supabase.co",
        "https://*.supabase.com",
    ],

    // Imagens
    images: [
        "data:",
        "blob:",
        "https://*.supabase.co",
        "https://*.supabase.com",
    ],

    // WebSockets
    websockets: [
        "wss://*.supabase.co",
        "wss://*.supabase.com",
    ],
};

// Gera Content Security Policy baseado no ambiente
function generateCSP(isDevelopment = false): string {
    const policies = {
        "default-src": ["'self'"],
        "script-src": ["'self'"], // Edge functions não devem servir scripts
        "style-src": ["'self'"], // Edge functions não devem servir estilos
        "img-src": ["'self'", ...TRUSTED_DOMAINS.images],
        "font-src": ["'self'"],
        "connect-src": [
            "'self'",
            ...TRUSTED_DOMAINS.api,
            ...TRUSTED_DOMAINS.websockets,
        ],
        "frame-src": ["'none'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "upgrade-insecure-requests": [],
        "block-all-mixed-content": [],
    };

    return Object.entries(policies)
        .map(([directive, sources]) => {
            if (sources.length === 0) return directive;
            return `${directive} ${sources.join(" ")}`;
        })
        .join("; ");
}

// Headers de segurança padrão
const SECURITY_HEADERS = {
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Aplica headers de segurança a uma resposta
 */
export function applySecurityHeaders(
    headers: Record<string, string>,
    isDevelopment = false,
): Record<string, string> {
    const securityHeaders = { ...headers };

    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        if (key === "Strict-Transport-Security" && isDevelopment) return;
        securityHeaders[key] = value;
    });

    securityHeaders["Content-Security-Policy"] = generateCSP(isDevelopment);

    return securityHeaders;
}
