/**
 * Módulo de tratamento de erros do ObrasAI
 * 
 * Este módulo fornece componentes e hooks para tratamento centralizado de erros,
 * incluindo Error Boundaries, componentes de fallback e hooks para captura de erros.
 */

// Componentes principais
export { default as ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorFallbackProps } from './ErrorFallback';
export { ErrorFallback, SimpleErrorFallback } from './ErrorFallback';

// Hooks (re-exportando do módulo de hooks)
export type { ErrorInfo } from '../../hooks/useErrorHandler';
export { useErrorBoundary,useErrorHandler } from '../../hooks/useErrorHandler';

// Hook deprecated (mantido para compatibilidade)
export { useErrorHandler as useErrorHandlerDeprecated } from './ErrorBoundary';