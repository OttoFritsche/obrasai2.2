import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { despesasApi } from '@/services/api';
import { useAuth } from '@/contexts/auth';
import { DespesaFormValues } from '@/lib/validations/despesa';
import { useMemo } from 'react';

/**
 * Hook customizado para gerenciamento de despesas multi-tenant.
 * Valida rigorosamente o tenant_id para evitar erro "[object Object]".
 */
export const useDespesas = () => {
  const { user } = useAuth();
  
  // ✅ Extrair tenant_id com validação rigorosa
  const tenantId = user?.profile?.tenant_id;
  
  // ✅ Validação mais rigorosa do tenantId
  const validTenantId = useMemo(() => {
    // Se não há usuário, retorna null
    if (!user) {
      return null;
    }
    
    // Se não há perfil, retorna null
    if (!user.profile) {
      return null;
    }
    
    // Validar se tenantId é uma string válida e um UUID
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      console.warn('🚨 useDespesas: tenantId é null/undefined');
      return null;
    }
    
    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      console.warn('🚨 useDespesas: tenantId não é um UUID válido:', tenantId);
      return null;
    }
    
    return tenantId;
  }, [user, tenantId]);

  const queryClient = useQueryClient();

  // Busca todas as despesas do tenant
  const {
    data: despesas,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['despesas', validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado, inválido ou não é string válida');
      }
      return despesasApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      console.log('🔄 useDespesas - Tentativa de retry:', failureCount, error?.message);
      return failureCount < 2; // Máximo 2 tentativas
    },
    onError: (error) => {
      console.error('❌ useDespesas - Erro na query:', error);
    },
  });

  // Busca uma despesa específica por ID
  const useDespesa = (id: string) => {
    return useQuery({
      queryKey: ['despesa', id, validTenantId],
      queryFn: () => {
        if (!validTenantId) {
          throw new Error('Tenant ID não encontrado, inválido ou não é string válida');
        }
        if (!id || typeof id !== 'string') {
          throw new Error('ID da despesa inválido');
        }
        return despesasApi.getById(id, validTenantId);
      },
      enabled: !!validTenantId && !!id,
    });
  };

  // Criação de despesa
  const createDespesa = useMutation({
    mutationFn: (despesa: DespesaFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado, inválido ou não é string válida');
      }
      return despesasApi.create(despesa, validTenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', validTenantId] });
    },
    onError: (error) => {
      console.error('❌ useDespesas - Erro ao criar despesa:', error);
    },
  });

  // Edição de despesa
  const updateDespesa = useMutation({
    mutationFn: ({ id, despesa }: { id: string; despesa: Partial<DespesaFormValues> }) => {
      if (!id || typeof id !== 'string') {
        throw new Error('ID da despesa inválido');
      }
      return despesasApi.update(id, despesa);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', validTenantId] });
    },
    onError: (error) => {
      console.error('❌ useDespesas - Erro ao atualizar despesa:', error);
    },
  });

  // Deleção de despesa
  const deleteDespesa = useMutation({
    mutationFn: (id: string) => {
      if (!id || typeof id !== 'string') {
        throw new Error('ID da despesa inválido');
      }
      return despesasApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', validTenantId] });
    },
    onError: (error) => {
      console.error('❌ useDespesas - Erro ao deletar despesa:', error);
    },
  });

  return {
    despesas,
    isLoading,
    error,
    refetch,
    useDespesa,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    // Informações úteis para debug
    tenantId: validTenantId,
    hasValidTenant: !!validTenantId,
    originalTenantId: tenantId,
  };
}; 