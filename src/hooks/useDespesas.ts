import { useQuery } from '@tanstack/react-query';

import { despesasApi } from '@/services/api';

import { useCrudOperations } from './useCrudOperations';
import { useTenantValidation } from './useTenantValidation';

/**
 * Hook customizado para gerenciamento de despesas multi-tenant.
 * Refatorado para usar useCrudOperations - elimina duplicação de código.
 */
export const useDespesas = () => {
  const despesasApiCrud = {
    getAll: despesasApi.getAll,
    getById: async () => { throw new Error('Not implemented'); },
    create: despesasApi.create,
    update: despesasApi.update,
    delete: despesasApi.delete,
  };

  const {
    data: despesas,
    isLoading,
    error,
    createMutation: createDespesa,
    updateMutation: updateDespesa,
    deleteMutation: deleteDespesa,
    validTenantId: tenantId,
  } = useCrudOperations(despesasApiCrud, {
    resource: 'despesas',
    messages: {
      createSuccess: 'Despesa criada com sucesso!',
      updateSuccess: 'Despesa atualizada com sucesso!',
      deleteSuccess: 'Despesa excluída com sucesso!',
      createError: 'Erro ao criar despesa',
      updateError: 'Erro ao atualizar despesa',
      deleteError: 'Erro ao excluir despesa',
    },
  });

  // Busca uma despesa específica por ID
  const useDespesa = (id: string) => {
    const { validTenantId } = useTenantValidation();
    
    return useQuery({
      queryKey: ['despesa', id, validTenantId],
      queryFn: () => {
        if (!validTenantId) {
          throw new Error('Tenant ID não encontrado, inválido ou não é string válida');
        }
        if (!id || typeof id !== 'string') {
          throw new Error('ID da despesa inválido');
        }
        return despesasApi.getById(id, validTenantId);
      },
      enabled: !!validTenantId && !!id,
    });
  };



  return {
    despesas,
    isLoading,
    error,
    useDespesa,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    // Informações úteis para debug
    tenantId,
    hasValidTenant: !!tenantId,
  };
};