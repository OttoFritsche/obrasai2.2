import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

import { ErrorBoundary, useErrorHandler } from '../index';
import { secureLogger } from '@/lib/logger';

// Mock do logger
vi.mock('@/lib/logger', () => ({
  secureLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Componente de teste que usa useErrorHandler
const TestComponent = ({ shouldThrow = false, errorType = 'generic' }) => {
  const { handleError, handleApiError, wrapAsync } = useErrorHandler();

  const throwError = () => {
    switch (errorType) {
      case 'api':
        handleApiError(new Error('API Error'), {
          context: 'Test API call',
          fallbackMessage: 'API call failed'
        });
        break;
      case 'validation':
        handleError(new Error('Validation Error'), {
          context: 'Test validation',
          type: 'validation'
        });
        break;
      case 'auth':
        handleError(new Error('Unauthorized'), {
          context: 'Test auth',
          type: 'auth'
        });
        break;
      case 'async':
        const asyncFn = wrapAsync(async () => {
          throw new Error('Async Error');
        }, {
          context: 'Test async operation'
        });
        asyncFn();
        break;
      default:
        handleError(new Error('Generic Error'), {
          context: 'Test generic error'
        });
    }
  };

  if (shouldThrow) {
    throw new Error('Component Error');
  }

  return (
    <div>
      <h1>Test Component</h1>
      <button onClick={throwError} data-testid="throw-error">
        Throw Error
      </button>
    </div>
  );
};

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Sistema de Tratamento de Erros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useErrorHandler', () => {
    it('deve tratar erro genérico corretamente', async () => {
      render(
        <TestWrapper>
          <TestComponent errorType="generic" />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Generic Error');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'Error in Test generic error',
          expect.objectContaining({
            message: 'Generic Error',
            context: 'Test generic error',
            type: 'generic',
          })
        );
      });
    });

    it('deve tratar erro de API corretamente', async () => {
      render(
        <TestWrapper>
          <TestComponent errorType="api" />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API call failed');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'API Error in Test API call',
          expect.objectContaining({
            message: 'API Error',
            context: 'Test API call',
            type: 'api',
          })
        );
      });
    });

    it('deve tratar erro de validação corretamente', async () => {
      render(
        <TestWrapper>
          <TestComponent errorType="validation" />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Validation Error');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'Validation Error in Test validation',
          expect.objectContaining({
            message: 'Validation Error',
            context: 'Test validation',
            type: 'validation',
          })
        );
      });
    });

    it('deve tratar erro de autenticação corretamente', async () => {
      render(
        <TestWrapper>
          <TestComponent errorType="auth" />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Unauthorized');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'Authentication Error in Test auth',
          expect.objectContaining({
            message: 'Unauthorized',
            context: 'Test auth',
            type: 'auth',
          })
        );
      });
    });

    it('deve tratar erro assíncrono com wrapAsync', async () => {
      render(
        <TestWrapper>
          <TestComponent errorType="async" />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Async Error');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'Error in Test async operation',
          expect.objectContaining({
            message: 'Async Error',
            context: 'Test async operation',
          })
        );
      });
    });
  });

  describe('ErrorBoundary', () => {
    // Suprimir console.error para testes de ErrorBoundary
    const originalError = console.error;
    beforeEach(() => {
      console.error = vi.fn();
    });
    afterEach(() => {
      console.error = originalError;
    });

    it('deve capturar erro de componente e exibir fallback', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <TestComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
      expect(screen.getByText('Ir para Dashboard')).toBeInTheDocument();
    });

    it('deve permitir retry quando erro é capturado', () => {
      const { rerender } = render(
        <TestWrapper>
          <ErrorBoundary>
            <TestComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

      const retryButton = screen.getByText('Tentar Novamente');
      fireEvent.click(retryButton);

      // Simular que o componente não vai mais dar erro
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <TestComponent shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('deve usar fallback customizado quando fornecido', () => {
      const customFallback = (error: Error, retry: () => void) => (
        <div>
          <h2>Custom Error Fallback</h2>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Custom Retry</button>
        </div>
      );

      render(
        <TestWrapper>
          <ErrorBoundary fallback={customFallback}>
            <TestComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
      expect(screen.getByText('Error: Component Error')).toBeInTheDocument();
      expect(screen.getByText('Custom Retry')).toBeInTheDocument();
    });

    it('deve logar erro quando capturado', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <TestComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(secureLogger.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error',
        expect.objectContaining({
          message: 'Component Error',
          stack: expect.any(String),
        })
      );
    });
  });

  describe('Integração com React Query', () => {
    it('deve tratar erro de query corretamente', async () => {
      const TestQueryComponent = () => {
        const { wrapAsync } = useErrorHandler();
        
        const failingQuery = wrapAsync(async () => {
          throw new Error('Query failed');
        }, {
          context: 'Test query',
          showToast: true
        });

        return (
          <div>
            <button onClick={failingQuery} data-testid="trigger-query">
              Trigger Query
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestQueryComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('trigger-query');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Query failed');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'Error in Test query',
          expect.objectContaining({
            message: 'Query failed',
            context: 'Test query',
          })
        );
      });
    });
  });

  describe('Cenários de Erro Específicos', () => {
    it('deve tratar erro de rede corretamente', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const { handleApiError } = useErrorHandler();
      
      handleApiError(networkError, {
        context: 'Network request',
        fallbackMessage: 'Erro de conexão'
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro de conexão');
      });
    });

    it('deve tratar erro 401 (Unauthorized) corretamente', async () => {
      const authError = new Error('Unauthorized');
      authError.name = 'AuthError';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const { handleApiError } = useErrorHandler();
      
      handleApiError(authError, {
        context: 'Protected resource',
        type: 'auth'
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Unauthorized');
        expect(secureLogger.error).toHaveBeenCalledWith(
          'API Error in Protected resource',
          expect.objectContaining({
            type: 'auth',
          })
        );
      });
    });

    it('deve tratar erro 403 (Forbidden) corretamente', async () => {
      const forbiddenError = new Error('Forbidden');
      forbiddenError.name = 'ForbiddenError';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const { handleApiError } = useErrorHandler();
      
      handleApiError(forbiddenError, {
        context: 'Restricted action',
        fallbackMessage: 'Acesso negado'
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Acesso negado');
      });
    });

    it('deve tratar erro 500 (Server Error) corretamente', async () => {
      const serverError = new Error('Internal Server Error');
      serverError.name = 'ServerError';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const { handleApiError } = useErrorHandler();
      
      handleApiError(serverError, {
        context: 'Server request',
        fallbackMessage: 'Erro interno do servidor'
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro interno do servidor');
      });
    });
  });

  describe('Performance e Otimização', () => {
    it('não deve logar erros duplicados em sequência', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      
      // Disparar o mesmo erro múltiplas vezes rapidamente
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        // Deve ter logado apenas uma vez (ou com throttling)
        expect(secureLogger.error).toHaveBeenCalledTimes(1);
      });
    });

    it('deve limitar o número de toasts de erro', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('throw-error');
      
      // Disparar múltiplos erros
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      await waitFor(() => {
        // Deve ter limitado o número de toasts
        expect(toast.error).toHaveBeenCalledTimes(1);
      });
    });
  });
});

