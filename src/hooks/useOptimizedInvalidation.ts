import { useQueryClient } from '@tanstack/react-query';

import { invalidationHelpers, queryKeys } from '@/lib/query-keys';

import { useTenantValidation } from './useTenantValidation';

/**
 * Hook para invalidação otimizada e seletiva de queries
 * Evita invalidações desnecessárias e melhora performance
 */
export const useOptimizedInvalidation = () => {
  const queryClient = useQueryClient();
  const { validTenantId } = useTenantValidation();

  // Invalidação seletiva baseada na operação
  const invalidateAfterMutation = async (
    operation: 
      | { type: 'create', resource: 'obra' }
      | { type: 'update', resource: 'obra', id: string }
      | { type: 'delete', resource: 'obra', id: string }
      | { type: 'create', resource: 'despesa', obraId: string }
      | { type: 'update', resource: 'despesa', id: string, obraId: string }
      | { type: 'delete', resource: 'despesa', id: string, obraId: string }
      | { type: 'create', resource: 'contrato' }
      | { type: 'create', resource: 'fornecedor', fornecedorType: 'pj' | 'pf' }
      | { type: 'update', resource: 'fornecedor', id: string, fornecedorType: 'pj' | 'pf' }
  ) => {
    if (!validTenantId) return;

    let queriesToInvalidate: readonly unknown[][] = [];

    // Determinar quais queries invalidar baseado na operação
    switch (operation.type) {
      case 'create':
        switch (operation.resource) {
          case 'obra':
            queriesToInvalidate = invalidationHelpers.afterCreateObra(validTenantId);
            break;
          case 'despesa':
            queriesToInvalidate = invalidationHelpers.afterCreateDespesa(operation.obraId, validTenantId);
            break;
          case 'contrato':
            queriesToInvalidate = invalidationHelpers.afterCreateContrato(validTenantId);
            break;
          case 'fornecedor':
            queriesToInvalidate = invalidationHelpers.afterCreateFornecedor(operation.fornecedorType, validTenantId);
            break;
        }
        break;

      case 'update':
        switch (operation.resource) {
          case 'obra':
            queriesToInvalidate = invalidationHelpers.afterUpdateObra(operation.id, validTenantId);
            break;
          case 'despesa':
            queriesToInvalidate = invalidationHelpers.afterUpdateDespesa(operation.id, operation.obraId, validTenantId);
            break;
          case 'fornecedor':
            queriesToInvalidate = [
              operation.fornecedorType === 'pj' 
                ? queryKeys.fornecedorPJ(operation.id, validTenantId)
                : queryKeys.fornecedorPF(operation.id, validTenantId),
              operation.fornecedorType === 'pj'
                ? queryKeys.fornecedoresPJ(validTenantId)
                : queryKeys.fornecedoresPF(validTenantId),
            ];
            break;
        }
        break;

      case 'delete':
        switch (operation.resource) {
          case 'obra':
            queriesToInvalidate = invalidationHelpers.afterDeleteObra(operation.id, validTenantId);
            // Remover queries específicas da obra deletada
            queryClient.removeQueries({ queryKey: queryKeys.obra(operation.id, validTenantId) });
            queryClient.removeQueries({ queryKey: queryKeys.despesasPorObra(operation.id, validTenantId) });
            queryClient.removeQueries({ queryKey: queryKeys.metricasObra(operation.id, validTenantId) });
            break;
          case 'despesa':
            queriesToInvalidate = invalidationHelpers.afterCreateDespesa(operation.obraId, validTenantId);
            queryClient.removeQueries({ queryKey: queryKeys.despesa(operation.id, validTenantId) });
            break;
        }
        break;
    }

    // Executar invalidações em paralelo
    await Promise.allSettled(
      queriesToInvalidate.map(queryKey =>
        queryClient.invalidateQueries({ queryKey })
      )
    );
  };

  // Invalidação por background refresh (menos intrusiva)
  const backgroundRefresh = async (resource: keyof typeof queryKeys, id?: string) => {
    if (!validTenantId) return;

    const keyFn = queryKeys[resource];
    if (typeof keyFn !== 'function') return;

    const queryKey = id ? keyFn(id, validTenantId) : keyFn(validTenantId);
    
    // Refetch silencioso sem mostrar loading
    await queryClient.refetchQueries({ 
      queryKey,
      type: 'active', // Apenas queries ativas
    });
  };

  // Invalidação inteligente baseada no tempo
  const smartInvalidate = async (resource: keyof typeof queryKeys, maxAge = 5 * 60 * 1000) => {
    if (!validTenantId) return;

    const keyFn = queryKeys[resource];
    if (typeof keyFn !== 'function') return;

    const queryKey = keyFn(validTenantId);
    const queryState = queryClient.getQueryState(queryKey);
    
    // Só invalidar se os dados são antigos
    if (queryState?.dataUpdatedAt && (Date.now() - queryState.dataUpdatedAt) > maxAge) {
      await queryClient.invalidateQueries({ queryKey });
    }
  };

  // Invalidação em lote para múltiplas operações
  const batchInvalidate = async (operations: Array<{
    resource: keyof typeof queryKeys;
    id?: string;
  }>) => {
    if (!validTenantId) return;

    const invalidations = operations.map(({ resource, id }) => {
      const keyFn = queryKeys[resource];
      if (typeof keyFn !== 'function') return null;
      
      const queryKey = id ? keyFn(id, validTenantId) : keyFn(validTenantId);
      return queryClient.invalidateQueries({ queryKey });
    }).filter(Boolean);

    await Promise.allSettled(invalidations);
  };

  // Optimistic update com rollback
  const optimisticUpdate = async <TData>(
    queryKey: readonly unknown[],
    updateFn: (oldData: TData | undefined) => TData,
    mutationPromise: Promise<TData>
  ) => {
    // Cancelar queries em andamento
    await queryClient.cancelQueries({ queryKey });
    
    // Snapshot dos dados atuais
    const previousData = queryClient.getQueryData<TData>(queryKey);
    
    // Aplicar update otimista
    queryClient.setQueryData(queryKey, updateFn);
    
    try {
      // Aguardar mutação
      const result = await mutationPromise;
      
      // Se sucesso, atualizar com dados reais
      queryClient.setQueryData(queryKey, result);
      
      return result;
    } catch (_error) {
      // Se erro, reverter para dados anteriores
      queryClient.setQueryData(queryKey, previousData);
      throw error;
    }
  };

  // Invalidação condicional
  const conditionalInvalidate = async (
    condition: () => boolean,
    queryKey: readonly unknown[]
  ) => {
    if (condition()) {
      await queryClient.invalidateQueries({ queryKey });
    }
  };

  // Limpeza de cache inteligente
  const intelligentCacheCleanup = () => {
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;

    queries.forEach(query => {
      const { queryKey, state } = query;
      const lastUpdate = state.dataUpdatedAt;
      const isStale = query.isStale();
      const hasObservers = query.getObserversCount() > 0;

      // Remover queries antigas sem observadores
      if (!hasObservers && lastUpdate && (now - lastUpdate) > oneHour) {
        queryClient.removeQueries({ queryKey });
        return;
      }

      // Invalidar queries stale que são observadas
      if (hasObservers && isStale && lastUpdate && (now - lastUpdate) > thirtyMinutes) {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  };

  return {
    invalidateAfterMutation,
    backgroundRefresh,
    smartInvalidate,
    batchInvalidate,
    optimisticUpdate,
    conditionalInvalidate,
    intelligentCacheCleanup,
  };
};

export default useOptimizedInvalidation;