import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { obrasApi } from '@/services/api';
import {mockFactories, renderWithProviders } from '@/tests/test-utils';

import { useObras } from '../hooks/useObras';

// Mock das dependências
vi.mock('@/services/api', () => ({
  obrasApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do useCrudOperations já que useObras é construído sobre ele
vi.mock('../hooks/useCrudOperations', () => ({
  useCrudOperations: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    createMutation: {
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
    },
    updateMutation: {
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
    },
    deleteMutation: {
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
    },
    validTenantId: 'tenant-123',
  })),
}));

describe('useObras - Versão Expandida', () => {
  let queryClient: QueryClient;
  let mockUseCrudOperations: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Recuperar o mock do useCrudOperations
    mockUseCrudOperations = vi.mocked(
      await import('../hooks/useCrudOperations')
    ).useCrudOperations;

    vi.clearAllMocks();
  });

  describe('Configuração e estrutura básica', () => {
    it('deve configurar useCrudOperations com API de obras', () => {
      renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(mockUseCrudOperations).toHaveBeenCalledWith(
        expect.objectContaining({
          getAll: obrasApi.getAll,
          create: obrasApi.create,
          update: obrasApi.update,
          delete: obrasApi.delete,
        }),
        expect.objectContaining({
          resource: 'obras',
          messages: expect.objectContaining({
            createSuccess: 'Obra criada com sucesso!',
            updateSuccess: 'Obra atualizada com sucesso!',
            deleteSuccess: 'Obra excluída com sucesso!',
            createError: 'Erro ao criar obra',
            updateError: 'Erro ao atualizar obra',
            deleteError: 'Erro ao excluir obra',
          }),
        })
      );
    });

    it('deve expor interface adequada para obras', () => {
      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current).toHaveProperty('obras');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('createObra');
      expect(result.current).toHaveProperty('updateObra');
      expect(result.current).toHaveProperty('deleteObra');
      expect(result.current).toHaveProperty('tenantId');
      expect(result.current).toHaveProperty('hasValidTenant');
    });

    it('deve calcular hasValidTenant corretamente', () => {
      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.hasValidTenant).toBe(true);
      expect(result.current.tenantId).toBe('tenant-123');
    });

    it('deve indicar tenant inválido quando não há tenantId', () => {
      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: null,
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.hasValidTenant).toBe(false);
      expect(result.current.tenantId).toBeNull();
    });
  });

  describe('Carregamento de dados', () => {
    it('deve retornar lista de obras quando carregamento bem-sucedido', () => {
      const mockObras = [
        mockFactories.obra({ id: 'obra-1', nome: 'Obra 1' }),
        mockFactories.obra({ id: 'obra-2', nome: 'Obra 2' }),
      ];

      mockUseCrudOperations.mockReturnValue({
        data: mockObras,
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.obras).toEqual(mockObras);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('deve indicar loading durante carregamento', () => {
      mockUseCrudOperations.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.obras).toBeUndefined();
    });

    it('deve expor erro quando ocorre falha no carregamento', () => {
      const mockError = new Error('Falha na API');

      mockUseCrudOperations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.obras).toBeUndefined();
    });
  });

  describe('Operações CRUD', () => {
    let mockCreateMutation: ReturnType<typeof vi.fn>;
    let mockUpdateMutation: ReturnType<typeof vi.fn>;
    let mockDeleteMutation: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockCreateMutation = {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: null,
      };

      mockUpdateMutation = {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: null,
      };

      mockDeleteMutation = {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: null,
      };

      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: mockCreateMutation,
        updateMutation: mockUpdateMutation,
        deleteMutation: mockDeleteMutation,
        validTenantId: 'tenant-123',
      });
    });

    it('deve expor mutations de CRUD', () => {
      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.createObra).toBe(mockCreateMutation);
      expect(result.current.updateObra).toBe(mockUpdateMutation);
      expect(result.current.deleteObra).toBe(mockDeleteMutation);
    });

    it('deve permitir criação de obra', () => {
      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      const novaObra = { nome: 'Nova Obra', descricao: 'Descrição' };

      act(() => {
        result.current.createObra.mutate(novaObra);
      });

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith(novaObra);
    });

    it('deve permitir atualização de obra', () => {
      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      const updateData = { id: 'obra-123', data: { nome: 'Obra Atualizada' } };

      act(() => {
        result.current.updateObra.mutate(updateData);
      });

      expect(mockUpdateMutation.mutate).toHaveBeenCalledWith(updateData);
    });

    it('deve permitir exclusão de obra', () => {
      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      act(() => {
        result.current.deleteObra.mutate('obra-123');
      });

      expect(mockDeleteMutation.mutate).toHaveBeenCalledWith('obra-123');
    });
  });

  describe('Estados das operações', () => {
    it('deve refletir estado de loading das mutations', () => {
      const mockCreateMutation = {
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        isSuccess: false,
        error: null,
        data: null,
      };

      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: mockCreateMutation,
        updateMutation: { mutate: vi.fn(), isPending: false },
        deleteMutation: { mutate: vi.fn(), isPending: false },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.createObra.isPending).toBe(true);
    });

    it('deve refletir estado de erro das mutations', () => {
      const error = new Error('Erro na criação');
      const mockCreateMutation = {
        mutate: vi.fn(),
        isPending: false,
        isError: true,
        isSuccess: false,
        error,
        data: null,
      };

      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: mockCreateMutation,
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.createObra.isError).toBe(true);
      expect(result.current.createObra.error).toEqual(error);
    });

    it('deve refletir estado de sucesso das mutations', () => {
      const obraData = mockFactories.obra();
      const mockCreateMutation = {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
        data: obraData,
      };

      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: mockCreateMutation,
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.createObra.isSuccess).toBe(true);
      expect(result.current.createObra.data).toEqual(obraData);
    });
  });

  describe('Integração com useCrudOperations', () => {
    it('deve passar configuração correta de API para useCrudOperations', () => {
      renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      const apiConfig = mockUseCrudOperations.mock.calls[0][0];
      
      expect(apiConfig.getAll).toBe(obrasApi.getAll);
      expect(apiConfig.create).toBe(obrasApi.create);
      expect(apiConfig.update).toBe(obrasApi.update);
      expect(apiConfig.delete).toBe(obrasApi.delete);
      expect(typeof apiConfig.getById).toBe('function');
    });

    it('deve passar opções corretas para useCrudOperations', () => {
      renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      const options = mockUseCrudOperations.mock.calls[0][1];
      
      expect(options.resource).toBe('obras');
      expect(options.messages).toEqual({
        createSuccess: 'Obra criada com sucesso!',
        updateSuccess: 'Obra atualizada com sucesso!',
        deleteSuccess: 'Obra excluída com sucesso!',
        createError: 'Erro ao criar obra',
        updateError: 'Erro ao atualizar obra',
        deleteError: 'Erro ao excluir obra',
      });
    });

    it('deve lançar erro para getById não implementado', async () => {
      renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      const apiConfig = mockUseCrudOperations.mock.calls[0][0];
      
      await expect(apiConfig.getById()).rejects.toThrow('Not implemented');
    });
  });

  describe('Casos de uso complexos', () => {
    it('deve funcionar corretamente com múltiplas obras', () => {
      const mockObras = [
        mockFactories.obra({ id: 'obra-1', nome: 'Residencial Sol' }),
        mockFactories.obra({ id: 'obra-2', nome: 'Comercial Centro' }),
        mockFactories.obra({ id: 'obra-3', nome: 'Industrial Norte' }),
      ];

      mockUseCrudOperations.mockReturnValue({
        data: mockObras,
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.obras).toHaveLength(3);
      expect(result.current.obras[0].nome).toBe('Residencial Sol');
      expect(result.current.obras[1].nome).toBe('Comercial Centro');
      expect(result.current.obras[2].nome).toBe('Industrial Norte');
    });

    it('deve funcionar com lista vazia', () => {
      mockUseCrudOperations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.obras).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('deve lidar com cenário de reconexão após erro', () => {
      // Primeiro render com erro
      let mockReturn = {
        data: undefined,
        isLoading: false,
        error: new Error('Network Error'),
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      };

      mockUseCrudOperations.mockReturnValue(mockReturn);

      const { result, rerender } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.error).toBeTruthy();

      // Simular reconexão com sucesso
      mockReturn = {
        data: [mockFactories.obra()],
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      };

      mockUseCrudOperations.mockReturnValue(mockReturn);
      rerender();

      expect(result.current.error).toBeNull();
      expect(result.current.obras).toHaveLength(1);
    });
  });

  describe('Propriedades de debug', () => {
    it('deve fornecer informações úteis para debug', () => {
      mockUseCrudOperations.mockReturnValue({
        data: [mockFactories.obra()],
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: 'tenant-123',
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.tenantId).toBe('tenant-123');
      expect(result.current.hasValidTenant).toBe(true);
    });

    it('deve indicar quando não há tenant válido para debug', () => {
      mockUseCrudOperations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        createMutation: { mutate: vi.fn() },
        updateMutation: { mutate: vi.fn() },
        deleteMutation: { mutate: vi.fn() },
        validTenantId: null,
      });

      const { result } = renderHook(() => useObras(), {
        wrapper: ({ children }) => renderWithProviders(children, { queryClient }),
      });

      expect(result.current.tenantId).toBeNull();
      expect(result.current.hasValidTenant).toBe(false);
    });
  });
});