/**
 * 📦 Barrel de Componentes SINAPI
 * 
 * Exportações centralizadas para todos os componentes
 * relacionados às funcionalidades SINAPI.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

// Componentes principais
export { default as ConsultaAvancada } from "./ConsultaAvancada";
export { default as HistoricoModal } from "./HistoricoModal";
export { 
  default as ManutencaoIndicator,
  ManutencaoIndicatorCompact,
  ManutencaoIndicatorWithTooltip
} from "./ManutencaoIndicator";

// Componentes da Fase 2 - Edge Functions e Monitoramento
export { MonitoringSinapi } from "./MonitoringSinapi";

// Types e interfaces
export type { default as ConsultaAvancadaProps } from "./ConsultaAvancada";

// Re-exportar hooks para conveniência
export {
  useSinapiBuscaInteligente,
  useSinapiBuscaUnificada,
  useSinapiEstatisticas,
  useSinapiHistorico,
  useSinapiValidacao} from "@/hooks/useSinapiManutencoes";

// Re-exportar hooks da Fase 2 - Edge Functions
export {
  useSinapiEdgeFunctions
} from "@/hooks/useSinapiEdgeFunctions";

// Re-exportar serviços para conveniência
export { 
  buscarHistoricoCodigo,
  buscarSinapiUnificado,
  obterEstatisticasManutencoes,
  default as sinapiManutencoes,
  validarCodigoSinapi} from "@/services/sinapiManutencoes";

// Re-exportar tipos principais
export type {
  FiltrosBuscaUnificada,
  RespostaPaginada,
  SinapiItem,
  SinapiManutencao,
  ValidacaoResult} from "@/services/sinapiManutencoes";

// Re-exportar tipos da Fase 2
export type {
  CodigoValidacao,
  ImpactoOrcamento,
  ValidacaoBatchResponse} from "@/hooks/useSinapiEdgeFunctions"; 