import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fornecedoresPJApi } from '@/services/api';
import { useAuth } from '@/contexts/auth';
import { FornecedorPJFormValues } from '@/lib/validations/fornecedor';

/**
 * Hook customizado para gerenciamento de fornecedores PJ multi-tenant.
 * Busca, cria, edita e deleta fornecedores PJ do tenant logado.
 */
export const useFornecedoresPJ = () => {
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const queryClient = useQueryClient();

  // Validação do tenantId para evitar [object Object]
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Busca todos os fornecedores PJ do tenant
  const {
    data: fornecedoresPJ,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fornecedores-pj', validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPJApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      return failureCount < 1; // Máximo 1 tentativa
    },
  });

  // Criação de fornecedor PJ
  const createFornecedorPJ = useMutation({
    mutationFn: (fornecedor: FornecedorPJFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return fornecedoresPJApi.create(fornecedor, validTenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pj', validTenantId]);
    },
  });

  // Edição de fornecedor PJ
  const updateFornecedorPJ = useMutation({
    mutationFn: ({ id, fornecedor }: { id: string; fornecedor: Partial<FornecedorPJFormValues> }) => fornecedoresPJApi.update(id, fornecedor),
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pj', validTenantId]);
    },
  });

  // Deleção de fornecedor PJ
  const deleteFornecedorPJ = useMutation({
    mutationFn: (id: string) => fornecedoresPJApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fornecedores-pj', validTenantId]);
    },
  });

  return {
    fornecedoresPJ,
    isLoading,
    error,
    refetch,
    createFornecedorPJ,
    updateFornecedorPJ,
    deleteFornecedorPJ,
    // Informações úteis para debug
    tenantId: validTenantId,
    hasValidTenant: !!validTenantId,
  };
}; 