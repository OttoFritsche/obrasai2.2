import { supabase } from '@/integrations/supabase/client';
import type { AlertaDesvio, ConfiguracaoAlerta, FiltrosAlertas } from '@/hooks/useAlertasDesvio';

export interface CalcularDesvioParams {
  obra_id: string;
  tenant_id: string;
  trigger_type?: 'manual' | 'automatic' | 'scheduled';
}

export interface CalcularDesvioResponse {
  success: boolean;
  alertas_gerados: number;
  desvios_calculados: {
    geral: {
      percentual: number;
      valor_orcado: number;
      valor_realizado: number;
      valor_desvio: number;
    };
    por_categoria: Array<{
      categoria: string;
      percentual: number;
      valor_orcado: number;
      valor_realizado: number;
      valor_desvio: number;
    }>;
  };
  error?: string;
}

export interface EstatisticasAlertas {
  total_alertas: number;
  alertas_por_tipo: {
    BAIXO: number;
    MEDIO: number;
    ALTO: number;
    CRITICO: number;
  };
  alertas_por_status: {
    ATIVO: number;
    VISUALIZADO: number;
    RESOLVIDO: number;
    IGNORADO: number;
  };
  obras_com_alertas: number;
  media_desvio: number;
  maior_desvio: {
    obra_nome: string;
    percentual: number;
    valor: number;
  };
}

class AlertasApi {
  /**
   * Busca alertas com filtros opcionais
   */
  async buscarAlertas(filtros?: FiltrosAlertas): Promise<AlertaDesvio[]> {
    try {
      let query = supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras:obra_id (
            id,
            nome,
            status,
            endereco,
            data_inicio,
            data_fim_prevista
          )
        `);

      // Aplicar filtros
      if (filtros?.status && filtros.status.length > 0) {
        query = query.in('status', filtros.status);
      }
      
      if (filtros?.tipo_alerta && filtros.tipo_alerta.length > 0) {
        query = query.in('tipo_alerta', filtros.tipo_alerta);
      }
      
      if (filtros?.obra_id) {
        query = query.eq('obra_id', filtros.obra_id);
      }
      
      if (filtros?.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }
      
      if (filtros?.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      throw new Error('Falha ao carregar alertas de desvio');
    }
  }

  /**
   * Busca um alerta específico por ID
   */
  async buscarAlertaPorId(id: string): Promise<AlertaDesvio | null> {
    try {
      const { data, error } = await supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras:obra_id (
            id,
            nome,
            status,
            endereco
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar alerta:', error);
      return null;
    }
  }

  /**
   * Atualiza o status de um alerta
   */
  async atualizarStatusAlerta(
    id: string, 
    status: 'ATIVO' | 'VISUALIZADO' | 'RESOLVIDO' | 'IGNORADO'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('alertas_desvio')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status do alerta:', error);
      throw new Error('Falha ao atualizar status do alerta');
    }
  }

  /**
   * Calcula desvios orçamentários para uma obra específica
   */
  async calcularDesviosObra(params: CalcularDesvioParams): Promise<CalcularDesvioResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-budget-deviation', {
        body: {
          obra_id: params.obra_id,
          tenant_id: params.tenant_id,
          trigger_type: params.trigger_type || 'manual'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao calcular desvios:', error);
      throw new Error('Falha ao calcular desvios orçamentários');
    }
  }

  /**
   * Busca configurações de alerta para uma obra
   */
  async buscarConfiguracaoAlerta(obraId: string): Promise<ConfiguracaoAlerta | null> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_alerta')
        .select('*')
        .eq('obra_id', obraId)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração de alerta:', error);
      return null;
    }
  }

  /**
   * Cria ou atualiza configuração de alerta para uma obra
   */
  async salvarConfiguracaoAlerta(config: ConfiguracaoAlerta): Promise<ConfiguracaoAlerta> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_alerta')
        .upsert({
          ...config,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'obra_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao salvar configuração de alerta:', error);
      throw new Error('Falha ao salvar configuração de alerta');
    }
  }

  /**
   * Remove configuração de alerta (marca como inativo)
   */
  async removerConfiguracaoAlerta(obraId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('configuracoes_alerta')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('obra_id', obraId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover configuração de alerta:', error);
      throw new Error('Falha ao remover configuração de alerta');
    }
  }

  /**
   * Busca estatísticas gerais dos alertas
   */
  async buscarEstatisticasAlertas(filtros?: {
    data_inicio?: string;
    data_fim?: string;
    obra_id?: string;
  }): Promise<EstatisticasAlertas> {
    try {
      let query = supabase
        .from('alertas_desvio')
        .select(`
          tipo_alerta,
          status,
          percentual_desvio,
          valor_desvio,
          obras:obra_id (
            nome
          )
        `);

      if (filtros?.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }
      
      if (filtros?.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }
      
      if (filtros?.obra_id) {
        query = query.eq('obra_id', filtros.obra_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const alertas = data || [];
      
      // Calcular estatísticas
      const alertas_por_tipo = {
        BAIXO: alertas.filter(a => a.tipo_alerta === 'BAIXO').length,
        MEDIO: alertas.filter(a => a.tipo_alerta === 'MEDIO').length,
        ALTO: alertas.filter(a => a.tipo_alerta === 'ALTO').length,
        CRITICO: alertas.filter(a => a.tipo_alerta === 'CRITICO').length
      };

      const alertas_por_status = {
        ATIVO: alertas.filter(a => a.status === 'ATIVO').length,
        VISUALIZADO: alertas.filter(a => a.status === 'VISUALIZADO').length,
        RESOLVIDO: alertas.filter(a => a.status === 'RESOLVIDO').length,
        IGNORADO: alertas.filter(a => a.status === 'IGNORADO').length
      };

      const obras_unicas = new Set(alertas.map(a => a.obras?.nome)).size;
      
      const desvios = alertas.map(a => Math.abs(a.percentual_desvio));
      const media_desvio = desvios.length > 0 
        ? desvios.reduce((acc, val) => acc + val, 0) / desvios.length 
        : 0;

      const alertaComMaiorDesvio = alertas.reduce((max, atual) => {
        return Math.abs(atual.percentual_desvio) > Math.abs(max.percentual_desvio || 0) 
          ? atual 
          : max;
      }, { percentual_desvio: 0, valor_desvio: 0, obras: { nome: '' } });

      return {
        total_alertas: alertas.length,
        alertas_por_tipo,
        alertas_por_status,
        obras_com_alertas: obras_unicas,
        media_desvio: Number(media_desvio.toFixed(2)),
        maior_desvio: {
          obra_nome: alertaComMaiorDesvio.obras?.nome || 'N/A',
          percentual: Number(alertaComMaiorDesvio.percentual_desvio?.toFixed(2) || 0),
          valor: alertaComMaiorDesvio.valor_desvio || 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas dos alertas');
    }
  }

  /**
   * Busca alertas ativos para uma obra específica
   */
  async buscarAlertasAtivosPorObra(obraId: string): Promise<AlertaDesvio[]> {
    try {
      const { data, error } = await supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras:obra_id (
            id,
            nome,
            status
          )
        `)
        .eq('obra_id', obraId)
        .eq('status', 'ATIVO')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alertas ativos:', error);
      throw new Error('Falha ao carregar alertas ativos da obra');
    }
  }

  /**
   * Marca múltiplos alertas como visualizados
   */
  async marcarAlertasComoVisualizados(alertaIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('alertas_desvio')
        .update({ 
          status: 'VISUALIZADO',
          updated_at: new Date().toISOString()
        })
        .in('id', alertaIds)
        .eq('status', 'ATIVO');

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar alertas como visualizados:', error);
      throw new Error('Falha ao atualizar status dos alertas');
    }
  }

  /**
   * Remove alertas antigos (mais de 90 dias e já resolvidos/ignorados)
   */
  async limparAlertasAntigos(): Promise<number> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 90);

      const { data, error } = await supabase
        .from('alertas_desvio')
        .delete()
        .in('status', ['RESOLVIDO', 'IGNORADO'])
        .lt('created_at', dataLimite.toISOString())
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao limpar alertas antigos:', error);
      throw new Error('Falha ao limpar alertas antigos');
    }
  }
}

// Instância singleton
export const alertasApi = new AlertasApi();
export default alertasApi;