import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiMockHelpers, renderWithProviders } from '@/tests/test-utils';

import { useFormMutation } from '../useFormMutation';

// Mock das dependências
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/contexts/auth/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      profile: { tenant_id: 'tenant-123' }
    }
  })),
}));

vi.mock('../useTenantValidation', () => ({
  useTenantValidation: vi.fn(() => ({
    validTenantId: 'tenant-123',
    tenantId: 'tenant-123',
  })),
}));

// Tipos para os testes
interface TestFormData {
  id?: string;
  nome: string;
  email?: string;
}

interface TestResponse {
  id: string;
  nome: string;
  created_at: string;
}

describe('useFormMutation', () => {
  let queryClient: QueryClient;
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockMutationFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    mockNavigate = vi.fn();
    mockMutationFn = vi.fn();
    
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  describe('Configuração básica', () => {
    it('deve configurar mutation com parâmetros mínimos', () => {
      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.validTenantId).toBe('tenant-123');
    });

    it('deve expor todas as propriedades da mutation', () => {
      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      // Propriedades básicas da mutation
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('reset');
      
      // Propriedade adicional
      expect(result.current).toHaveProperty('validTenantId');
    });
  });

  describe('Execução de mutation', () => {
    it('deve executar mutation com sucesso', async () => {
      const mockResponse: TestResponse = {
        id: 'test-123',
        nome: 'Teste',
        created_at: new Date().toISOString(),
      };
      
      mockMutationFn.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          successMessage: 'Criado com sucesso!',
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      const formData: TestFormData = { nome: 'Teste' };

      act(() => {
        result.current.mutate(formData);
      });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMutationFn).toHaveBeenCalledWith(formData, 'tenant-123');
      expect(result.current.data).toEqual(mockResponse);
      expect(toast.success).toHaveBeenCalledWith('Criado com sucesso!');
    });

    it('deve usar mensagem padrão de sucesso', async () => {
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith('Operação realizada com sucesso!');
    });

    it('deve lidar com erro na mutation', async () => {
      const error = new Error('Erro de validação');
      mockMutationFn.mockRejectedValue(error);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          errorMessage: 'Falha na operação',
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
      expect(toast.error).toHaveBeenCalledWith('Falha na operação');
    });

    it('deve usar mensagem padrão de erro', async () => {
      mockMutationFn.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao realizar operação');
    });
  });

  describe('Validação de Tenant', () => {
    it('deve falhar se não tiver tenant ID válido', async () => {
      // Mock sem tenant
      vi.mocked(await import('../useTenantValidation')).useTenantValidation
        .mockReturnValue({
          validTenantId: null,
          tenantId: null,
        });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockMutationFn).not.toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Tenant ID não encontrado');
    });
  });

  describe('Invalidação de Queries', () => {
    it('deve invalidar query única', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          queryKey: 'obras',
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ 
        queryKey: ['obras'] 
      });
    });

    it('deve invalidar múltiplas queries', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          queryKey: ['obras', 'metricas', 'dashboard'],
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['obras'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['metricas'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    });

    it('não deve tentar invalidar queries se não especificado', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
  });

  describe('Redirecionamento', () => {
    it('deve redirecionar após sucesso', async () => {
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          redirectTo: '/obras',
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/obras');
    });

    it('não deve redirecionar se não especificado', async () => {
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('não deve redirecionar em caso de erro', async () => {
      mockMutationFn.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          redirectTo: '/obras',
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Callbacks personalizados', () => {
    it('deve executar callback de sucesso', async () => {
      const onSuccessCallback = vi.fn();
      const mockResponse = { id: 'test-123', nome: 'Teste' };
      const mockVariables = { nome: 'Teste' };
      
      mockMutationFn.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          onSuccessCallback,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate(mockVariables);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccessCallback).toHaveBeenCalledWith(mockResponse, mockVariables);
    });

    it('deve executar callback de erro', async () => {
      const onErrorCallback = vi.fn();
      const error = new Error('API Error');
      
      mockMutationFn.mockRejectedValue(error);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          onErrorCallback,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(onErrorCallback).toHaveBeenCalledWith(error);
    });

    it('deve funcionar sem callbacks', async () => {
      mockMutationFn.mockResolvedValue({ id: 'test-123' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Deve terminar sem erro mesmo sem callbacks
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Cenários complexos', () => {
    it('deve executar fluxo completo com todas as opções', async () => {
      const onSuccessCallback = vi.fn();
      const onErrorCallback = vi.fn();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      mockMutationFn.mockResolvedValue({ id: 'test-123', nome: 'Teste' });

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          queryKey: ['obras', 'metricas'],
          successMessage: 'Obra criada!',
          errorMessage: 'Falha ao criar obra',
          redirectTo: '/obras',
          onSuccessCallback,
          onErrorCallback,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      const formData = { nome: 'Nova Obra', email: 'test@test.com' };

      act(() => {
        result.current.mutate(formData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verificar todas as operações
      expect(mockMutationFn).toHaveBeenCalledWith(formData, 'tenant-123');
      expect(toast.success).toHaveBeenCalledWith('Obra criada!');
      expect(onSuccessCallback).toHaveBeenCalled();
      expect(onErrorCallback).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/obras');
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });

    it('deve lidar com erro em cenário completo', async () => {
      const onSuccessCallback = vi.fn();
      const onErrorCallback = vi.fn();
      const error = new Error('Network error');
      
      mockMutationFn.mockRejectedValue(error);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
          queryKey: ['obras'],
          successMessage: 'Obra criada!',
          errorMessage: 'Falha ao criar obra',
          redirectTo: '/obras',
          onSuccessCallback,
          onErrorCallback,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      act(() => {
        result.current.mutate({ nome: 'Nova Obra' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Falha ao criar obra');
      expect(onErrorCallback).toHaveBeenCalledWith(error);
      expect(onSuccessCallback).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Estados de loading e reset', () => {
    it('deve gerenciar estados corretamente', async () => {
      mockMutationFn.mockImplementation(() =>
        apiMockHelpers.withDelay({ id: 'test-123' }, 100)
      );

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      // Estado inicial
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      act(() => {
        result.current.mutate({ nome: 'Teste' });
      });

      // Durante execução
      expect(result.current.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // Após reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Integração com mutateAsync', () => {
    it('deve funcionar com mutateAsync', async () => {
      const mockResponse = { id: 'test-123', nome: 'Teste' };
      mockMutationFn.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      let asyncResult: any;
      
      await act(async () => {
        asyncResult = await result.current.mutateAsync({ nome: 'Teste' });
      });

      expect(asyncResult).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('deve propagar erro com mutateAsync', async () => {
      const error = new Error('API Error');
      mockMutationFn.mockRejectedValue(error);

      const { result } = renderHook(
        () => useFormMutation({
          mutationFn: mockMutationFn,
        }),
        {
          wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
        }
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({ nome: 'Teste' });
        } catch (e) {
          expect(e).toEqual(error);
        }
      });

      expect(result.current.isError).toBe(true);
    });
  });
});