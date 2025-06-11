import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

export interface ConfiguracaoAlertaAvancada {
  id?: string;
  obra_id: string;
  usuario_id: string;
  tenant_id?: string;
  threshold_baixo: number;
  threshold_medio: number;
  threshold_alto: number;
  threshold_critico: number;
  notificar_email: boolean;
  notificar_dashboard: boolean;
  notificar_webhook: boolean;
  webhook_url?: string;
  alertas_por_categoria: boolean;
  alertas_por_etapa: boolean;
  frequencia_verificacao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificacaoAlerta {
  id: string;
  alerta_id: string;
  usuario_id: string;
  tenant_id?: string;
  tipo_notificacao: 'EMAIL' | 'DASHBOARD' | 'WEBHOOK';
  status: 'PENDENTE' | 'ENVIADA' | 'ERRO' | 'LIDA';
  titulo: string;
  mensagem: string;
  dados_extras?: any;
  tentativas: number;
  max_tentativas: number;
  enviada_em?: string;
  lida_em?: string;
  lida?: boolean;
  created_at: string;
  alertas_desvio?: {
    obra_id?: string;
    tipo_alerta?: string;
    percentual_desvio?: number;
    obras?: {
      nome?: string;
    };
  };
}

export interface HistoricoAlerta {
  id: string;
  alerta_id: string;
  obra_id: string;
  usuario_id?: string;
  tenant_id?: string;
  tipo_alerta: string;
  percentual_desvio: number;
  valor_orcado: number;
  valor_realizado: number;
  valor_desvio: number;
  acao: 'CRIADO' | 'VISUALIZADO' | 'RESOLVIDO' | 'IGNORADO' | 'REATIVADO';
  observacoes?: string;
  created_at: string;
  alertas_desvio?: {
    descricao?: string;
    categoria?: string;
    etapa?: string;
  };
}

export interface ResumoNotificacoes {
  total: number;
  nao_lidas: number;
  pendentes: number;
  enviadas: number;
  erros: number;
}

export const useAdvancedAlerts = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoAlertaAvancada[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoAlerta[]>([]);
  const [historico, setHistorico] = useState<HistoricoAlerta[]>([]);
  const [resumoNotificacoes, setResumoNotificacoes] = useState<ResumoNotificacoes>({
    total: 0,
    nao_lidas: 0,
    pendentes: 0,
    enviadas: 0,
    erros: 0
  });
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar configurações de alertas
  const carregarConfiguracoes = useCallback(async (obraId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('configuracoes_alerta_avancadas')
        .select('*')
        .order('created_at', { ascending: false });

      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar configurações:', error);
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de alertas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar notificações
  const carregarNotificacoes = useCallback(async (usuarioId?: string) => {
    try {
      setError(null);
      let query = supabase
        .from('notificacoes_alertas')
        .select(`
          *,
          alertas_desvio:alerta_id (
            obra_id,
            tipo_alerta,
            percentual_desvio,
            obras:obra_id (
              nome
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (usuarioId) {
        query = query.eq('usuario_id', usuarioId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotificacoes((data || []) as NotificacaoAlerta[]);
      calcularResumoNotificacoes((data || []) as NotificacaoAlerta[]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar notificações:', error);
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Carregar histórico
  const carregarHistorico = useCallback(async (alertaId?: string, obraId?: string) => {
    try {
      setError(null);
      let query = supabase
        .from('historico_alertas')
        .select(`
          *,
          alertas_desvio:alerta_id (
            descricao,
            categoria,
            etapa
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (alertaId) {
        query = query.eq('alerta_id', alertaId);
      }
      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar histórico:', error);
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de alertas.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Calcular resumo das notificações
  const calcularResumoNotificacoes = (notificacoesList: NotificacaoAlerta[]) => {
    const resumo = {
      total: notificacoesList.length,
      nao_lidas: notificacoesList.filter(n => n.tipo_notificacao === 'DASHBOARD' && n.status !== 'LIDA').length,
      pendentes: notificacoesList.filter(n => n.status === 'PENDENTE').length,
      enviadas: notificacoesList.filter(n => n.status === 'ENVIADA').length,
      erros: notificacoesList.filter(n => n.status === 'ERRO').length
    };
    setResumoNotificacoes(resumo);
  };

  // Criar ou atualizar configuração
  const salvarConfiguracao = async (configuracao: ConfiguracaoAlertaAvancada): Promise<boolean> => {
    try {
      setProcessando(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const configData = {
        ...configuracao,
        usuario_id: user.user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (configuracao.id) {
        // Atualizar
        result = await supabase
          .from('configuracoes_alerta_avancadas')
          .update(configData)
          .eq('id', configuracao.id)
          .select()
          .single();
      } else {
        // Criar
        result = await supabase
          .from('configuracoes_alerta_avancadas')
          .insert(configData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: "Configuração de alerta salva com sucesso."
      });

      await carregarConfiguracoes();
      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de alerta.",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessando(false);
    }
  };

  // Excluir configuração
  const excluirConfiguracao = async (id: string): Promise<boolean> => {
    try {
      setProcessando(true);
      
      const { error } = await supabase
        .from('configuracoes_alerta_avancadas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração de alerta excluída."
      });

      await carregarConfiguracoes();
      return true;
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir configuração.",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessando(false);
    }
  };

  // Marcar notificação como lida
  const marcarNotificacaoLida = async (notificacaoId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes_alertas')
        .update({ 
          status: 'LIDA', 
          lida_em: new Date().toISOString() 
        })
        .eq('id', notificacaoId);

      if (error) throw error;

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(n => 
          n.id === notificacaoId 
            ? { ...n, status: 'LIDA' as const, lida_em: new Date().toISOString() }
            : n
        )
      );

      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  // Processar alertas de uma obra
  const processarAlertasObra = async (obraId: string): Promise<boolean> => {
    try {
      setProcessando(true);
      
      const { data, error } = await supabase.functions.invoke('advanced-alerts-processor', {
        body: {
          action: 'check_thresholds',
          obra_id: obraId
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${data.alertas_gerados} alertas foram gerados.`
      });

      return true;
    } catch (error) {
      console.error('Erro ao processar alertas:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar alertas da obra.",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessando(false);
    }
  };

  // Enviar notificações pendentes
  const enviarNotificacoesPendentes = async (alertaId?: string): Promise<boolean> => {
    try {
      setProcessando(true);
      
      const { data, error } = await supabase.functions.invoke('advanced-alerts-processor', {
        body: {
          action: 'send_notifications',
          alerta_id: alertaId
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${data.enviadas} notificações foram enviadas.`
      });

      await carregarNotificacoes();
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificações.",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessando(false);
    }
  };

  // Testar webhook
  const testarWebhook = async (webhookUrl: string, alertaId?: string): Promise<boolean> => {
    try {
      setProcessando(true);
      
      const payload = {
        test: true,
        alert_type: 'TESTE',
        deviation_percentage: 10.5,
        deviation_amount: 1500.00,
        obra_id: 'test-obra-id',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ObrasAI-Alerts/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Sucesso",
        description: "Webhook testado com sucesso!"
      });

      return true;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro",
        description: `Erro no teste do webhook: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessando(false);
    }
  };

  // Buscar configuração por obra
  const buscarConfiguracaoPorObra = useCallback(async (obraId: string): Promise<ConfiguracaoAlertaAvancada | null> => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_alerta_avancadas')
        .select('*')
        .eq('obra_id', obraId)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }, []);

  // Configurar subscription para notificações em tempo real
  useEffect(() => {
    let subscription: any;
    
    const setupSubscription = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          // Criar um canal único com timestamp para evitar conflitos
          const channelName = `notificacoes_alertas_${userData.user.id}_${Date.now()}`;
          
          subscription = supabase
            .channel(channelName)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'notificacoes_alertas',
                filter: `usuario_id=eq.${userData.user.id}`
              },
              () => {
                // Usar uma função estável para evitar dependências
                carregarNotificacoes();
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error('Erro ao configurar subscription:', error);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Sem dependências para evitar recriação desnecessária

  return {
    // Estados
    configuracoes,
    notificacoes,
    historico,
    resumoNotificacoes,
    loading,
    processando,
    error,

    // Funções
    carregarConfiguracoes,
    carregarNotificacoes,
    carregarHistorico,
    salvarConfiguracao,
    excluirConfiguracao,
    marcarNotificacaoLida,
    processarAlertasObra,
    enviarNotificacoesPendentes,
    testarWebhook,
    buscarConfiguracaoPorObra
  };
};