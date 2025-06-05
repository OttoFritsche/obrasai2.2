import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fornecedoresPFApi } from '@/services/api';
import { useAuth } from '@/contexts/auth';
import { FornecedorPFFormValues } from '@/lib/validations/fornecedor';

/**
 * Hook customizado para gerenciamento de fornecedores PF multi-tenant.
 * Busca, cria, edita e deleta fornecedores PF do tenant logado.
 */
export const useFornecedoresPF = () => {
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const queryClient = useQueryClient();

  // Validação do tenantId para evitar [object Object]
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Busca todos os fornecedores PF do tenant
  const {
    data: fornecedoresPF,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fornecedores-pf', validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPFApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      return failureCount < 1; // Máximo 1 tentativa
    },
  });

  // Criação de fornecedor PF
  const createFornecedorPF = useMutation({
    mutationFn: (fornecedor: FornecedorPFFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return fornecedoresPFApi.create(fornecedor, validTenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pf', validTenantId]);
    },
  });

  // Edição de fornecedor PF
  const updateFornecedorPF = useMutation({
    mutationFn: ({ id, fornecedor }: { id: string; fornecedor: Partial<FornecedorPFFormValues> }) => fornecedoresPFApi.update(id, fornecedor),
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pf', validTenantId]);
    },
  });

  // Deleção de fornecedor PF
  const deleteFornecedorPF = useMutation({
    mutationFn: (id: string) => fornecedoresPFApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pf', validTenantId]);
    },
  });

  return {
    fornecedoresPF,
    isLoading,
    error,
    refetch,
    createFornecedorPF,
    updateFornecedorPF,
    deleteFornecedorPF,
    // Informações úteis para debug
    tenantId: validTenantId,
    hasValidTenant: !!validTenantId,
  };
}; 