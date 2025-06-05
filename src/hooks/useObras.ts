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

  // Validação do tenantId para evitar [object Object]
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Busca todas as obras do tenant
  const {
    data: obras,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['obras', validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return obrasApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      return failureCount < 1; // Máximo 1 tentativa
    },
  });

  // Criação de obra
  const createObra = useMutation({
    mutationFn: (obra: ObraFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return obrasApi.create(obra, validTenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['obras', validTenantId]);
    },
  });

  // Edição de obra
  const updateObra = useMutation({
    mutationFn: ({ id, obra }: { id: string; obra: Partial<ObraFormValues> }) => obrasApi.update(id, obra),
    onSuccess: () => {
      queryClient.invalidateQueries(['obras', validTenantId]);
    },
  });

  // Deleção de obra
  const deleteObra = useMutation({
    mutationFn: (id: string) => obrasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['obras', validTenantId]);
    },
  });

  return {
    obras,
    isLoading,
    error,
    refetch,
    createObra,
    updateObra,
    deleteObra,
    // Informações úteis para debug
    tenantId: validTenantId,
    hasValidTenant: !!validTenantId,
  };
}; 