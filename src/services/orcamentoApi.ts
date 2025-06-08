/**
 * 🎯 API Service para Orçamento Paramétrico
 * 
 * Este arquivo contém todos os serviços de API para interação
 * com o banco de dados relacionados ao orçamento paramétrico.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";
import { sanitizeFormData } from "@/lib/input-sanitizer";
import { secureLogger } from "@/lib/secure-logger";
import { analytics } from "@/services/analyticsApi";
import {
  OrcamentoParametricoInput,
  OrcamentoParametrico,
  ItemOrcamento,
  BaseCustoRegional,
  CoeficienteTecnico,
  ComparacaoOrcamentoReal,
  FiltrosOrcamento,
  CriarOrcamentoRequest,
  AtualizarOrcamentoRequest,
  CalcularOrcamentoRequest,
  CalcularOrcamentoResponse,
  TipoObra,
  PadraoObra,
  StatusOrcamento
} from "@/lib/validations/orcamento";

// ====================================
// 🎯 TIPOS AUXILIARES
// ====================================

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ====================================
// 🏗️ ORÇAMENTOS PARAMÉTRICOS - CRUD Principal
// ====================================

/**
 * API para operações com orçamentos paramétricos
 */
export const orcamentosParametricosApi = {
  /**
   * Lista todos os orçamentos do usuário com paginação e filtros
   */
  getAll: async (
    filtros: FiltrosOrcamento = {}
  ): Promise<PaginatedResponse<OrcamentoParametrico>> => {
    try {
      const {
        tipo_obra,
        padrao_obra,
        status,
        estado,
        cidade,
        custo_min,
        custo_max,
        data_inicio,
        data_fim,
        limit = 20,
        offset = 0
      } = filtros;

      // Construir query base
      let query = supabase
        .from("orcamentos_parametricos")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros dinâmicos
      if (tipo_obra) query = query.eq("tipo_obra", tipo_obra);
      if (padrao_obra) query = query.eq("padrao_obra", padrao_obra);
      if (status) query = query.eq("status", status);
      if (estado) query = query.eq("estado", estado);
      if (cidade) query = query.ilike("cidade", `%${cidade}%`);
      if (custo_min) query = query.gte("custo_estimado", custo_min);
      if (custo_max) query = query.lte("custo_estimado", custo_max);
      if (data_inicio) query = query.gte("created_at", data_inicio.toISOString());
      if (data_fim) query = query.lte("created_at", data_fim.toISOString());

      const { data, count, error } = await query;

      if (error) {
        secureLogger.error("Failed to fetch orçamentos paramétricos", error, filtros);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        data: data || [],
        total: count || 0,
        page,
        totalPages
      };
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.getAll", error, filtros);
      throw error;
    }
  },

  /**
   * Busca um orçamento específico por ID
   */
  getById: async (id: string): Promise<OrcamentoParametrico> => {
    try {
      const { data, error } = await supabase
        .from("orcamentos_parametricos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        secureLogger.error("Failed to fetch orçamento by ID", error, { orcamentoId: id });
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.getById", error, { orcamentoId: id });
      throw error;
    }
  },

  /**
   * Cria um novo orçamento paramétrico
   */
  create: async (orcamentoData: CriarOrcamentoRequest): Promise<OrcamentoParametrico> => {
    try {
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Obter tenant_id do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.tenant_id) {
        throw new Error("Tenant não encontrado");
      }

      // Sanitizar dados de entrada
      const sanitizedData = sanitizeFormData(orcamentoData);

      // Dados para inserção
      const insertData = {
        usuario_id: user.id,
        tenant_id: profile.tenant_id,
        nome_orcamento: sanitizedData.nome_orcamento,
        descricao: sanitizedData.descricao || null,
        tipo_obra: sanitizedData.tipo_obra,
        padrao_obra: sanitizedData.padrao_obra,
        estado: sanitizedData.estado,
        cidade: sanitizedData.cidade,
        cep: sanitizedData.cep || null,
        area_total: sanitizedData.area_total,
        area_construida: sanitizedData.area_construida || null,
        area_detalhada: sanitizedData.area_detalhada || null,
        especificacoes: sanitizedData.especificacoes || null,
        parametros_entrada: sanitizedData.parametros_entrada || null,
        obra_id: sanitizedData.obra_id || null,
        custo_estimado: 0.01,
        custo_m2: 0.01,
        status: "RASCUNHO" as StatusOrcamento
      };

      const { data, error } = await supabase
        .from("orcamentos_parametricos")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create orçamento paramétrico", error, { 
          userId: user.id, 
          tenantId: profile.tenant_id 
        });
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.create", error);
      throw error;
    }
  },

  /**
   * Atualiza um orçamento existente
   */
  update: async (id: string, orcamentoData: AtualizarOrcamentoRequest): Promise<OrcamentoParametrico> => {
    try {
      // Sanitizar dados de entrada
      const sanitizedData = sanitizeFormData(orcamentoData);

      // Preparar dados para atualização (apenas campos fornecidos)
      const updateData: any = {};
      
      if (sanitizedData.nome_orcamento !== undefined) updateData.nome_orcamento = sanitizedData.nome_orcamento;
      if (sanitizedData.descricao !== undefined) updateData.descricao = sanitizedData.descricao;
      if (sanitizedData.tipo_obra !== undefined) updateData.tipo_obra = sanitizedData.tipo_obra;
      if (sanitizedData.padrao_obra !== undefined) updateData.padrao_obra = sanitizedData.padrao_obra;
      if (sanitizedData.estado !== undefined) updateData.estado = sanitizedData.estado;
      if (sanitizedData.cidade !== undefined) updateData.cidade = sanitizedData.cidade;
      if (sanitizedData.cep !== undefined) updateData.cep = sanitizedData.cep;
      if (sanitizedData.area_total !== undefined) updateData.area_total = sanitizedData.area_total;
      if (sanitizedData.area_construida !== undefined) updateData.area_construida = sanitizedData.area_construida;
      if (sanitizedData.area_detalhada !== undefined) updateData.area_detalhada = sanitizedData.area_detalhada;
      if (sanitizedData.especificacoes !== undefined) updateData.especificacoes = sanitizedData.especificacoes;
      if (sanitizedData.parametros_entrada !== undefined) updateData.parametros_entrada = sanitizedData.parametros_entrada;

      const { data, error } = await supabase
        .from("orcamentos_parametricos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update orçamento paramétrico", error, { orcamentoId: id });
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.update", error, { orcamentoId: id });
      throw error;
    }
  },

  /**
   * Exclui um orçamento
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("orcamentos_parametricos")
        .delete()
        .eq("id", id);

      if (error) {
        secureLogger.error("Failed to delete orçamento paramétrico", error, { orcamentoId: id });
        throw error;
      }

      return true;
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.delete", error, { orcamentoId: id });
      throw error;
    }
  },

  /**
   * Duplica um orçamento existente
   */
  duplicate: async (id: string, novoNome?: string): Promise<OrcamentoParametrico> => {
    try {
      // Buscar orçamento original
      const original = await orcamentosParametricosApi.getById(id);

      // Criar cópia com novo nome
      const copia: CriarOrcamentoRequest = {
        nome_orcamento: novoNome || `${original.nome_orcamento} (Cópia)`,
        descricao: original.descricao,
        tipo_obra: original.tipo_obra,
        padrao_obra: original.padrao_obra,
        estado: original.estado,
        cidade: original.cidade,
        cep: original.cep,
        area_total: original.area_total,
        area_construida: original.area_construida,
        area_detalhada: original.area_detalhada,
        especificacoes: original.especificacoes,
        parametros_entrada: original.parametros_entrada,
        obra_id: original.obra_id
      };

      return await orcamentosParametricosApi.create(copia);
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.duplicate", error, { orcamentoId: id });
      throw error;
    }
  },

  /**
   * Busca orçamentos vinculados a uma obra específica
   */
  getByObra: async (obraId: string): Promise<OrcamentoParametrico[]> => {
    try {
      const { data, error } = await supabase
        .from("orcamentos_parametricos")
        .select("*")
        .eq("obra_id", obraId)
        .order("created_at", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch orçamentos by obra", error, { obraId });
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in orcamentosParametricosApi.getByObra", error, { obraId });
      throw error;
    }
  }
};

