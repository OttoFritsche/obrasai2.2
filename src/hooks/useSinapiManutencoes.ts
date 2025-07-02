/**
 * 🪝 Hooks Customizados para SINAPI Manutenções
 * 
 * Hooks React para gerenciar estado e operações relacionadas
 * aos dados de manutenção SINAPI de forma reativa.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
  sinapiManutencoes,
  type FiltrosBuscaUnificada,
  type ValidacaoResult
} from "@/services/sinapiManutencoes";

// ====================================
// 🎯 CHAVES DE QUERY
// ====================================

const QUERY_KEYS = {
  sinapiUnificado: (filtros: FiltrosBuscaUnificada) => ['sinapi-unificado', filtros],
  historicoCodigo: (codigo: number) => ['sinapi-historico', codigo],
  validacaoCodigo: (codigo: number) => ['sinapi-validacao', codigo],
  estatisticas: () => ['sinapi-estatisticas']
} as const;

// ====================================
// 🔍 HOOK DE BUSCA UNIFICADA
// ====================================

/**
 * Hook para busca unificada SINAPI com paginação e filtros
 */
export const useSinapiBuscaUnificada = (
  filtrosIniciais: FiltrosBuscaUnificada = {}
) => {
  const [filtros, setFiltros] = useState<FiltrosBuscaUnificada>(filtrosIniciais);
  
  const {
    data: resultado,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: QUERY_KEYS.sinapiUnificado(filtros),
    queryFn: () => sinapiManutencoes.buscarUnificado(filtros),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });

  // Funções para atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosBuscaUnificada>) => {
    setFiltros(atual => ({
      ...atual,
      ...novosFiltros,
      offset: 0 // Resetar para primeira página quando filtros mudam
    }));
  }, []);

  const alterarPagina = useCallback((novaPagina: number) => {
    const limit = filtros.limit || 20;
    const novoOffset = (novaPagina - 1) * limit;
    
    setFiltros(atual => ({
      ...atual,
      offset: novoOffset
    }));
  }, [filtros.limit]);

  const buscarPorTermo = useCallback((termo: string) => {
    atualizarFiltros({ termo });
  }, [atualizarFiltros]);

  const buscarPorCodigo = useCallback((codigo: number) => {
    atualizarFiltros({ codigo_sinapi: codigo });
  }, [atualizarFiltros]);

  const toggleIncluirManutencoes = useCallback(() => {
    atualizarFiltros({ 
      incluir_manutencoes: !filtros.incluir_manutencoes 
    });
  }, [filtros.incluir_manutencoes, atualizarFiltros]);

  return {
    // Dados
    dados: resultado?.dados || [],
    total: resultado?.total || 0,
    pagina: resultado?.pagina || 1,
    totalPaginas: resultado?.total_paginas || 1,
    
    // Estados
    isLoading,
    isFetching,
    isError,
    error,
    
    // Filtros atuais
    filtros,
    
    // Ações
    atualizarFiltros,
    alterarPagina,
    buscarPorTermo,
    buscarPorCodigo,
    toggleIncluirManutencoes,
    refetch
  };
};

// ====================================
// 📜 HOOK DE HISTÓRICO DE CÓDIGO
// ====================================

/**
 * Hook para buscar histórico de alterações de um código específico
 */
