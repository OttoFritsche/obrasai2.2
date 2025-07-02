import { obrasApi } from '@/services/api';
import { useCrudOperations } from './useCrudOperations';

/**
 * Hook customizado para gerenciamento de obras multi-tenant.
 * Busca, cria, edita e deleta obras do tenant logado.
 * 
 * Refatorado para usar useCrudOperations - elimina duplicação de código.
 */
export const useObras = () => {
  const obrasApiCrud = {
    getAll: obrasApi.getAll,
    getById: async () => { throw new Error('Not implemented'); },
    create: obrasApi.create,
    update: obrasApi.update,
    delete: obrasApi.delete,
  };

  const {
    data: obras,
    isLoading,
    error,
    createMutation: createObra,
    updateMutation: updateObra,
    deleteMutation: deleteObra,
    validTenantId: tenantId,
  } = useCrudOperations(obrasApiCrud, {
    resource: 'obras',
    messages: {
      createSuccess: 'Obra criada com sucesso!',
      updateSuccess: 'Obra atualizada com sucesso!',
      deleteSuccess: 'Obra excluída com sucesso!',
      createError: 'Erro ao criar obra',
      updateError: 'Erro ao atualizar obra',
      deleteError: 'Erro ao excluir obra',
    },
  });

  return {
    obras,
    isLoading,
    error,
    createObra,
    updateObra,
    deleteObra,
    // Informações úteis para debug
    tenantId,
    hasValidTenant: !!tenantId,
  };
};