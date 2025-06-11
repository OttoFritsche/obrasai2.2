// Copiado de supabase/functions/_shared/cors.ts

// Domínios permitidos para produção e desenvolvimento
const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "https://obrasai.com",
    "https://www.obrasai.com",
    "https://app.obrasai.com",
];

export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin);
}

export function getSecureCorsHeaders(
    origin: string | null,
): Record<string, string> {
    const allowedOrigin = isOriginAllowed(origin) ? origin! : "null";

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, x-csrf-token",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
    };
}

export function getPreflightHeaders(
    origin: string | null,
): Record<string, string> {
    return {
        ...getSecureCorsHeaders(origin),
        "Access-Control-Max-Age": "86400",
    };
}
