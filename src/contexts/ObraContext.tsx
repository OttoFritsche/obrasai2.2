import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import { obrasApi } from '@/services/api';
import { queryKeys } from '@/lib/query-keys';
import type { Database } from '@/integrations/supabase/types';

type Obra = Database['public']['Tables']['obras']['Row'];
type Despesa = Database['public']['Tables']['despesas']['Row'];

interface ObraMetricas {
  progressoReal: number;
  totalGastos: number;
  totalOrcado: number;
  diasRestantes: number | null;
  diasDecorridos: number;
  percentualGasto: number;
  statusFinanceiro: 'verde' | 'amarelo' | 'vermelho';
  despesasPorCategoria: Record<string, number>;
  tendenciaGastos: 'crescente' | 'estavel' | 'decrescente';
}

interface ObraContextType {
  obra: Obra | null;
  despesas: Despesa[];
  metricas: ObraMetricas | null;
  isLoadingObra: boolean;
  isLoadingDespesas: boolean;
  errorObra: Error | null;
  errorDespesas: Error | null;
  refetchObra: () => void;
  refetchDespesas: () => void;
  hasValidId: boolean;
}

const ObraContext = createContext<ObraContextType | undefined>(undefined);

interface ObraProviderProps {
  children: ReactNode;
}

export const ObraProvider = ({ children }: ObraProviderProps) => {
  const { id: obraId } = useParams<{ id: string }>();
  const { validTenantId } = useTenantValidation();
  
  const hasValidId = Boolean(obraId && validTenantId);

  // Query para dados da obra
  const {
    data: obra,
    isLoading: isLoadingObra,
    error: errorObra,
    refetch: refetchObra,
  } = useQuery({
    queryKey: queryKeys.obra(obraId!, validTenantId!),
    queryFn: () => obrasApi.getById(obraId!, validTenantId!),
    enabled: hasValidId,
  });

  // Query para despesas da obra
  const {
    data: despesas,
    isLoading: isLoadingDespesas,
    error: errorDespesas,
    refetch: refetchDespesas,
  } = useQuery({
    queryKey: queryKeys.despesasPorObra(obraId!, validTenantId!),
    queryFn: async () => {
      // Implementar busca de despesas por obra
      // Por enquanto retorna array vazio, será implementado quando a API estiver pronta
      return [];
    },
    enabled: hasValidId,
  });

  // Calcular métricas da obra
  const metricas = useMemo((): ObraMetricas | null => {
    if (!obra || !despesas) return null;

    const totalGastos = despesas.reduce((acc, despesa) => {
      return acc + (despesa.valor || 0);
    }, 0);

    const totalOrcado = obra.orcamento_total || 0;
    const percentualGasto = totalOrcado > 0 ? (totalGastos / totalOrcado) * 100 : 0;

    // Calcular progresso real baseado em data de início e fim
    const dataInicio = obra.data_inicio ? new Date(obra.data_inicio) : new Date();
    const dataFim = obra.data_fim ? new Date(obra.data_fim) : new Date();
    const agora = new Date();

    const duracaoTotal = dataFim.getTime() - dataInicio.getTime();
    const tempoDecorrido = agora.getTime() - dataInicio.getTime();
    const progressoReal = duracaoTotal > 0 ? Math.min(100, Math.max(0, (tempoDecorrido / duracaoTotal) * 100)) : 0;

    // Calcular dias restantes
    const diasRestantes = agora < dataFim ? Math.ceil((dataFim.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const diasDecorridos = Math.ceil((agora.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    // Determinar status financeiro
    let statusFinanceiro: 'verde' | 'amarelo' | 'vermelho' = 'verde';
    if (percentualGasto > 90) {
      statusFinanceiro = 'vermelho';
    } else if (percentualGasto > 75) {
      statusFinanceiro = 'amarelo';
    }

    // Agrupar despesas por categoria
    const despesasPorCategoria = despesas.reduce((acc, despesa) => {
      const categoria = despesa.categoria || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + (despesa.valor || 0);
      return acc;
    }, {} as Record<string, number>);

    // Calcular tendência de gastos (simplificado)
    const metadeDespesas = Math.floor(despesas.length / 2);
    const gastosRecentes = despesas
      .slice(0, metadeDespesas)
      .reduce((acc, d) => acc + (d.valor || 0), 0);
    const gastosAntigos = despesas
      .slice(metadeDespesas)
      .reduce((acc, d) => acc + (d.valor || 0), 0);

    let tendenciaGastos: 'crescente' | 'estavel' | 'decrescente' = 'estavel';
    if (gastosRecentes > gastosAntigos * 1.1) {
      tendenciaGastos = 'crescente';
    } else if (gastosRecentes < gastosAntigos * 0.9) {
      tendenciaGastos = 'decrescente';
    }

    return {
      progressoReal,
      totalGastos,
      totalOrcado,
      diasRestantes,
      diasDecorridos,
      percentualGasto,
      statusFinanceiro,
      despesasPorCategoria,
      tendenciaGastos,
    };
  }, [obra, despesas]);

  const value: ObraContextType = {
    obra: obra || null,
    despesas: despesas || [],
    metricas,
    isLoadingObra,
    isLoadingDespesas,
    errorObra: errorObra as Error | null,
    errorDespesas: errorDespesas as Error | null,
    refetchObra,
    refetchDespesas,
    hasValidId,
  };

  return (
    <ObraContext.Provider value={value}>
      {children}
    </ObraContext.Provider>
  );
};

export const useObra = () => {
  const context = useContext(ObraContext);
  if (context === undefined) {
    throw new Error('useObra deve ser usado dentro de um ObraProvider');
  }
  return context;
};

// Hook especializado para métricas da obra
export const useObraMetricas = () => {
  const { metricas, isLoadingObra, isLoadingDespesas } = useObra();
  return {
    metricas,
    isLoading: isLoadingObra || isLoadingDespesas,
  };
};

// Hook para verificar se a obra está dentro do orçamento
export const useObraStatus = () => {
  const { metricas } = useObra();
  
  if (!metricas) {
    return {
      status: 'loading' as const,
      message: 'Carregando dados da obra...',
      variant: 'default' as const,
    };
  }

  const { percentualGasto, statusFinanceiro, diasRestantes } = metricas;

  if (statusFinanceiro === 'vermelho') {
    return {
      status: 'danger' as const,
      message: `Orçamento crítico: ${percentualGasto.toFixed(1)}% utilizado`,
      variant: 'destructive' as const,
    };
  }

  if (statusFinanceiro === 'amarelo') {
    return {
      status: 'warning' as const,
      message: `Atenção: ${percentualGasto.toFixed(1)}% do orçamento utilizado`,
      variant: 'secondary' as const,
    };
  }

  if (diasRestantes !== null && diasRestantes < 30) {
    return {
      status: 'info' as const,
      message: `${diasRestantes} dias restantes para conclusão`,
      variant: 'outline' as const,
    };
  }

  return {
    status: 'success' as const,
    message: 'Obra dentro do planejado',
    variant: 'default' as const,
  };
};

export default ObraContext;