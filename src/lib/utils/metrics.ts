/**
 * Utilitários para cálculo de métricas e tendências
 */

export interface TrendData {
  value: number;
  isPositive: boolean;
}

/**
 * Calcula a tendência baseada em dados históricos
 * @param currentValue Valor atual
 * @param previousValue Valor anterior (mesmo período anterior)
 * @returns Objeto com valor da tendência e se é positiva
 */
export function calculateTrend(currentValue: number, previousValue: number): TrendData | undefined {
  // Se não há valor anterior ou ambos são zero, não mostra tendência
  if (previousValue === 0 && currentValue === 0) {
    return undefined;
  }
  
  // Se valor anterior é zero mas atual não é, considera 100% de aumento
  if (previousValue === 0 && currentValue > 0) {
    return {
      value: 100,
      isPositive: true
    };
  }
  
  // Se valor atual é zero mas anterior não era, considera 100% de redução
  if (currentValue === 0 && previousValue > 0) {
    return {
      value: 100,
      isPositive: false
    };
  }
  
  // Calcula a variação percentual
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  
  return {
    value: Math.abs(Math.round(percentChange)),
    isPositive: percentChange >= 0
  };
}

/**
 * Calcula métricas de despesas com tendências
 * @param despesas Array de despesas
 * @param filteredDespesas Array de despesas filtradas
 * @returns Objeto com métricas calculadas
 */
export function calculateDespesasMetrics(despesas: unknown[], filteredDespesas: Array<{ custo: number; pago: boolean }>) {
  const totalDespesas = filteredDespesas?.length || 0;
  const totalValor = filteredDespesas?.reduce((sum, despesa) => sum + despesa.custo, 0) || 0;
  const despesasPagas = filteredDespesas?.filter(d => d.pago).length || 0;
  const valorPago = filteredDespesas?.filter(d => d.pago).reduce((sum, despesa) => sum + despesa.custo, 0) || 0;

  // Para calcular tendências reais, precisaríamos de dados históricos
  // Por enquanto, vamos retornar undefined para não mostrar tendências falsas
  return {
    totalDespesas,
    totalValor,
    despesasPagas,
    valorPago,
    trends: {
      totalDespesas: undefined,
      totalValor: undefined,
      despesasPagas: undefined,
      valorPago: undefined
    }
  };
}

/**
 * Calcula métricas de notas fiscais com tendências
 * @param notasFiscais Array de notas fiscais
 * @param filteredNotas Array de notas filtradas
 * @returns Objeto com métricas calculadas
 */
export function calculateNotasMetrics(notasFiscais: unknown[], filteredNotas: Array<{ valor_total: number; arquivo_url?: string }>) {
  const totalNotas = filteredNotas?.length || 0;
  const valorTotal = filteredNotas?.reduce((sum, nota) => sum + nota.valor_total, 0) || 0;
  const notasComArquivo = filteredNotas?.filter(n => n.arquivo_url).length || 0;
  const mediaValor = totalNotas > 0 ? valorTotal / totalNotas : 0;

  // Para calcular tendências reais, precisaríamos de dados históricos
  // Por enquanto, vamos retornar undefined para não mostrar tendências falsas
  return {
    totalNotas,
    valorTotal,
    notasComArquivo,
    mediaValor,
    trends: {
      totalNotas: undefined,
      valorTotal: undefined,
      notasComArquivo: undefined,
      mediaValor: undefined
    }
  };
}

/**
 * Calcula tendências baseadas em períodos (exemplo: mês atual vs mês anterior)
 * @param data Array de dados com campo de data
 * @param valueField Campo que contém o valor a ser calculado
 * @param dateField Campo que contém a data
 * @returns Tendência calculada ou undefined se não há dados suficientes
 */
export function calculatePeriodTrend(
  data: Array<Record<string, unknown>>, 
  valueField: string, 
  dateField = 'created_at'
): TrendData | undefined {
  // Se não há dados suficientes, não mostra tendência
  if (!data || data.length === 0) {
    return undefined;
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Dados do mês atual
  const currentMonthData = data.filter(item => {
    const dateValue = item[dateField];
    if (!dateValue) return false;
    
    try {
      const itemDate = new Date(dateValue as string);
      // Verifica se a data é válida
      if (isNaN(itemDate.getTime())) return false;
      
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    } catch {
      return false;
    }
  });
  
  // Dados do mês anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthData = data.filter(item => {
    const dateValue = item[dateField];
    if (!dateValue) return false;
    
    try {
      const itemDate = new Date(dateValue as string);
      // Verifica se a data é válida
      if (isNaN(itemDate.getTime())) return false;
      
      return itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousYear;
    } catch {
      return false;
    }
  });
  
  // Se não há dados do mês anterior, não mostra tendência
  if (previousMonthData.length === 0) {
    return undefined;
  }
  
  // Se não há dados do mês atual, também não mostra tendência
  if (currentMonthData.length === 0) {
    return undefined;
  }
  
  // Calcula valores
  const currentValue = currentMonthData.reduce((sum, item) => {
    const value = typeof item[valueField] === 'number' ? item[valueField] : 1;
    return sum + value;
  }, 0);
  
  const previousValue = previousMonthData.reduce((sum, item) => {
    const value = typeof item[valueField] === 'number' ? item[valueField] : 1;
    return sum + value;
  }, 0);
  
  // Se ambos os valores são zero, não mostra tendência
  if (currentValue === 0 && previousValue === 0) {
    return undefined;
  }
  
  return calculateTrend(currentValue, previousValue);
}