// Testes de integração com componentes reais
describe('Integração com Componentes Reais', () => {
  it('deve funcionar corretamente em formulários', async () => {
    const FormComponent = () => {
      const { handleError, wrapAsync } = useErrorHandler();
      
      const handleSubmit = wrapAsync(async (data: any) => {
        if (!data.email) {
          throw new Error('Email é obrigatório');
        }
        // Simular envio
        throw new Error('Erro no servidor');
      }, {
        context: 'Envio de formulário'
      });

      return (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit({});
        }}>
          <button type="submit" data-testid="submit-form">
            Enviar
          </button>
        </form>
      );
    };

    render(
      <TestWrapper>
        <FormComponent />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('submit-form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email é obrigatório');
    });
  });

  it('deve funcionar corretamente em listas com carregamento', async () => {
    const ListComponent = () => {
      const { wrapAsync } = useErrorHandler();
      
      const loadData = wrapAsync(async () => {
        throw new Error('Falha ao carregar dados');
      }, {
        context: 'Carregamento de lista',
        fallbackMessage: 'Não foi possível carregar os dados'
      });

      return (
        <div>
          <button onClick={loadData} data-testid="load-data">
            Carregar Dados
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <ListComponent />
      </TestWrapper>
    );

    const loadButton = screen.getByTestId('load-data');
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Não foi possível carregar os dados');
    });
  });
});