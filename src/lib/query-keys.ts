/**
 * Factory para chaves de query padronizadas
 * Centraliza e padroniza todas as query keys da aplicação
 * 
 * Benefícios:
 * - Evita duplicação de chaves
 * - Facilita invalidação seletiva
 * - Melhora debugging e rastreabilidade
 * - Padroniza hierarquia de cache
 */

export const queryKeys = {
  // Chaves base para cada recurso
  obras: (tenantId: string) => ['obras', tenantId] as const,
  obra: (id: string, tenantId: string) => ['obra', id, tenantId] as const,
  
  despesas: (tenantId: string) => ['despesas', tenantId] as const,
  despesa: (id: string, tenantId: string) => ['despesa', id, tenantId] as const,
  despesasPorObra: (obraId: string, tenantId: string) => ['despesas', 'obra', obraId, tenantId] as const,
  
  fornecedoresPJ: (tenantId: string) => ['fornecedores-pj', tenantId] as const,
  fornecedorPJ: (id: string, tenantId: string) => ['fornecedor-pj', id, tenantId] as const,
  
  fornecedoresPF: (tenantId: string) => ['fornecedores-pf', tenantId] as const,
  fornecedorPF: (id: string, tenantId: string) => ['fornecedor-pf', id, tenantId] as const,
  
  notasFiscais: (tenantId: string) => ['notas-fiscais', tenantId] as const,
  notaFiscal: (id: string, tenantId: string) => ['nota-fiscal', id, tenantId] as const,
  
  contratos: (tenantId: string) => ['contratos', tenantId] as const,
  contrato: (id: string, tenantId: string) => ['contrato', id, tenantId] as const,
  
  orcamentos: (tenantId: string) => ['orcamentos', tenantId] as const,
  orcamento: (id: string, tenantId: string) => ['orcamento', id, tenantId] as const,
  
  construtoras: (tenantId: string) => ['construtoras', tenantId] as const,
  construtora: (id: string, tenantId: string) => ['construtora', id, tenantId] as const,
  
  // IA e Analytics
  iaContratoInteracoes: (userId: string) => ['ia-contratos-interacoes', userId] as const,
  iaInsights: (obraId: string, tenantId: string) => ['ia-insights', obraId, tenantId] as const,
  iaChat: (contextId?: string) => ['ia-chat', contextId || 'global'] as const,
  
  // SINAPI
  sinapiComposicoes: () => ['sinapi-composicoes'] as const,
  sinapiInsumos: () => ['sinapi-insumos'] as const,
  sinapiManutencoes: (filtros?: object) => ['sinapi-manutencoes', filtros] as const,
  notificacoesSinapi: (filtros?: object) => ['notificacoes-sinapi', filtros] as const,
  
  // Alertas
  alertasDesvio: (tenantId: string) => ['alertas-desvio', tenantId] as const,
  alertasAvancados: (tenantId: string) => ['alertas-avancados', tenantId] as const,
  
  // Métricas e Dashboard
  metricas: (tenantId: string) => ['metricas', tenantId] as const,
  metricasObra: (obraId: string, tenantId: string) => ['metricas', 'obra', obraId, tenantId] as const,
  
  // Dados auxiliares
  cep: (cep: string) => ['cep', cep] as const,
  cnpj: (cnpj: string) => ['cnpj', cnpj] as const,
  
  // Tenant
  tenants: (userId: string) => ['tenants', userId] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
} as const;

/**
 * Helpers para invalidação seletiva e otimizada de queries
 */
export const invalidationHelpers = {
  // Invalidar todas as queries de um tenant
  allTenantQueries: (tenantId: string) => [
    queryKeys.obras(tenantId),
    queryKeys.despesas(tenantId),
    queryKeys.fornecedoresPJ(tenantId),
    queryKeys.fornecedoresPF(tenantId),
    queryKeys.notasFiscais(tenantId),
    queryKeys.contratos(tenantId),
    queryKeys.orcamentos(tenantId),
    queryKeys.construtoras(tenantId),
    queryKeys.alertasDesvio(tenantId),
    queryKeys.alertasAvancados(tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  // Invalidar queries relacionadas a uma obra específica
  obraRelatedQueries: (obraId: string, tenantId: string) => [
    queryKeys.obra(obraId, tenantId),
    queryKeys.despesasPorObra(obraId, tenantId),
    queryKeys.iaInsights(obraId, tenantId),
    queryKeys.metricasObra(obraId, tenantId),
  ],
  
  // Invalidar queries de fornecedores (PJ e PF)
  fornecedoresQueries: (tenantId: string) => [
    queryKeys.fornecedoresPJ(tenantId),
    queryKeys.fornecedoresPF(tenantId),
  ],
  
  // Invalidação granular por operação
  afterCreateObra: (tenantId: string) => [
    queryKeys.obras(tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  afterUpdateObra: (obraId: string, tenantId: string) => [
    queryKeys.obra(obraId, tenantId),
    queryKeys.obras(tenantId),
    queryKeys.metricasObra(obraId, tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  afterDeleteObra: (obraId: string, tenantId: string) => [
    queryKeys.obras(tenantId),
    queryKeys.metricas(tenantId),
    // Não invalidar queries específicas da obra deletada (serão removidas automaticamente)
  ],
  
  afterCreateDespesa: (obraId: string, tenantId: string) => [
    queryKeys.despesas(tenantId),
    queryKeys.despesasPorObra(obraId, tenantId),
    queryKeys.metricasObra(obraId, tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  afterUpdateDespesa: (despesaId: string, obraId: string, tenantId: string) => [
    queryKeys.despesa(despesaId, tenantId),
    queryKeys.despesas(tenantId),
    queryKeys.despesasPorObra(obraId, tenantId),
    queryKeys.metricasObra(obraId, tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  afterCreateContrato: (tenantId: string) => [
    queryKeys.contratos(tenantId),
    queryKeys.metricas(tenantId),
  ],
  
  afterCreateFornecedor: (tipo: 'pj' | 'pf', tenantId: string) => [
    tipo === 'pj' ? queryKeys.fornecedoresPJ(tenantId) : queryKeys.fornecedoresPF(tenantId),
  ],
};

/**
 * Prefetch helpers - queries que devem ser carregadas antecipadamente
 */
export const prefetchHelpers = {
  // Ao entrar no dashboard, prefetch dados básicos
  dashboardEssentials: (tenantId: string) => [
    queryKeys.obras(tenantId),
    queryKeys.metricas(tenantId),
    queryKeys.alertasDesvio(tenantId),
  ],
  
  // Ao abrir uma obra, prefetch dados relacionados
  obraDetails: (obraId: string, tenantId: string) => [
    queryKeys.obra(obraId, tenantId),
    queryKeys.despesasPorObra(obraId, tenantId),
    queryKeys.metricasObra(obraId, tenantId),
  ],
  
  // Ao abrir orçamento, prefetch SINAPI
  orcamentoDetails: () => [
    queryKeys.sinapiComposicoes(),
    queryKeys.sinapiInsumos(),
  ],
};

export default queryKeys;