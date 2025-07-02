import { useCrudOperations } from '@/hooks/useCrudOperations';
import { fornecedoresPFApi } from '@/lib/api/fornecedoresPF';
import type { FornecedorPF, FornecedorPFFormValues } from '@/types/fornecedor';

/**
 * Hook para gerenciar fornecedores PF
 * Refatorado para usar o hook genérico useCrudOperations
 */
export function useFornecedoresPF() {
  const {
    data: fornecedoresPF,
    isLoading,
    error,
    create: createFornecedor,
    update: updateFornecedor,
    delete: deleteFornecedor,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCrudOperations<FornecedorPF, FornecedorPFFormValues, Partial<FornecedorPFFormValues>>(
    fornecedoresPFApi,
    {
      resource: 'fornecedores_pf',
      messages: {
        createSuccess: 'Fornecedor PF criado com sucesso!',
        updateSuccess: 'Fornecedor PF atualizado com sucesso!',
        deleteSuccess: 'Fornecedor PF excluído com sucesso!',
        createError: 'Erro ao criar fornecedor PF',
        updateError: 'Erro ao atualizar fornecedor PF',
        deleteError: 'Erro ao excluir fornecedor PF',
      },
    }
  );

  return {
    fornecedoresPF,
    isLoading,
    error,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    isCreating,
    isUpdating,
    isDeleting,
  };
}