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

  // Busca todos os fornecedores PJ do tenant
  const {
    data: fornecedoresPJ,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fornecedoresPJ', tenantId],
    queryFn: () => fornecedoresPJApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  // Criação de fornecedor PJ
  const createFornecedorPJ = useMutation({
    mutationFn: (fornecedor: FornecedorPJFormValues) => fornecedoresPJApi.create(fornecedor, tenantId!),
    onSuccess: () => queryClient.invalidateQueries(['fornecedoresPJ', tenantId]),
  });

  // Edição de fornecedor PJ
  const updateFornecedorPJ = useMutation({
    mutationFn: ({ id, fornecedor }: { id: string; fornecedor: Partial<FornecedorPJFormValues> }) => fornecedoresPJApi.update(id, fornecedor),
    onSuccess: () => queryClient.invalidateQueries(['fornecedoresPJ', tenantId]),
  });

  // Deleção de fornecedor PJ
  const deleteFornecedorPJ = useMutation({
    mutationFn: (id: string) => fornecedoresPJApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['fornecedoresPJ', tenantId]),
  });

  return {
    fornecedoresPJ,
    isLoading,
    error,
    refetch,
    createFornecedorPJ,
    updateFornecedorPJ,
    deleteFornecedorPJ,
  };
}; 