/**
 * 🔍 Hook para Validação de Orçamentos com SINAPI
 * 
 * Hook customizado para validação automática de códigos SINAPI
 * em orçamentos, com alertas e sugestões de códigos alternativos.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { useCallback } from "react";
import { toast } from "sonner";

import { useSinapiValidacao } from "./useSinapiManutencoes";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface CodigoValidacao {
  codigo: number;
  descricao: string;
  status: 'ativo' | 'desativado' | 'alterado';
  validacao?: {
    valido: boolean;
    alertas: string[];
    sugestoes?: number[];
  };
}

interface RelatorioValidacao {
  total: number;
  validos: number;
  comProblemas: number;
  desativados: number;
  alterados: number;
  recomendacoes: string[];
}

// ====================================
// 🧩 HOOK PRINCIPAL
// ====================================

export const useOrcamentoValidation = () => {
  const { validarCodigos } = useSinapiValidacao();

  /**
   * Valida uma lista de códigos SINAPI
   */
  const validarCodigosOrcamento = useCallback(async (
    codigos: number[]
  ): Promise<CodigoValidacao[]> => {
    try {
      if (codigos.length === 0) return [];

      const validacoes = await validarCodigos(codigos);
      
      return codigos.map((codigo, index) => ({
        codigo,
        descricao: `Código ${codigo}`, // Será substituído por dados reais
        status: 'ativo' as const, // Será substituído por dados reais
        validacao: validacoes[index]
      }));
    } catch (_error) {
      console.error('Erro na validação de códigos:', error);
      toast.error('Erro ao validar códigos SINAPI');
      return [];
    }
  }, [validarCodigos]);

  /**
   * Gera relatório de validação para um orçamento
   */
  const gerarRelatorioValidacao = useCallback((
    codigosValidados: CodigoValidacao[]
  ): RelatorioValidacao => {
    const total = codigosValidados.length;
    const validos = codigosValidados.filter(c => c.validacao?.valido).length;
    const comProblemas = total - validos;
    const desativados = codigosValidados.filter(c => c.status === 'desativado').length;
    const alterados = codigosValidados.filter(c => c.status === 'alterado').length;

    const recomendacoes: string[] = [];

    if (desativados > 0) {
      recomendacoes.push(`Substituir ${desativados} código(s) desativado(s)`);
    }

    if (alterados > 0) {
      recomendacoes.push(`Verificar ${alterados} código(s) alterado(s) recentemente`);
    }

    if (comProblemas === 0 && total > 0) {
      recomendacoes.push('Todos os códigos estão válidos! ✅');
    }

    return {
      total,
      validos,
      comProblemas,
      desativados,
      alterados,
      recomendacoes
    };
  }, []);

  /**
   * Executa validação completa com alertas automáticos
   */
  const validarOrcamentoCompleto = useCallback(async (
    codigos: number[]
  ): Promise<{ codigosValidados: CodigoValidacao[]; relatorio: RelatorioValidacao }> => {
    // Mostrar toast de início
    toast.info("🔍 Validando códigos SINAPI...");

    try {
      const codigosValidados = await validarCodigosOrcamento(codigos);
      const relatorio = gerarRelatorioValidacao(codigosValidados);

      // Alertas automáticos baseados no relatório
      if (relatorio.comProblemas === 0) {
        toast.success(`✅ Todos os ${relatorio.total} códigos estão válidos!`);
      } else {
        toast.warning(
          `⚠️ ${relatorio.comProblemas} de ${relatorio.total} código(s) com problemas`
        );
      }

      return { codigosValidados, relatorio };
    } catch (_error) {
      console.error('Erro na validação completa:', error);
      toast.error('Falha na validação dos códigos');
      
      return {
        codigosValidados: [],
        relatorio: {
          total: 0,
          validos: 0,
          comProblemas: 0,
          desativados: 0,
          alterados: 0,
          recomendacoes: ['Erro na validação - tente novamente']
        }
      };
    }
  }, [validarCodigosOrcamento, gerarRelatorioValidacao]);

  /**
   * Verifica se um código específico tem problemas
   */
  const temProblemas = useCallback((codigo: CodigoValidacao): boolean => {
    return !codigo.validacao?.valido || codigo.status === 'desativado';
  }, []);

  /**
   * Obtém sugestões para um código problemático
   */
  const obterSugestoes = useCallback((codigo: CodigoValidacao): number[] => {
    return codigo.validacao?.sugestoes || [];
  }, []);

  /**
   * Filtra códigos por status
   */
  const filtrarPorStatus = useCallback((
    codigos: CodigoValidacao[],
    status: 'ativo' | 'desativado' | 'alterado' | 'problemático'
  ): CodigoValidacao[] => {
    switch (status) {
      case 'ativo':
        return codigos.filter(c => c.status === 'ativo' && c.validacao?.valido);
      case 'desativado':
        return codigos.filter(c => c.status === 'desativado');
      case 'alterado':
        return codigos.filter(c => c.status === 'alterado');
      case 'problemático':
        return codigos.filter(c => temProblemas(c));
      default:
        return codigos;
    }
  }, [temProblemas]);

  return {
    validarCodigosOrcamento,
    validarOrcamentoCompleto,
    gerarRelatorioValidacao,
    temProblemas,
    obterSugestoes,
    filtrarPorStatus
  };
};

export type { CodigoValidacao, RelatorioValidacao }; 