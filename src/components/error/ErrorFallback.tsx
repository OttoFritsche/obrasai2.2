import { AlertTriangle, Bug,Home, RefreshCw } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { secureLogger } from '@/lib/secure-logger';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  errorInfo?: {
    componentStack: string;
  };
}

/**
 * Componente de fallback para exibir quando ocorrem erros na aplicação
 * Fornece opções para o usuário tentar recuperar da situação de erro
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  errorInfo 
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleReportError = () => {
    // Log detalhado do erro para análise
    secureLogger.error('User reported error from ErrorFallback', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userReported: true
    });

    // Feedback visual para o usuário
    alert('Erro reportado com sucesso! Nossa equipe analisará o problema.');
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Oops! Algo deu errado
          </CardTitle>
          <CardDescription className="text-gray-600">
            Encontramos um problema inesperado. Não se preocupe, você pode tentar algumas opções abaixo.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Botões de ação */}
          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </Button>
            
            <Button 
              onClick={handleReportError} 
              className="w-full"
              variant="ghost"
              size="sm"
            >
              <Bug className="w-4 h-4 mr-2" />
              Reportar Problema
            </Button>
          </div>

          {/* Informações técnicas (apenas em desenvolvimento) */}
          {isDevelopment && error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Detalhes do Erro (Dev Mode):</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Stack Trace</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  {errorInfo?.componentStack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Component Stack</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Dicas para o usuário */}
          <div className="text-sm text-gray-500 space-y-1">
            <p className="font-medium">Dicas:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Verifique sua conexão com a internet</li>
              <li>Tente recarregar a página</li>
              <li>Se o problema persistir, entre em contato conosco</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Componente de fallback simplificado para erros menores
 */
export const SimpleErrorFallback: React.FC<{ 
  message?: string; 
  onRetry?: () => void; 
}> = ({ 
  message = 'Algo deu errado', 
  onRetry 
}) => {
  return (
    <Alert className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Tentar Novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorFallback;