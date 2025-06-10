import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlertaDesvio {
  id: string;
  obra_id: string;
  tipo_alerta: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  percentual_desvio: number;
  valor_orcado: number;
  valor_realizado: number;
  valor_desvio: number;
  categoria?: string;
  etapa?: string;
  descricao: string;
  status: 'ATIVO' | 'VISUALIZADO' | 'RESOLVIDO' | 'IGNORADO';
  created_at: string;
  updated_at: string;
  obras?: {
    id: string;
    nome: string;
    status: string;
  };
}

export interface ConfiguracaoAlerta {
  id?: string;
  obra_id: string;
  threshold_baixo: number;
  threshold_medio: number;
  threshold_alto: number;
  notificar_email: boolean;
  notificar_dashboard: boolean;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResumoAlertas {
  total: number;
  ativos: number;
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
  resolvidos: number;
  ignorados: number;
}

export interface FiltrosAlertas {
  status?: string[];
  tipo_alerta?: string[];
  obra_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const useAlertasDesvio = () => {
  const [alertas, setAlertas] = useState<AlertaDesvio[]>([]);
  const [resumo, setResumo] = useState<ResumoAlertas>({
    total: 0,
    ativos: 0,
    baixo: 0,
    medio: 0,
    alto: 0,
    critico: 0,
    resolvidos: 0,
    ignorados: 0
  });
  const [loading, setLoading] = useState(true);
  const [calculandoDesvios, setCalculandoDesvios] = useState(false);
  const { toast } = useToast();

  const calcularResumo = useCallback((alertasList: AlertaDesvio[]): ResumoAlertas => {
    const alertasAtivos = alertasList.filter(a => a.status === 'ATIVO');
    
    return {
      total: alertasList.length,
      ativos: alertasAtivos.length,
      baixo: alertasAtivos.filter(a => a.tipo_alerta === 'BAIXO').length,
      medio: alertasAtivos.filter(a => a.tipo_alerta === 'MEDIO').length,
      alto: alertasAtivos.filter(a => a.tipo_alerta === 'ALTO').length,
      critico: alertasAtivos.filter(a => a.tipo_alerta === 'CRITICO').length,
      resolvidos: alertasList.filter(a => a.status === 'RESOLVIDO').length,
      ignorados: alertasList.filter(a => a.status === 'IGNORADO').length
    };
  }, []);

  const carregarAlertas = useCallback(async (filtros?: FiltrosAlertas) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras:obra_id (
            id,
            nome,
            status
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

      const alertasList = data || [];
      setAlertas(alertasList);
      setResumo(calcularResumo(alertasList));
      
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas de desvio.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [calcularResumo, toast]);

  const calcularDesviosObra = useCallback(async (obraId: string, tenantId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-budget-deviation', {
        body: {
          obra_id: obraId,
          tenant_id: tenantId,
          trigger_type: 'manual'
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Erro ao calcular desvio para obra ${obraId}:`, error);
      throw error;
    }
  }, []);

  const calcularDesviosTodasObras = useCallback(async () => {
    setCalculandoDesvios(true);
    try {
      // Buscar todas as obras (o status será calculado no frontend)
      const { data: obras, error: obrasError } = await supabase
        .from('obras')
        .select('id, tenant_id, nome, data_inicio, data_prevista_termino');

      if (obrasError) throw obrasError;

      // Filtrar obras ativas baseado nas datas (mesmo critério do getObraStatus)
      const obrasAtivas = obras?.filter(obra => {
        const hoje = new Date();
        const dataInicio = obra.data_inicio ? new Date(obra.data_inicio) : null;
        
        // Incluir obras que já iniciaram ou estão planejadas para iniciar
        return dataInicio && dataInicio <= hoje;
      }) || [];

      if (!obrasAtivas || obrasAtivas.length === 0) {
        toast({
          title: "Informação",
          description: "Nenhuma obra ativa encontrada para calcular desvios.",
        });
        return { sucessos: 0, erros: 0 };
      }

      let sucessos = 0;
      let erros = 0;
      const resultados = [];

      // Processar obras em lotes para evitar sobrecarga
      const batchSize = 5;
      for (let i = 0; i < obrasAtivas.length; i += batchSize) {
        const batch = obrasAtivas.slice(i, i + batchSize);
        
        const promises = batch.map(async (obra) => {
          try {
            const resultado = await calcularDesviosObra(obra.id, obra.tenant_id);
            if (resultado?.success) {
              sucessos++;
              return { obra: obra.nome, sucesso: true, alertas: resultado.alertas_gerados || 0 };
            } else {
              erros++;
              return { obra: obra.nome, sucesso: false, erro: resultado?.error || 'Erro desconhecido' };
            }
          } catch (error) {
            erros++;
            return { obra: obra.nome, sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' };
          }
        });

        const batchResults = await Promise.all(promises);
        resultados.push(...batchResults);
        
        // Pequena pausa entre lotes
        if (i + batchSize < obras.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const mensagem = sucessos > 0 
        ? `${sucessos} obras processadas com sucesso${erros > 0 ? `, ${erros} com erro` : ''}.`
        : `Erro ao processar ${erros} obras.`;

      toast({
        title: sucessos > 0 ? "Cálculo Concluído" : "Erro no Cálculo",
        description: mensagem,
        variant: sucessos > 0 ? "default" : "destructive"
      });

      // Recarregar alertas após o cálculo
      await carregarAlertas();
      
      return { sucessos, erros, resultados };
    } catch (error) {
      console.error('Erro ao calcular desvios:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao calcular desvios orçamentários.",
        variant: "destructive"
      });
      return { sucessos: 0, erros: 1, resultados: [] };
    } finally {
      setCalculandoDesvios(false);
    }
  }, [calcularDesviosObra, carregarAlertas, toast]);

  const atualizarStatusAlerta = useCallback(async (alertaId: string, novoStatus: 'ATIVO' | 'VISUALIZADO' | 'RESOLVIDO' | 'IGNORADO') => {
    try {
      const { error } = await supabase
        .from('alertas_desvio')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertaId);

      if (error) throw error;

      // Atualizar estado local
      setAlertas(prev => {
        const novosAlertas = prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, status: novoStatus, updated_at: new Date().toISOString() }
            : alerta
        );
        setResumo(calcularResumo(novosAlertas));
        return novosAlertas;
      });

      const statusLabels = {
        ATIVO: 'ativo',
        VISUALIZADO: 'visualizado',
        RESOLVIDO: 'resolvido',
        IGNORADO: 'ignorado'
      };

      toast({
        title: "Sucesso",
        description: `Alerta marcado como ${statusLabels[novoStatus]}.`,
      });
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do alerta.",
        variant: "destructive"
      });
    }
  }, [calcularResumo, toast]);

  const obterAlertasPorObra = useCallback((obraId: string) => {
    return alertas.filter(alerta => alerta.obra_id === obraId);
  }, [alertas]);

  const obterAlertasAtivos = useCallback(() => {
    return alertas.filter(alerta => alerta.status === 'ATIVO');
  }, [alertas]);

  const obterAlertasPorTipo = useCallback((tipo: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO') => {
    return alertas.filter(alerta => alerta.tipo_alerta === tipo && alerta.status === 'ATIVO');
  }, [alertas]);

  // Carregar alertas na inicialização
  useEffect(() => {
    carregarAlertas();
  }, [carregarAlertas]);

  return {
    // Estados
    alertas,
    resumo,
    loading,
    calculandoDesvios,
    
    // Ações
    carregarAlertas,
    calcularDesviosObra,
    calcularDesviosTodasObras,
    atualizarStatusAlerta,
    
    // Utilitários
    obterAlertasPorObra,
    obterAlertasAtivos,
    obterAlertasPorTipo
  };
};

export default useAlertasDesvio;