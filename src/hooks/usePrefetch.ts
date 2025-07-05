import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth';
import { prefetchHelpers,queryKeys } from '@/lib/query-keys';
import { despesasApi, metricasApi,obrasApi } from '@/services/api';

import { useTenantValidation } from './useTenantValidation';

/**
 * Hook para prefetch estratégico de dados baseado no contexto da aplicação
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { validTenantId } = useTenantValidation();
  const { user } = useAuth();

  // Prefetch dados essenciais do dashboard
  const prefetchDashboardEssentials = async () => {
    if (!validTenantId) return;

    const queries = prefetchHelpers.dashboardEssentials(validTenantId);
    
    await Promise.allSettled([
      // Obras
      queryClient.prefetchQuery({
        queryKey: queries[0],
        queryFn: () => obrasApi.getAll(validTenantId),
        staleTime: 2 * 60 * 1000, // 2 minutos
      }),
      
      // Métricas básicas
      queryClient.prefetchQuery({
        queryKey: queries[1],
        queryFn: () => metricasApi?.getDashboard?.(validTenantId) || Promise.resolve({}),
        staleTime: 5 * 60 * 1000, // 5 minutos
      }),
      
      // Alertas de desvio
      queryClient.prefetchQuery({
        queryKey: queries[2],
        queryFn: () => Promise.resolve([]), // Implementar quando API estiver pronta
        staleTime: 3 * 60 * 1000, // 3 minutos
      }),
    ]);
  };

  // Prefetch dados de uma obra específica
  const prefetchObraDetails = async (obraId: string) => {
    if (!validTenantId || !obraId) return;

    const queries = prefetchHelpers.obraDetails(obraId, validTenantId);
    
    await Promise.allSettled([
      // Dados da obra
      queryClient.prefetchQuery({
        queryKey: queries[0],
        queryFn: () => obrasApi.getById(obraId, validTenantId),
        staleTime: 2 * 60 * 1000,
      }),
      
      // Despesas da obra
      queryClient.prefetchQuery({
        queryKey: queries[1],
        queryFn: () => despesasApi?.getByObra?.(obraId, validTenantId) || Promise.resolve([]),
        staleTime: 1 * 60 * 1000, // 1 minuto (mais dinâmico)
      }),
      
      // Métricas da obra
      queryClient.prefetchQuery({
        queryKey: queries[2],
        queryFn: () => metricasApi?.getObra?.(obraId, validTenantId) || Promise.resolve({}),
        staleTime: 3 * 60 * 1000,
      }),
    ]);
  };

  // Prefetch dados para orçamento
  const prefetchOrcamentoData = async () => {
    const queries = prefetchHelpers.orcamentoDetails();
    
    await Promise.allSettled([
      // Composições SINAPI
      queryClient.prefetchQuery({
        queryKey: queries[0],
        queryFn: () => Promise.resolve([]), // Implementar quando API estiver pronta
        staleTime: 30 * 60 * 1000, // 30 minutos (dados estáticos)
      }),
      
      // Insumos SINAPI
      queryClient.prefetchQuery({
        queryKey: queries[1],
        queryFn: () => Promise.resolve([]), // Implementar quando API estiver pronta
        staleTime: 30 * 60 * 1000,
      }),
    ]);
  };

  // Prefetch dados relacionados a fornecedores
  const prefetchFornecedoresData = async () => {
    if (!validTenantId) return;

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: queryKeys.fornecedoresPJ(validTenantId),
        queryFn: () => Promise.resolve([]), // Implementar quando API estiver pronta
        staleTime: 10 * 60 * 1000, // 10 minutos
      }),
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.fornecedoresPF(validTenantId),
        queryFn: () => Promise.resolve([]), // Implementar quando API estiver pronta
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  };

  // Limpar cache antigo para otimizar memória
  const cleanupOldCache = () => {
    queryClient.getQueryCache().getAll().forEach(query => {
      const isStale = query.isStale();
      const lastDataUpdate = query.state.dataUpdatedAt;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      
      // Remover queries antigas e não utilizadas
      if (isStale && lastDataUpdate < oneHourAgo) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  };

  return {
    prefetchDashboardEssentials,
    prefetchObraDetails,
    prefetchOrcamentoData,
    prefetchFornecedoresData,
    cleanupOldCache,
  };
};

/**
 * Hook para prefetch automático baseado na rota atual
 */
export const useAutoPrefetch = (routePath?: string) => {
  const { 
    prefetchDashboardEssentials, 
    prefetchOrcamentoData, 
    prefetchFornecedoresData,
    cleanupOldCache 
  } = usePrefetch();
  const { validTenantId } = useTenantValidation();

  useEffect(() => {
    if (!validTenantId || !routePath) return;

    const prefetchByRoute = async () => {
      switch (true) {
        case routePath.includes('/dashboard') && routePath === '/dashboard':
          await prefetchDashboardEssentials();
          break;
          
        case routePath.includes('/orcamento'):
          await prefetchOrcamentoData();
          break;
          
        case routePath.includes('/fornecedores'):
          await prefetchFornecedoresData();
          break;
          
        default:
          // Para outras rotas, fazer prefetch básico
          await prefetchDashboardEssentials();
      }
    };

    // Delay pequeno para não bloquear a renderização inicial
    const timeoutId = setTimeout(prefetchByRoute, 500);
    
    return () => clearTimeout(timeoutId);
  }, [routePath, validTenantId, prefetchDashboardEssentials, prefetchOrcamentoData, prefetchFornecedoresData]);

  // Cleanup periódico a cada 30 minutos
  useEffect(() => {
    const intervalId = setInterval(cleanupOldCache, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [cleanupOldCache]);
};

/**
 * Hook para prefetch sob demanda (hover, click, etc.)
 */
export const useOnDemandPrefetch = () => {
  const { prefetchObraDetails } = usePrefetch();

  // Prefetch quando usuário hover sobre um item
  const prefetchOnHover = (obraId: string) => {
    // Debounce para evitar múltiplas chamadas
    const timeoutId = setTimeout(() => {
      prefetchObraDetails(obraId);
    }, 200);

    return () => clearTimeout(timeoutId);
  };

  // Prefetch quando usuário clica em um link
  const prefetchOnClick = (obraId: string) => {
    prefetchObraDetails(obraId);
  };

  return {
    prefetchOnHover,
    prefetchOnClick,
  };
};

/**
 * Hook para verificar se dados já estão em cache
 */
export const useCacheStatus = () => {
  const queryClient = useQueryClient();
  const { validTenantId } = useTenantValidation();

  const isCached = (queryKey: readonly unknown[]) => {
    const query = queryClient.getQueryState(queryKey);
    return query?.data !== undefined && !query.isStale;
  };

  const getCacheStatus = (resource: keyof typeof queryKeys) => {
    if (!validTenantId) return { cached: false, stale: true };

    const keyFn = queryKeys[resource];
    if (typeof keyFn !== 'function') return { cached: false, stale: true };

    const queryKey = keyFn(validTenantId);
    const query = queryClient.getQueryState(queryKey);
    
    return {
      cached: query?.data !== undefined,
      stale: query?.isStale ?? true,
      lastUpdated: query?.dataUpdatedAt,
    };
  };

  return {
    isCached,
    getCacheStatus,
  };
};

export default usePrefetch;