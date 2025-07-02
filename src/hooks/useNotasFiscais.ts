import { useCrudOperations } from '@/hooks/useCrudOperations';
import { notasFiscaisApi } from '@/services/api';

/**
 * Hook customizado para gerenciamento de notas fiscais multi-tenant.
 * Agora utiliza useCrudOperations para manter consistência com outros recursos.
 */
export const useNotasFiscais = () => {
  return useCrudOperations(notasFiscaisApi, {
    resource: 'notas-fiscais',
    messages: {
      createSuccess: 'Nota fiscal criada com sucesso!',
      updateSuccess: 'Nota fiscal atualizada com sucesso!',
      deleteSuccess: 'Nota fiscal excluída com sucesso!',
      createError: 'Erro ao criar nota fiscal',
      updateError: 'Erro ao atualizar nota fiscal',
      deleteError: 'Erro ao excluir nota fiscal',
    },
  });
}; 