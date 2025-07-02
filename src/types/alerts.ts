// Tipos para sistema de alertas avançados
export interface AlertaBase {
  id: string;
  obra_id: string;
  tipo: AlertaTipo;
  prioridade: AlertaPrioridade;
  status: AlertaStatus;
  titulo: string;
  descricao: string;
  created_at: string;
  updated_at: string;
  usuario_id: string;
  data_limite?: string;
  resolvido_em?: string;
  resolvido_por?: string;
}

export type AlertaTipo = 
  | 'orcamento_excedido'
  | 'prazo_vencendo'
  | 'despesa_alta'
  | 'meta_nao_cumprida'
  | 'qualidade_baixa'
  | 'seguranca_risco'
  | 'material_faltando'
  | 'equipe_ausente'
  | 'clima_adverso'
  | 'documento_vencido';

export type AlertaPrioridade = 'baixa' | 'media' | 'alta' | 'critica';

export type AlertaStatus = 'ativo' | 'resolvido' | 'ignorado' | 'em_andamento';

export interface AlertaMetrics {
  total_alertas: number;
  alertas_ativos: number;
  alertas_criticos: number;
  alertas_resolvidos_hoje: number;
  tempo_medio_resolucao: number;
  taxa_resolucao: number;
}

export interface AlertaDataExtras {
  origem?: string;
  valor_atual?: number;
  valor_limite?: number;
  porcentagem?: number;
  detalhes?: Record<string, unknown>;
  metadados?: {
    timestamp: string;
    usuario_id: string;
    obra_nome?: string;
    categoria?: string;
  };
  acoes_sugeridas?: string[];
  impacto_estimado?: {
    financeiro?: number;
    prazo?: string;
    qualidade?: 'baixo' | 'medio' | 'alto';
  };
}

export interface AlertaAvancado extends AlertaBase {
  dados_extras: AlertaDataExtras;
  configuracao_id?: string;
  historico_status?: AlertaHistoricoItem[];
  notificacoes_enviadas?: NotificacaoAlerta[];
}

export interface AlertaHistoricoItem {
  status_anterior: AlertaStatus;
  status_novo: AlertaStatus;
  usuario_id: string;
  data_mudanca: string;
  observacoes?: string;
}

export interface NotificacaoAlerta {
  id: string;
  alerta_id: string;
  tipo_notificacao: TipoNotificacao;
  destinatario: string;
  enviado_em: string;
  status: 'pendente' | 'enviado' | 'falhou';
  tentativas: number;
  dados_extras?: {
    canal?: 'email' | 'sms' | 'push' | 'webhook';
    template_usado?: string;
    erro?: string;
  };
}

export type TipoNotificacao = 
  | 'criacao_alerta'
  | 'escalacao_prioridade'
  | 'prazo_vencendo'
  | 'resolucao_alerta'
  | 'lembrete_diario'
  | 'relatorio_semanal';

// Configurações de alertas
export interface ConfiguracaoAlerta {
  id: string;
  obra_id: string;
  tipo_alerta: AlertaTipo;
  condicoes: AlertaCondicao[];
  acoes: AlertaAcao[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
  usuario_id: string;
}

export interface AlertaCondicao {
  campo: string;
  operador: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'contains' | 'between';
  valor: string | number | boolean;
  valor_secundario?: string | number; // Para operador 'between'
}

export interface AlertaAcao {
  tipo: 'notificar' | 'email' | 'webhook' | 'status_change';
  configuracao: Record<string, unknown>;
  delay_minutos?: number;
}

// Dashboards e relatórios
export interface DashboardAlertas {
  resumo: AlertaMetrics;
  alertas_recentes: AlertaAvancado[];
  tendencias: {
    periodo: string;
    dados: Array<{
      data: string;
      total: number;
      resolvidos: number;
      criticos: number;
    }>;
  };
  distribuicao_por_tipo: Array<{
    tipo: AlertaTipo;
    quantidade: number;
    porcentagem: number;
  }>;
  distribuicao_por_obra: Array<{
    obra_id: string;
    obra_nome: string;
    quantidade: number;
    criticos: number;
  }>;
}

export interface RelatorioAlertas {
  periodo: {
    inicio: string;
    fim: string;
  };
  filtros: {
    obras?: string[];
    tipos?: AlertaTipo[];
    prioridades?: AlertaPrioridade[];
    status?: AlertaStatus[];
  };
  dados: {
    total_alertas: number;
    alertas_por_dia: Array<{
      data: string;
      criados: number;
      resolvidos: number;
    }>;
    performance: {
      tempo_medio_resolucao: number;
      taxa_resolucao: number;
      alertas_em_aberto: number;
    };
    detalhes: AlertaAvancado[];
  };
}

// Tipos para hooks e contexts
export interface AlertasContextValue {
  alertas: AlertaAvancado[];
  metrics: AlertaMetrics;
  isLoading: boolean;
  error: string | null;
  criarAlerta: (alerta: Omit<AlertaAvancado, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  resolverAlerta: (id: string, observacoes?: string) => Promise<void>;
  atualizarStatus: (id: string, status: AlertaStatus, observacoes?: string) => Promise<void>;
  buscarAlertas: (filtros?: Partial<AlertaAvancado>) => Promise<void>;
  marcarComoLido: (id: string) => Promise<void>;
}

export interface UseAlertasAdvancadosReturn {
  alertas: AlertaAvancado[];
  metrics: AlertaMetrics;
  dashboard: DashboardAlertas | null;
  isLoading: boolean;
  error: string | null;
  criarAlerta: (alerta: Omit<AlertaAvancado, 'id' | 'created_at' | 'updated_at'>) => Promise<AlertaAvancado>;
  resolverAlerta: (id: string, observacoes?: string) => Promise<void>;
  atualizarStatus: (id: string, status: AlertaStatus, observacoes?: string) => Promise<void>;
  configurarAlerta: (config: Omit<ConfiguracaoAlerta, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  buscarAlertas: (filtros?: SearchAlertas) => Promise<void>;
  gerarRelatorio: (params: RelatorioAlertas['filtros'] & { periodo: RelatorioAlertas['periodo'] }) => Promise<RelatorioAlertas>;
}

export interface SearchAlertas {
  obra_id?: string;
  tipo?: AlertaTipo;
  prioridade?: AlertaPrioridade;
  status?: AlertaStatus;
  data_inicio?: string;
  data_fim?: string;
  limit?: number;
  offset?: number;
  ordem?: 'asc' | 'desc';
  ordenar_por?: 'created_at' | 'prioridade' | 'status';
}

// Tipos para componentes
export interface AlertaCardProps {
  alerta: AlertaAvancado;
  onResolve?: (id: string) => void;
  onUpdateStatus?: (id: string, status: AlertaStatus) => void;
  onViewDetails?: (alerta: AlertaAvancado) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface AlertaListProps {
  alertas: AlertaAvancado[];
  isLoading?: boolean;
  error?: string | null;
  onResolve?: (id: string) => void;
  onUpdateStatus?: (id: string, status: AlertaStatus) => void;
  filters?: SearchAlertas;
  onFiltersChange?: (filters: SearchAlertas) => void;
}

export interface AlertaModalProps {
  alerta: AlertaAvancado | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (id: string, observacoes?: string) => void;
  onUpdateStatus?: (id: string, status: AlertaStatus, observacoes?: string) => void;
}

export interface ConfiguracaoAlertasProps {
  obraId: string;
  configuracoes: ConfiguracaoAlerta[];
  onSave: (config: Omit<ConfiguracaoAlerta, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, ativo: boolean) => void;
}