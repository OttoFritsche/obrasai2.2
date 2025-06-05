import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notasFiscaisApi } from '@/services/api';
import { useAuth } from '@/contexts/auth';
import { NotaFiscalFormValues } from '@/lib/validations/nota-fiscal';

/**
 * Hook customizado para gerenciamento de notas fiscais multi-tenant.
 * Busca, cria, edita e deleta notas fiscais do tenant logado.
 */
export const useNotasFiscais = () => {
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const queryClient = useQueryClient();

  // Validação do tenantId para evitar [object Object]
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Busca todas as notas fiscais do tenant
  const {
    data: notasFiscais,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notas-fiscais', validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return notasFiscaisApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      return failureCount < 1; // Máximo 1 tentativa
    },
  });

  // Criação de nota fiscal
  const createNotaFiscal = useMutation({
    mutationFn: ({ notaFiscal, file }: { notaFiscal: NotaFiscalFormValues; file?: File }) => {
      return notasFiscaisApi.create(notaFiscal, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais', validTenantId] });
    },
  });

  // Edição de nota fiscal
  const updateNotaFiscal = useMutation({
    mutationFn: ({ 
      id, 
      notaFiscal, 
      file 
    }: { 
      id: string; 
      notaFiscal: Partial<NotaFiscalFormValues>; 
      file?: File 
    }) => {
      return notasFiscaisApi.update(id, notaFiscal, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais', validTenantId] });
    },
  });

  // Deleção de nota fiscal
  const deleteNotaFiscal = useMutation({
    mutationFn: (id: string) => notasFiscaisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais', validTenantId] });
    },
  });

  return {
    notasFiscais,
    isLoading,
    error,
    refetch,
    createNotaFiscal,
    updateNotaFiscal,
    deleteNotaFiscal,
    // Informações úteis para debug
    tenantId: validTenantId,
    hasValidTenant: !!validTenantId,
  };
}; 