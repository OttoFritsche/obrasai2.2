import { fornecedoresPJApi } from '@/services/api';

import { useCrudOperations } from './useCrudOperations';

/**
 * Hook customizado para gerenciamento de fornecedores PJ multi-tenant.
 * Busca, cria, edita e deleta fornecedores PJ do tenant logado.
 * 
 * Refatorado para usar useCrudOperations - elimina duplicação de código.
 */
export const useFornecedoresPJ = () => {
  const fornecedoresPJApiCrud = {
    getAll: fornecedoresPJApi.getAll,
    getById: async () => { throw new Error('Not implemented'); },
    create: fornecedoresPJApi.create,
    update: fornecedoresPJApi.update,
    delete: fornecedoresPJApi.delete,
  };

  const {
    data: fornecedoresPJ,
    isLoading,
    error,
    createMutation: createFornecedorPJ,
    updateMutation: updateFornecedorPJ,
    deleteMutation: deleteFornecedorPJ,
    validTenantId: tenantId,
  } = useCrudOperations(fornecedoresPJApiCrud, {
    resource: 'fornecedores-pj',
    messages: {
      createSuccess: 'Fornecedor PJ criado com sucesso!',
      updateSuccess: 'Fornecedor PJ atualizado com sucesso!',
      deleteSuccess: 'Fornecedor PJ excluído com sucesso!',
      createError: 'Erro ao criar fornecedor PJ',
      updateError: 'Erro ao atualizar fornecedor PJ',
      deleteError: 'Erro ao excluir fornecedor PJ',
    },
  });

  return {
    fornecedoresPJ,
    isLoading,
    error,
    createFornecedorPJ,
    updateFornecedorPJ,
    deleteFornecedorPJ,
    // Informações úteis para debug
    tenantId,
    hasValidTenant: !!tenantId,
  };
};