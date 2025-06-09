/**
 * 🔗 Hook para Edge Functions SINAPI
 * 
 * Integração com as Edge Functions de validação em lote
 * e sistema de notificações da Fase 2.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface ValidacaoBatchRequest {
  codigos: number[];
  incluir_alternativas?: boolean;
  incluir_historico?: boolean;
}

interface CodigoValidacao {
  codigo: number;
  status: 'ativo' | 'desativado' | 'alterado' | 'nao_encontrado';
  descricao?: string;
  alteracoes_recentes: boolean;
  data_ultima_alteracao?: string;
  alternativas?: number[];
  detalhes?: {
    tipo_manutencao?: string;
    historico_alteracoes?: {
      data: string;
      tipo: string;
      descricao: string;
    }[];
  };
}

interface ValidacaoBatchResponse {
  resultados: CodigoValidacao[];
  resumo: {
    total: number;
    ativos: number;
    desativados: number;
    alterados: number;
    nao_encontrados: number;
  };
  processado_em: string;
}

interface NotificacaoRequest {
  tipo: 'webhook' | 'verificar_impactos' | 'configurar_preferencias' | 'listar_notificacoes';
  dados?: Record<string, unknown>;
}

interface ImpactoOrcamento {
  orcamento_id: string;
  nome_orcamento: string;
  codigos_impactados: number[];
  tipo_impacto: 'desativacao' | 'alteracao' | 'preco';
  urgencia: 'baixa' | 'media' | 'alta';
}

// ====================================
// 🧩 HOOK PRINCIPAL
// ====================================

export const useSinapiEdgeFunctions = () => {
  const queryClient = useQueryClient();

  // ====================================
  // 📡 FUNÇÕES DE API
  // ====================================

  const chamarEdgeFunction = useCallback(async <T>(
    functionName: string, 
    payload: Record<string, unknown>
  ): Promise<T> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro na API: ${response.status}`);
    }

    return response.json();
  }, []);

  // ====================================
  // 🔍 VALIDAÇÃO EM LOTE
  // ====================================

  const validacaoEmLoteMutation = useMutation({
    mutationFn: (request: ValidacaoBatchRequest) => 
      chamarEdgeFunction<ValidacaoBatchResponse>('validate-sinapi-batch', request),
    onSuccess: (data) => {
      const { resumo } = data;
      if (resumo.desativados > 0 || resumo.nao_encontrados > 0) {
        toast.warning(
          `⚠️ Encontrados ${resumo.desativados} código(s) desativado(s) e ${resumo.nao_encontrados} não encontrado(s)`
        );
      } else if (resumo.alterados > 0) {
        toast.info(`ℹ️ ${resumo.alterados} código(s) com alterações recentes`);
      } else {
        toast.success(`✅ Todos os ${resumo.total} códigos estão válidos!`);
      }
    },
    onError: (error) => {
      console.error('Erro na validação em lote:', error);
      toast.error('Erro ao validar códigos em lote');
    }
  });

  const validarCodigosEmLote = useCallback((
    codigos: number[], 
    opcoes?: { incluirAlternativas?: boolean; incluirHistorico?: boolean }
  ) => {
    if (codigos.length === 0) {
      toast.warning('Nenhum código para validar');
      return;
    }

    if (codigos.length > 100) {
      toast.error('Máximo de 100 códigos por validação');
      return;
    }

    return validacaoEmLoteMutation.mutateAsync({
      codigos,
      incluir_alternativas: opcoes?.incluirAlternativas || false,
      incluir_historico: opcoes?.incluirHistorico || false
    });
  }, [validacaoEmLoteMutation]);

  // ====================================
  // 🔔 SISTEMA DE NOTIFICAÇÕES
  // ====================================

  const notificacaoMutation = useMutation({
    mutationFn: (request: NotificacaoRequest) => 
      chamarEdgeFunction('sinapi-notifications', request),
    onSuccess: (data: { sucesso?: boolean; tipo_resposta?: string }) => {
      if (data.sucesso && data.tipo_resposta === 'preferencias_configuradas') {
        toast.success('✅ Preferências de notificação salvas!');
      }
    },
    onError: (error) => {
      console.error('Erro nas notificações:', error);
      toast.error('Erro ao processar notificação');
    }
  });

  const verificarImpactos = useCallback(async (): Promise<ImpactoOrcamento[]> => {
    const response = await notificacaoMutation.mutateAsync({
      tipo: 'verificar_impactos'
    });
    
    return response.dados?.impactos_encontrados || [];
  }, [notificacaoMutation]);

  const configurarPreferenciasNotificacao = useCallback((preferencias: {
    email_ativo: boolean;
    notif_desktop: boolean;
    codigos_favoritos: number[];
    tipos_alteracao: string[];
  }) => {
    return notificacaoMutation.mutateAsync({
      tipo: 'configurar_preferencias',
      dados: { preferencias }
    });
  }, [notificacaoMutation]);

  // ====================================
  // 📜 LISTAGEM DE NOTIFICAÇÕES
  // ====================================

  const useNotificacoes = (filtros?: {
    data_inicio?: string;
    data_fim?: string;
    apenas_nao_lidas?: boolean;
  }) => {
    return useQuery({
      queryKey: ['notificacoes-sinapi', filtros],
      queryFn: async () => {
        const response = await chamarEdgeFunction('sinapi-notifications', {
          tipo: 'listar_notificacoes',
          dados: { filtros }
        });
        return response.dados?.notificacoes || [];
      },
      refetchInterval: 30000, // Recarrega a cada 30 segundos
    });
  };

  // ====================================
  // 📊 MÉTRICAS E UTILITÁRIOS
  // ====================================

  const analisarValidacao = useMemo(() => ({
    /**
     * Categoriza códigos por status
     */
    categorizarCodigos: (resultados: CodigoValidacao[]) => ({
      ativos: resultados.filter(r => r.status === 'ativo'),
      desativados: resultados.filter(r => r.status === 'desativado'),
      alterados: resultados.filter(r => r.status === 'alterado'),
      naoEncontrados: resultados.filter(r => r.status === 'nao_encontrado'),
    }),

    /**
     * Obtém códigos problemáticos
     */
    obterProblematicos: (resultados: CodigoValidacao[]) => 
      resultados.filter(r => 
        r.status === 'desativado' || 
        r.status === 'nao_encontrado'
      ),

    /**
     * Gera relatório de qualidade
     */
    gerarRelatorioQualidade: (resultados: CodigoValidacao[]) => {
      const total = resultados.length;
      const problematicos = resultados.filter(r => 
        r.status === 'desativado' || r.status === 'nao_encontrado'
      ).length;
      
      const qualidade = total > 0 ? ((total - problematicos) / total) * 100 : 0;
      
      return {
        total,
        problematicos,
        qualidade: Math.round(qualidade),
        status: qualidade >= 90 ? 'excelente' : 
                qualidade >= 70 ? 'boa' : 
                qualidade >= 50 ? 'regular' : 'ruim'
      };
    }
  }), []);

  // ====================================
  // 🎯 ESTADOS E STATUS
  // ====================================

  const isValidandoLote = validacaoEmLoteMutation.isPending;
  const isProcessandoNotificacao = notificacaoMutation.isPending;

  return {
    // Validação em lote
    validarCodigosEmLote,
    isValidandoLote,
    ultimaValidacao: validacaoEmLoteMutation.data,
    
    // Notificações
    verificarImpactos,
    configurarPreferenciasNotificacao,
    useNotificacoes,
    isProcessandoNotificacao,
    
    // Análise e utilitários
    analisarValidacao,
    
    // Estados
    erroValidacao: validacaoEmLoteMutation.error,
    erroNotificacao: notificacaoMutation.error,
  };
};

export type { 
  CodigoValidacao, 
  ValidacaoBatchResponse, 
  ImpactoOrcamento 
};