// ====================================
// 🧮 CÁLCULO DE ORÇAMENTO COM IA
// ====================================

/**
 * API para cálculo inteligente de orçamentos
 */
export const calculoOrcamentoApi = {
  /**
   * Calcula orçamento usando Edge Function com fallback automático
   */
  calcular: async (request: CalcularOrcamentoRequest): Promise<CalcularOrcamentoResponse> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      console.log('📡 Tentando Edge Function v9.0.0 (composição detalhada)...');

      // TENTATIVA 1: Usar ai-calculate-budget-v9 (composição detalhada) - PRIORIDADE MÁXIMA
      try {
        const { data, error } = await supabase.functions.invoke('ai-calculate-budget-v9', {
          body: {
            orcamento_id: request.orcamento_id,
            forcar_recalculo: request.forcar_recalculo || false
          },
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!error && data && data.success) {
          console.log('✅ Cálculo v9.0.0 concluído com sucesso!');
          console.log(`💰 Custo: R$ ${data.custo_estimado.toLocaleString('pt-BR')}`);
          console.log(`📋 Itens: ${data.itens_inseridos}`);
          console.log(`🏗️ Etapas: ${data.composicao_detalhada?.resumo_etapas?.length || 0}`);
          console.log(`👷 Mão de obra: ${data.composicao_detalhada?.percentual_mao_obra}%`);
          
          // 📊 Track orçamento gerado
          await analytics.trackAIUsage('orcamento', {
            orcamento_id: request.orcamento_id,
            custo_estimado: data.custo_estimado,
            custo_m2: data.custo_m2,
            itens_inseridos: data.itens_inseridos,
            tempo_calculo_ms: data.estatisticas?.tempo_calculo_ms,
            versao_funcao: '9.0.0',
            forcar_recalculo: request.forcar_recalculo
          });
          
          return {
            success: true,
            orcamento: data.orcamento || {
              id: data.orcamento_id,
              custo_estimado: data.custo_estimado,
              custo_m2: data.custo_m2
            },
            itens: data.itens || [],
            tempo_calculo_ms: data.estatisticas?.tempo_calculo_ms || 0,
            estatisticas: {
              ...data.debug,
              fonte_dados: "composicao_detalhada_v9",
              versao: "9.0.0",
              total_etapas: data.composicao_detalhada?.resumo_etapas?.length || 0,
              percentual_mao_obra: data.composicao_detalhada?.percentual_mao_obra || 0,
              percentual_material: data.composicao_detalhada?.percentual_material || 0,
              composicao_detalhada: data.composicao_detalhada
            }
          };
        }

        console.warn('⚠️ Edge Function v9.0.0 falhou, tentando fallback...');
      } catch (v9Error) {
        console.warn('⚠️ Edge Function v9.0.0 não disponível, usando fallback:', v9Error);
      }

      // FALLBACK: Usar ai-calculate-budget (função estável)
      console.log('🔄 Usando Edge Function fallback (ai-calculate-budget)...');
      
      const { data, error } = await supabase.functions.invoke('ai-calculate-budget', {
        body: {
          orcamento_id: request.orcamento_id,
          forcar_recalculo: request.forcar_recalculo || false
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('❌ Erro Edge Function fallback:', error);
        throw new Error(`Erro no cálculo: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro desconhecido no cálculo');
      }

      console.log('✅ Cálculo fallback concluído:', {
        custoEstimado: data.custo_estimado,
        itensInseridos: data.itens?.length || 0,
        versao: data.debug?.versao || 'fallback',
        tempoMs: data.estatisticas?.tempo_calculo_ms
      });

      return {
        success: true,
        orcamento: data.orcamento || {
          id: data.orcamento_id,
          custo_estimado: data.custo_estimado,
          custo_m2: data.custo_m2
        },
        itens: data.itens || [],
        tempo_calculo_ms: data.estatisticas?.tempo_calculo_ms || 0,
        estatisticas: {
          ...data.estatisticas,
          fonte_dados: "fallback_function",
          versao: data.debug?.versao || "fallback"
        }
      };
    } catch (error) {
      console.error('❌ Erro calculoOrcamentoApi (todas as tentativas falharam):', error);
      throw error;
    }
  },

  /**
   * Recalcula um orçamento existente (usado no frontend)
   */
  recalcular: async (orcamentoId: string): Promise<CalcularOrcamentoResponse> => {
    try {
      return await calculoOrcamentoApi.calcular({
        orcamento_id: orcamentoId,
        forcar_recalculo: true
      });
    } catch (error) {
      secureLogger.error("Error in calculoOrcamentoApi.recalcular", error, { orcamentoId });
      throw error;
    }
  }
};

// ====================================
// 📋 ITENS DE ORÇAMENTO
// ====================================

/**
 * API para itens detalhados do orçamento
 */
export const itensOrcamentoApi = {
  /**
   * Lista todos os itens de um orçamento
   */
  getByOrcamento: async (orcamentoId: string): Promise<ItemOrcamento[]> => {
    try {
      const { data, error } = await supabase
        .from("itens_orcamento")
        .select("*")
        .eq("orcamento_id", orcamentoId)
        .order("categoria", { ascending: true });

      if (error) {
        secureLogger.error("Failed to fetch itens by orçamento", error, { orcamentoId });
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in itensOrcamentoApi.getByOrcamento", error, { orcamentoId });
      throw error;
    }
  },

  /**
   * Cria um novo item
   */
  create: async (item: Omit<ItemOrcamento, 'id'>): Promise<ItemOrcamento> => {
    try {
      const sanitizedItem = sanitizeFormData(item);

      const { data, error } = await supabase
        .from("itens_orcamento")
        .insert(sanitizedItem)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create item orçamento", error);
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in itensOrcamentoApi.create", error);
      throw error;
    }
  },

  /**
   * Cria múltiplos itens de uma vez
   */
  createMultiple: async (itens: Omit<ItemOrcamento, 'id'>[]): Promise<ItemOrcamento[]> => {
    try {
      const sanitizedItens = itens.map(item => sanitizeFormData(item));

      const { data, error } = await supabase
        .from("itens_orcamento")
        .insert(sanitizedItens)
        .select();

      if (error) {
        secureLogger.error("Failed to create multiple itens orçamento", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in itensOrcamentoApi.createMultiple", error);
      throw error;
    }
  },

  /**
   * Atualiza um item
   */
  update: async (id: string, item: Partial<ItemOrcamento>): Promise<ItemOrcamento> => {
    try {
      const sanitizedItem = sanitizeFormData(item);

      const { data, error } = await supabase
        .from("itens_orcamento")
        .update(sanitizedItem)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update item orçamento", error, { itemId: id });
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in itensOrcamentoApi.update", error, { itemId: id });
      throw error;
    }
  },

  /**
   * Exclui um item
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("itens_orcamento")
        .delete()
        .eq("id", id);

      if (error) {
        secureLogger.error("Failed to delete item orçamento", error, { itemId: id });
        throw error;
      }

      return true;
    } catch (error) {
      secureLogger.error("Error in itensOrcamentoApi.delete", error, { itemId: id });
      throw error;
    }
  }
};

// ====================================
// 💰 BASES DE CUSTOS REGIONAIS
// ====================================

/**
 * API para bases de custos regionais
 */
export const baseCustosRegionaisApi = {
  /**
   * Busca base de custos por critérios específicos
   */
  getByCriteria: async (
    estado: string,
    cidade: string,
    tipoObra: TipoObra,
    padraoObra: PadraoObra
  ): Promise<BaseCustoRegional | null> => {
    try {
      const { data, error } = await supabase
        .from("bases_custos_regionais")
        .select("*")
        .eq("estado", estado)
        .eq("cidade", cidade)
        .eq("tipo_obra", tipoObra)
        .eq("padrao_obra", padraoObra)
        .eq("ativo", true)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        secureLogger.error("Failed to fetch base custo by criteria", error, {
          estado, cidade, tipoObra, padraoObra
        });
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in baseCustosRegionaisApi.getByCriteria", error, {
        estado, cidade, tipoObra, padraoObra
      });
      throw error;
    }
  },

  /**
   * Lista todas as bases de custos ativas
   */
  getAll: async (): Promise<BaseCustoRegional[]> => {
    try {
      const { data, error } = await supabase
        .from("bases_custos_regionais")
        .select("*")
        .eq("ativo", true)
        .order("estado", { ascending: true });

      if (error) {
        secureLogger.error("Failed to fetch all bases custos", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in baseCustosRegionaisApi.getAll", error);
      throw error;
    }
  }
};

// ====================================
// ⚙️ COEFICIENTES TÉCNICOS
// ====================================

/**
 * API para coeficientes técnicos
 */
export const coeficientesTecnicosApi = {
  /**
   * Busca coeficientes por tipo e padrão de obra
   */
  getByTipoEPadrao: async (
    tipoObra: TipoObra,
    padraoObra: PadraoObra
  ): Promise<CoeficienteTecnico[]> => {
    try {
      const { data, error } = await supabase
        .from("coeficientes_tecnicos")
        .select("*")
        .eq("tipo_obra", tipoObra)
        .eq("padrao_obra", padraoObra)
        .eq("ativo", true)
        .order("categoria", { ascending: true });

      if (error) {
        secureLogger.error("Failed to fetch coeficientes by tipo/padrão", error, {
          tipoObra, padraoObra
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in coeficientesTecnicosApi.getByTipoEPadrao", error, {
        tipoObra, padraoObra
      });
      throw error;
    }
  }
};

// ====================================
// 📊 COMPARAÇÕES E ANÁLISES
// ====================================

/**
 * API para comparações orçamento vs realizado
 */
export const comparacoesApi = {
  /**
   * Cria uma nova comparação
   */
  create: async (comparacao: Omit<ComparacaoOrcamentoReal, 'id'>): Promise<ComparacaoOrcamentoReal> => {
    try {
      const sanitizedComparacao = sanitizeFormData(comparacao);

      const { data, error } = await supabase
        .from("comparacoes_orcamento_real")
        .insert(sanitizedComparacao)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create comparação", error);
        throw error;
      }

      return data;
    } catch (error) {
      secureLogger.error("Error in comparacoesApi.create", error);
      throw error;
    }
  },

  /**
   * Lista comparações por obra
   */
  getByObra: async (obraId: string): Promise<ComparacaoOrcamentoReal[]> => {
    try {
      const { data, error } = await supabase
        .from("comparacoes_orcamento_real")
        .select("*")
        .eq("obra_id", obraId)
        .order("data_analise", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch comparações by obra", error, { obraId });
        throw error;
      }

      return data || [];
    } catch (error) {
      secureLogger.error("Error in comparacoesApi.getByObra", error, { obraId });
      throw error;
    }
  }
};

// ====================================
// 🎯 UTILITÁRIOS E HELPERS
// ====================================

/**
 * Utilitários para orçamento
 */
export const orcamentoUtils = {
  /**
   * Formata valor monetário para exibição
   */
  formatarValor: (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  /**
   * Calcula percentual de desvio
   */
  calcularDesvio: (valorOrcado: number, valorReal: number): number => {
    if (valorOrcado === 0) return 0;
    return ((valorReal - valorOrcado) / valorOrcado) * 100;
  },

  /**
   * Valida se orçamento pode ser convertido em obra
   */
  podeConverterEmObra: (orcamento: OrcamentoParametrico): boolean => {
    return orcamento.status === "CONCLUIDO" && 
           orcamento.custo_estimado > 0 && 
           !orcamento.obra_id;
  }
};

// ====================================
// 📤 EXPORT DEFAULT
// ====================================

export default {
  orcamentosParametricosApi,
  calculoOrcamentoApi,
  itensOrcamentoApi,
  baseCustosRegionaisApi,
  coeficientesTecnicosApi,
  comparacoesApi,
  orcamentoUtils
}; 