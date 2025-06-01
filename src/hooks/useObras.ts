import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obrasApi } from '@/services/api';
import { useAuth } from '@/contexts/auth';
import { ObraFormValues } from '@/lib/validations/obra';

/**
 * Hook customizado para gerenciamento de obras multi-tenant.
 * Busca, cria, edita e deleta obras do tenant logado.
 */
export const useObras = () => {
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const queryClient = useQueryClient();

  // Busca todas as obras do tenant
  const {
    data: obras,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['obras', tenantId],
    queryFn: () => obrasApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  // Criação de obra
  const createObra = useMutation({
    mutationFn: (obra: ObraFormValues) => obrasApi.create(obra, tenantId!),
    onSuccess: () => queryClient.invalidateQueries(['obras', tenantId]),
  });

  // Edição de obra
  const updateObra = useMutation({
    mutationFn: ({ id, obra }: { id: string; obra: Partial<ObraFormValues> }) => obrasApi.update(id, obra),
    onSuccess: () => queryClient.invalidateQueries(['obras', tenantId]),
  });

  // Deleção de obra
  const deleteObra = useMutation({
    mutationFn: (id: string) => obrasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['obras', tenantId]),
  });

  return {
    obras,
    isLoading,
    error,
    refetch,
    createObra,
    updateObra,
    deleteObra,
  };
}; 