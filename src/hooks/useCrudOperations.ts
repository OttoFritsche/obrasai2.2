import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenantValidation } from './useTenantValidation';
import { useTenantListQuery } from './useTenantQuery';

/**
 * Hook genérico para operações CRUD
 * Elimina duplicação de código nos hooks de fornecedores, obras, etc.
 */

export interface CrudApi<TEntity, TCreateData, TUpdateData> {
  getAll: (tenantId: string) => Promise<TEntity[]>;
  getById: (id: string, tenantId: string) => Promise<TEntity>;
  create: (data: TCreateData, tenantId: string) => Promise<TEntity>;
  update: (id: string, data: TUpdateData, tenantId: string) => Promise<TEntity>;
  delete: (id: string, tenantId: string) => Promise<void>;
}

export interface UseCrudOperationsOptions {
  resource: string;
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
  };
}

export function useCrudOperations<TEntity, TCreateData, TUpdateData>(
  api: CrudApi<TEntity, TCreateData, TUpdateData>,
  { resource, messages = {} }: UseCrudOperationsOptions
) {
  const { validTenantId } = useTenantValidation();
  const queryClient = useQueryClient();

  const defaultMessages = {
    createSuccess: `${resource} criado com sucesso!`,
    updateSuccess: `${resource} atualizado com sucesso!`,
    deleteSuccess: `${resource} excluído com sucesso!`,
    createError: `Erro ao criar ${resource}`,
    updateError: `Erro ao atualizar ${resource}`,
    deleteError: `Erro ao excluir ${resource}`,
    ...messages,
  };

  // Query para listar todos os itens
  const listQuery = useTenantListQuery({
    resource,
    queryFn: api.getAll,
  });

  // Função para invalidar queries
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [resource] });
  };

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: (data: TCreateData) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return api.create(data, validTenantId);
    },
    onSuccess: () => {
      toast.success(defaultMessages.createSuccess);
      invalidateQueries();
    },
    onError: (error) => {
      console.error(`Error creating ${resource}:`, error);
      toast.error(defaultMessages.createError);
    },
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateData }) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return api.update(id, data, validTenantId);
    },
    onSuccess: () => {
      toast.success(defaultMessages.updateSuccess);
      invalidateQueries();
    },
    onError: (error) => {
      console.error(`Error updating ${resource}:`, error);
      toast.error(defaultMessages.updateError);
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return api.delete(id, validTenantId);
    },
    onSuccess: () => {
      toast.success(defaultMessages.deleteSuccess);
      invalidateQueries();
    },
    onError: (error) => {
      console.error(`Error deleting ${resource}:`, error);
      toast.error(defaultMessages.deleteError);
    },
  });

  return {
    // Dados
    data: listQuery.data,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    
    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Estados das mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Mutations completas (para casos avançados)
    createMutation,
    updateMutation,
    deleteMutation,
    
    // Utilitários
    invalidateQueries,
    validTenantId,
  };
}

/**
 * Hook simplificado para recursos que seguem o padrão padrão
 */
export function useSimpleCrud<TEntity>(
  api: Pick<CrudApi<TEntity, TEntity, Partial<TEntity>>, 'getAll' | 'create' | 'update' | 'delete'>,
  resource: string
) {
  return useCrudOperations(
    {
      ...api,
      getById: async () => { throw new Error('Not implemented'); },
    },
    { resource }
  );
}