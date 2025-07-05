/**
 * 🛠️ Serviço API para SINAPI Manutenções
 * 
 * Gerencia todas as operações relacionadas aos dados de manutenção
 * do SINAPI, incluindo busca unificada, validação de códigos e histórico.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secure-logger";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

/**
 * Representa um item SINAPI (normal ou manutenção)
 */
export interface SinapiItem {
  id: string;
  codigo_sinapi: number;
  descricao: string;
  tipo: string;
  fonte: 'normal' | 'manutencao';
  data_referencia: string;
  tipo_manutencao?: string;
  status_atual: 'ativo' | 'desativado' | 'alterado';
  ultima_alteracao?: string;
  historico_alteracoes?: SinapiManutencao[];
}

/**
 * Registro de manutenção SINAPI
 */
export interface SinapiManutencao {
  id: string;
  codigo_sinapi: number;
  descricao: string;
  tipo: string;
  tipo_manutencao: string;
  data_referencia: string;
  created_at?: string;
}

/**
 * Filtros para busca unificada
 */
export interface FiltrosBuscaUnificada {
  termo?: string;
  codigo_sinapi?: number;
  incluir_manutencoes?: boolean;
  tipos_manutencao?: string[];
  status?: ('ativo' | 'desativado' | 'alterado')[];
  data_inicio?: Date;
  data_fim?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Resultado de validação de código
 */
export interface ValidacaoResult {
  codigo: number;
  existe: boolean;
  ativo: boolean;
  alteracoes_recentes: boolean;
  ultima_alteracao?: string;
  tipo_ultima_alteracao?: string;
  alternativas_sugeridas?: SinapiItem[];
  mensagem: string;
}

/**
 * Resposta paginada
 */
export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  total_paginas: number;
  limit: number;
}

// ====================================
// 🔍 BUSCA UNIFICADA
// ====================================

/**
 * Busca unificada que combina dados normais e de manutenção
 */
export const buscarSinapiUnificado = async (
  filtros: FiltrosBuscaUnificada = {}
): Promise<RespostaPaginada<SinapiItem>> => {
  try {
    const {
      termo,
      codigo_sinapi,
      status = ['ativo'],
      limit = 20,
      offset = 0
    } = filtros;

    secureLogger.info("Iniciando busca SINAPI unificada", filtros);

    // ✅ CORREÇÃO: Usar tabela correta com 500k+ registros
    let query = supabase
      .from("sinapi_dados_oficiais")
      .select("*", { count: "exact" })
      .order("codigo_sinapi", { ascending: true })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (codigo_sinapi) {
      query = query.eq("codigo_sinapi", codigo_sinapi);
    }

    if (termo && termo.trim()) {
      query = query.ilike("descricao_insumo", `%${termo.trim()}%`);
    }

    // Filtro por status ativo
    if (status.includes('ativo')) {
      query = query.eq("ativo", true);
    }

    const { data, count, error } = await query;

    if (error) {
      secureLogger.error("Erro na busca SINAPI unificada", error, filtros);
      throw error;
    }

    // Processar resultados para formato unificado
    const itensProcessados: SinapiItem[] = (data || []).map((item: {
      id: string;
      codigo_sinapi: string | number;
      descricao_insumo: string;
      tipo_insumo?: string;
      mes_referencia?: string;
      ativo?: boolean;
      updated_at?: string;
      created_at?: string;
    }) => ({
      id: item.id,
      codigo_sinapi: parseInt(item.codigo_sinapi),
      descricao: item.descricao_insumo,
      tipo: item.tipo_insumo || 'INSUMO',
      fonte: 'normal' as const,
      data_referencia: item.mes_referencia || new Date().toISOString().split('T')[0],
      status_atual: item.ativo ? 'ativo' : 'desativado',
      ultima_alteracao: item.updated_at || item.created_at
    }));

    const totalPaginas = Math.ceil((count || 0) / limit);
    const pagina = Math.floor(offset / limit) + 1;

    const resultado = {
      dados: itensProcessados,
      total: count || 0,
      pagina,
      total_paginas: totalPaginas,
      limit
    };

    secureLogger.info("Busca SINAPI unificada concluída", {
      total_encontrados: count,
      pagina,
      termo
    });

    return resultado;

  } catch (_error) {
    secureLogger.error("Erro crítico na busca SINAPI unificada", error, filtros);
    throw error;
  }
};

// ====================================
// 🔍 BUSCA POR CÓDIGO ESPECÍFICO
// ====================================

/**
 * Busca histórico completo de um código SINAPI específico
 */
export const buscarHistoricoCodigo = async (codigo: number): Promise<SinapiManutencao[]> => {
  try {
    secureLogger.info("Buscando histórico do código SINAPI", { codigo });

    const { data, error } = await supabase
      .from("sinapi_manutencoes")
      .select("*")
      .eq("codigo_sinapi", codigo)
      .order("data_referencia", { ascending: false });

    if (error) {
      secureLogger.error("Erro ao buscar histórico do código", error, { codigo });
      throw error;
    }

    secureLogger.info("Histórico do código obtido com sucesso", {
      codigo,
      total_alteracoes: data?.length || 0
    });

    return data || [];

  } catch (_error) {
    secureLogger.error("Erro crítico ao buscar histórico", error, { codigo });
    throw error;
  }
};