export const useSinapiHistorico = (codigo?: number) => {
  const {
    data: historico,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.historicoCodigo(codigo!),
    queryFn: () => sinapiManutencoes.buscarHistorico(codigo!),
    enabled: !!codigo,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000 // 30 minutos
  });

  // Dados processados para melhor apresentação
  const dadosProcessados = useMemo(() => {
    if (!historico) return null;

    return {
      total_alteracoes: historico.length,
      ultima_alteracao: historico[0],
      alteracoes_por_tipo: historico.reduce((acc, item) => {
        acc[item.tipo_manutencao] = (acc[item.tipo_manutencao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timeline: historico.map(item => ({
        data: item.data_referencia,
        tipo: item.tipo_manutencao,
        descricao: item.descricao
      }))
    };
  }, [historico]);

  return {
    historico: historico || [],
    dadosProcessados,
    isLoading,
    isError,
    error,
    refetch
  };
};

// ====================================
// ✅ HOOK DE VALIDAÇÃO DE CÓDIGO
// ====================================

/**
 * Hook para validação de códigos SINAPI
 */
export const useSinapiValidacao = () => {
  const queryClient = useQueryClient();
  
  const {
    mutateAsync: validarCodigo,
    isPending: isValidating,
    error: validationError
  } = useMutation({
    mutationFn: (codigo: number) => sinapiManutencoes.validarCodigo(codigo),
    onSuccess: (resultado) => {
      // Cache do resultado para evitar validações repetidas
      queryClient.setQueryData(
        QUERY_KEYS.validacaoCodigo(resultado.codigo),
        resultado
      );
      
      // Mostrar toast baseado no resultado
      if (!resultado.existe) {
        toast.error(`Código ${resultado.codigo} não encontrado na base SINAPI`);
      } else if (!resultado.ativo) {
        toast.warning(`Código ${resultado.codigo} foi desativado - verificar alternativas`);
      } else if (resultado.alteracoes_recentes) {
        toast.info(`Código ${resultado.codigo} teve alterações recentes`);
      } else {
        toast.success(`Código ${resultado.codigo} está ativo e atualizado`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao validar código: ${error.message}`);
    }
  });

  const validarCodigoComCache = useCallback(async (codigo: number): Promise<ValidacaoResult> => {
    // Verificar se já temos o resultado em cache
    const cacheKey = QUERY_KEYS.validacaoCodigo(codigo);
    const cached = queryClient.getQueryData<ValidacaoResult>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Realizar validação
    return await validarCodigo(codigo);
  }, [validarCodigo, queryClient]);

  // Função para validar múltiplos códigos
  const validarCodigos = useCallback(async (codigos: number[]): Promise<ValidacaoResult[]> => {
    const promises = codigos.map(codigo => validarCodigoComCache(codigo));
    return Promise.all(promises);
  }, [validarCodigoComCache]);

  return {
    validarCodigo: validarCodigoComCache,
    validarCodigos, // Função para validar múltiplos códigos
    isValidating,
    validationError
  };
};

// ====================================
// 📊 HOOK DE ESTATÍSTICAS
// ====================================

/**
 * Hook para obter estatísticas dos dados SINAPI Manutenções
 */
export const useSinapiEstatisticas = () => {
  const {
    data: estatisticas,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.estatisticas(),
    queryFn: sinapiManutencoes.obterEstatisticas,
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 1
  });

  return {
    estatisticas: estatisticas || {
      total_registros: 0,
      registros_recentes: 0,
      por_tipo: [],
      ultima_atualizacao: new Date().toISOString()
    },
    isLoading,
    isError,
    error,
    refetch
  };
};

// ====================================
// 🔄 HOOK COMPOSTO PARA BUSCA INTELIGENTE
// ====================================

/**
 * Hook composto que combina busca e validação para uma experiência integrada
 */
export const useSinapiBuscaInteligente = () => {
  const [termoAtual, setTermoAtual] = useState("");
  const [codigoAtual, setCodigoAtual] = useState<number | undefined>();
  
  // Detectar se o termo é um código numérico
  const isCodigoNumerico = useMemo(() => {
    const numero = parseInt(termoAtual);
    return !isNaN(numero) && numero > 0;
  }, [termoAtual]);

  // Configurar filtros baseados no tipo de busca
  const filtros = useMemo((): FiltrosBuscaUnificada => {
    if (isCodigoNumerico) {
      return {
        codigo_sinapi: parseInt(termoAtual),
        incluir_manutencoes: true
      };
    }
    
    return {
      termo: termoAtual,
      incluir_manutencoes: true
    };
  }, [termoAtual, isCodigoNumerico]);

  // Usar hooks específicos
  const busca = useSinapiBuscaUnificada(filtros);
  const { validarCodigo } = useSinapiValidacao();
  
  // Função de busca inteligente
  const buscarInteligente = useCallback(async (termo: string) => {
    setTermoAtual(termo);
    
    // Se é código numérico, também validar
    if (!isNaN(parseInt(termo)) && parseInt(termo) > 0) {
      const codigo = parseInt(termo);
      setCodigoAtual(codigo);
      
      try {
        await validarCodigo(codigo);
      } catch (error) {
        console.error("Erro na validação:", error);
      }
    } else {
      setCodigoAtual(undefined);
    }
  }, [validarCodigo]);

  return {
    // Estado da busca
    termoAtual,
    codigoAtual,
    isCodigoNumerico,
    
    // Resultados da busca
    ...busca,
    
    // Ações
    buscarInteligente,
    limparBusca: () => {
      setTermoAtual("");
      setCodigoAtual(undefined);
    }
  };
};

// ====================================
// 📤 EXPORTS
// ====================================

// Todos os hooks já estão exportados inline com 'export const'
// Removendo exportações duplicadas para evitar erro de sintaxe 