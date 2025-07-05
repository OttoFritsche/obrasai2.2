import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCrudOperations, CrudApi, useSimpleCrud } from '../useCrudOperations';

// Mock das dependências
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../useTenantValidation', () => ({
  useTenantValidation: vi.fn(() => ({
    validTenantId: 'tenant-123',
    tenantId: 'tenant-123',
  })),
}));

vi.mock('../useTenantQuery', () => ({
  useTenantListQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

// Tipos para os testes
interface TestEntity {
  id: string;
  nome: string;
  tenant_id: string;
  created_at: string;
}

interface TestCreateData {
  nome: string;
}

interface TestUpdateData {
  nome?: string;
}

describe('useCrudOperations', () => {
  let mockApi: CrudApi<TestEntity, TestCreateData, TestUpdateData>;
  let queryClient: QueryClient;

  // Wrapper simples para os testes
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Mock da API
    mockApi = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe('Operações básicas de CRUD', () => {
    it('deve expor todas as operações CRUD corretamente', () => {
      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'test-entity' }),
        { wrapper }
      );

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('create');
      expect(result.current).toHaveProperty('update');
      expect(result.current).toHaveProperty('delete');
      expect(result.current).toHaveProperty('isCreating');
      expect(result.current).toHaveProperty('isUpdating');
      expect(result.current).toHaveProperty('isDeleting');
    });

    it('deve ter validTenantId disponível', () => {
      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'test-entity' }),
        { wrapper }
      );

      expect(result.current.validTenantId).toBe('tenant-123');
    });
  });

  describe('Create Operation', () => {
    it('deve criar entidade com sucesso', async () => {
      const newEntity = {
        id: 'entity-123',
        nome: 'Nova Entidade',
        tenant_id: 'tenant-123',
        created_at: new Date().toISOString(),
      };
      mockApi.create = vi.fn().mockResolvedValue(newEntity);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      expect(result.current.isCreating).toBe(true);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockApi.create).toHaveBeenCalledWith(
        { nome: 'Nova Entidade' },
        'tenant-123'
      );
      expect(toast.success).toHaveBeenCalledWith('entidades criado com sucesso!');
    });

    it('deve lidar com erro na criação', async () => {
      mockApi.create = vi.fn().mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao criar entidades');
    });

    it('deve falhar se não tiver tenant ID', async () => {
      // Mock sem tenant
      vi.mocked(await import('../useTenantValidation')).useTenantValidation.mockReturnValue({
        validTenantId: null,
        tenantId: null,
      });

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockApi.create).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Erro ao criar entidades');
    });
  });

  describe('Update Operation', () => {
    it('deve atualizar entidade com sucesso', async () => {
      const updatedEntity = {
        id: 'entity-123',
        nome: 'Entidade Atualizada',
        tenant_id: 'tenant-123',
        created_at: new Date().toISOString(),
      };
      mockApi.update = vi.fn().mockResolvedValue(updatedEntity);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.update({ 
          id: 'entity-123', 
          data: { nome: 'Entidade Atualizada' } 
        });
      });

      expect(result.current.isUpdating).toBe(true);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockApi.update).toHaveBeenCalledWith(
        'entity-123',
        { nome: 'Entidade Atualizada' },
        'tenant-123'
      );
      expect(toast.success).toHaveBeenCalledWith('entidades atualizado com sucesso!');
    });

    it('deve lidar com erro na atualização', async () => {
      mockApi.update = vi.fn().mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.update({ 
          id: 'entity-123', 
          data: { nome: 'Entidade Atualizada' } 
        });
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar entidades');
    });
  });

  describe('Delete Operation', () => {
    it('deve deletar entidade com sucesso', async () => {
      mockApi.delete = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.delete('entity-123');
      });

      expect(result.current.isDeleting).toBe(true);

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockApi.delete).toHaveBeenCalledWith('entity-123', 'tenant-123');
      expect(toast.success).toHaveBeenCalledWith('entidades excluído com sucesso!');
    });

    it('deve lidar com erro na exclusão', async () => {
      mockApi.delete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.delete('entity-123');
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao excluir entidades');
    });
  });

  describe('Mensagens customizadas', () => {
    it('deve usar mensagens customizadas quando fornecidas', async () => {
      const customMessages = {
        createSuccess: 'Entidade criada!',
        updateSuccess: 'Entidade atualizada!',
        deleteSuccess: 'Entidade removida!',
        createError: 'Falha ao criar!',
        updateError: 'Falha ao atualizar!',
        deleteError: 'Falha ao remover!',
      };

      const newEntity = {
        id: 'entity-123',
        nome: 'Nova Entidade',
        tenant_id: 'tenant-123',
        created_at: new Date().toISOString(),
      };
      mockApi.create = vi.fn().mockResolvedValue(newEntity);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { 
          resource: 'entidades', 
          messages: customMessages 
        }),
        { wrapper }
      );

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Entidade criada!');
      });
    });
  });

  describe('Invalidação de Queries', () => {
    it('deve invalidar queries após operações de sucesso', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const newEntity = {
        id: 'entity-123',
        nome: 'Nova Entidade',
        tenant_id: 'tenant-123',
        created_at: new Date().toISOString(),
      };
      mockApi.create = vi.fn().mockResolvedValue(newEntity);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });

    it('deve remover query específica no delete', async () => {
      const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
      mockApi.delete = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      act(() => {
        result.current.delete('entity-123');
      });

      await waitFor(() => {
        expect(removeQueriesSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Estados de loading', () => {
    it('deve gerenciar estados de loading corretamente', async () => {
      // Mock com delay para testar loading states
      mockApi.create = vi.fn().mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            id: 'entity-123',
            nome: 'Nova Entidade',
            tenant_id: 'tenant-123',
            created_at: new Date().toISOString(),
          }), 100)
        )
      );

      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);

      act(() => {
        result.current.create({ nome: 'Nova Entidade' });
      });

      expect(result.current.isCreating).toBe(true);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe('Exposição de mutations completas', () => {
    it('deve expor mutations completas para casos avançados', () => {
      const { result } = renderHook(
        () => useCrudOperations(mockApi, { resource: 'entidades' }),
        { wrapper }
      );

      expect(result.current.createMutation).toBeDefined();
      expect(result.current.updateMutation).toBeDefined();
      expect(result.current.deleteMutation).toBeDefined();
      expect(typeof result.current.createMutation.mutate).toBe('function');
      expect(typeof result.current.updateMutation.mutate).toBe('function');
      expect(typeof result.current.deleteMutation.mutate).toBe('function');
    });
  });
});

describe('useSimpleCrud', () => {
  let simpleApi: Pick<CrudApi<TestEntity, TestEntity, Partial<TestEntity>>, 
    'getAll' | 'create' | 'update' | 'delete'>;
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    simpleApi = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('deve funcionar com API simplificada', async () => {
    const newEntity = {
      id: 'entity-123',
      nome: 'Nova Entidade',
      tenant_id: 'tenant-123',
      created_at: new Date().toISOString(),
    };
    simpleApi.create = vi.fn().mockResolvedValue(newEntity);

    const { result } = renderHook(
      () => useSimpleCrud(simpleApi, 'entidades'),
      { wrapper }
    );

    act(() => {
      result.current.create(newEntity);
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });

    expect(simpleApi.create).toHaveBeenCalledWith(newEntity, 'tenant-123');
    expect(toast.success).toHaveBeenCalledWith('entidades criado com sucesso!');
  });

  it('deve expor todas as operações necessárias', () => {
    const { result } = renderHook(
      () => useSimpleCrud(simpleApi, 'entidades'),
      { wrapper }
    );

    expect(result.current).toHaveProperty('create');
    expect(result.current).toHaveProperty('update');
    expect(result.current).toHaveProperty('delete');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
  });
});