// ====================================
// ✅ VALIDAÇÃO DE CÓDIGOS
// ====================================

/**
 * Valida um código SINAPI e retorna informações sobre seu status
 */
export const validarCodigoSinapi = async (codigo: number): Promise<ValidacaoResult> => {
  try {
    secureLogger.info("Validando código SINAPI", { codigo });

    // Buscar histórico do código
    const historico = await buscarHistoricoCodigo(codigo);

    if (historico.length === 0) {
      return {
        codigo,
        existe: false,
        ativo: false,
        alteracoes_recentes: false,
        mensagem: "Código não encontrado na base de dados SINAPI"
      };
    }

    // Analisar última alteração
    const ultimaAlteracao = historico[0];
    const tipoUltimaAlteracao = ultimaAlteracao.tipo_manutencao;
    
    // Determinar se está ativo
    const ativo = !tipoUltimaAlteracao.includes('DESATIV') && 
                  !tipoUltimaAlteracao.includes('COMPOSIÇÃO DESATIVADA');

    // Verificar alterações recentes (últimos 90 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 90);
    const ultimaData = new Date(ultimaAlteracao.data_referencia);
    const alteracoesRecentes = ultimaData >= dataLimite;

    // Buscar alternativas se desativado
    let alternativasSugeridas: SinapiItem[] = [];
    if (!ativo) {
      // Buscar códigos similares ativos por descrição parcial
      const termoBusca = ultimaAlteracao.descricao.split(' ').slice(0, 3).join(' ');
      const resultadoBusca = await buscarSinapiUnificado({
        termo: termoBusca,
        status: ['ativo'],
        limit: 3
      });
      alternativasSugeridas = resultadoBusca.dados.filter(item => item.codigo_sinapi !== codigo);
    }

    const resultado: ValidacaoResult = {
      codigo,
      existe: true,
      ativo,
      alteracoes_recentes,
      ultima_alteracao: ultimaAlteracao.data_referencia,
      tipo_ultima_alteracao: tipoUltimaAlteracao,
      alternativas_sugeridas: alternativasSugeridas,
      mensagem: ativo 
        ? (alteracoesRecentes ? "Código ativo com alterações recentes" : "Código ativo")
        : "Código desativado - verificar alternativas sugeridas"
    };

    secureLogger.info("Validação de código concluída", {
      codigo,
      ativo,
      alteracoes_recentes,
      total_alternativas: alternativasSugeridas.length
    });

    return resultado;

  } catch (_error) {
    secureLogger.error("Erro crítico na validação de código", error, { codigo });
    throw error;
  }
};

// ====================================
// 📊 ESTATÍSTICAS E MÉTRICAS
// ====================================

/**
 * Obtém estatísticas gerais dos dados SINAPI Manutenções
 */
export const obterEstatisticasManutencoes = async () => {
  try {
    secureLogger.info("Obtendo estatísticas de manutenções SINAPI");

    // Total de registros
    const { count: totalRegistros } = await supabase
      .from("sinapi_manutencoes")
      .select("*", { count: "exact", head: true });

    // Registros por tipo de manutenção
    const { data: porTipo } = await supabase
      .from("sinapi_manutencoes")
      .select("tipo_manutencao")
      .then(({ data }) => {
        const contagem = (data || []).reduce((acc, item) => {
          acc[item.tipo_manutencao] = (acc[item.tipo_manutencao] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return { data: Object.entries(contagem).map(([tipo, qtd]) => ({ tipo, qtd })) };
      });

    // Registros dos últimos 6 meses
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - 6);
    
    const { count: registrosRecentes } = await supabase
      .from("sinapi_manutencoes")
      .select("*", { count: "exact", head: true })
      .gte("data_referencia", dataLimite.toISOString().split('T')[0]);

    const estatisticas = {
      total_registros: totalRegistros || 0,
      registros_recentes: registrosRecentes || 0,
      por_tipo: porTipo || [],
      ultima_atualizacao: new Date().toISOString()
    };

    secureLogger.info("Estatísticas obtidas com sucesso", estatisticas);

    return estatisticas;

  } catch (_error) {
    secureLogger.error("Erro ao obter estatísticas", error);
    throw error;
  }
};

// ====================================
// 🔧 FUNÇÕES AUXILIARES
// ====================================



// ====================================
// 📤 EXPORT PRINCIPAL
// ====================================

export const sinapiManutencoes = {
  buscarUnificado: buscarSinapiUnificado,
  buscarHistorico: buscarHistoricoCodigo,
  validarCodigo: validarCodigoSinapi,
  obterEstatisticas: obterEstatisticasManutencoes
};

export default sinapiManutencoes;