import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBR } from "@/lib/i18n";
import { orcamentosParametricosApi } from "@/services/orcamentoApi";

interface ProjecaoFinanceiraProps {
  obraId: string | undefined;
  orcamentoDisponivel: number | undefined;
  dataInicio: string | undefined;
  dataFim: string | undefined;
}

interface GastoHistoricoItem {
  data_gasto: string;
  gasto_acumulado: number;
}

interface ChartDataItem {
    data: string;
    gastoReal?: number | null;
    projecao?: number | null;
    orcamento?: number | null;
}


const processarDadosParaGrafico = (
    historico: GastoHistoricoItem[],
    dataInicioStr: string,
    dataFimStr: string,
    orcamentoDisponivel: number
  ): ChartDataItem[] => {

    if (!historico || historico.length === 0 || !dataInicioStr || !dataFimStr) return [];
  
    const dataInicio = new Date(dataInicioStr);
    const dataFim = new Date(dataFimStr);
  
    const ultimoGasto = historico[historico.length - 1];
    
    // Calcula a velocidade de gasto diário
    const diasDesdeInicio = (new Date(ultimoGasto.data_gasto).getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24) || 1;
    const velocidadeGastoDiario = ultimoGasto.gasto_acumulado / diasDesdeInicio;
  
    const chartDataMap = new Map<string, ChartDataItem>();

    // Adiciona pontos do histórico
    historico.forEach(p => {
        chartDataMap.set(p.data_gasto, {
            data: format(new Date(p.data_gasto), "dd/MMM", { locale: ptBR }),
            gastoReal: p.gasto_acumulado,
            orcamento: orcamentoDisponivel
        })
    });

    // Calcula e adiciona pontos da projeção
    let dataCorrente = new Date(ultimoGasto.data_gasto);
    let gastoProjetado = ultimoGasto.gasto_acumulado;
  
    while (dataCorrente <= dataFim) {
        const dataKey = format(dataCorrente, "yyyy-MM-dd");
        if(!chartDataMap.has(dataKey)){
            chartDataMap.set(dataKey, {
                data: format(dataCorrente, "dd/MMM", { locale: ptBR }),
                orcamento: orcamentoDisponivel
            });
        }
        const entry = chartDataMap.get(dataKey)!;
        entry.projecao = gastoProjetado;

        dataCorrente.setDate(dataCorrente.getDate() + 1);
        gastoProjetado += velocidadeGastoDiario;
    }
  
    return Array.from(chartDataMap.values()).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
};

export const ProjecaoFinanceira: React.FC<ProjecaoFinanceiraProps> = ({
  obraId,
  orcamentoDisponivel,
  dataInicio,
  dataFim,
}) => {
  const {
    data: historico,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["gastoHistorico", obraId],
    queryFn: () => orcamentosParametricosApi.getGastoHistorico(obraId!),
    enabled: !!obraId && !!dataInicio && !!dataFim,
  });

  if (!obraId) {
    return <div className="text-center py-8"><p className="text-muted-foreground">Selecione uma obra.</p></div>;
  }
  if (isLoading) {
    return <div className="text-center py-8"><p className="text-muted-foreground">Carregando projeção...</p></div>;
  }
  if (isError) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  const chartData = processarDadosParaGrafico(historico || [], dataInicio!, dataFim!, orcamentoDisponivel || 0);

  if(chartData.length === 0){
    return <div className="text-center py-8"><p className="text-muted-foreground">Não há dados de despesas operacionais para gerar a projeção.</p></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção Financeira (Burn-Up)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolução do gasto real e projeção da tendência até o final da obra.
        </p>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="data"
            />
            <YAxis tickFormatter={(value) => formatCurrencyBR(value, { notation: 'compact' })} />
            <Tooltip
              labelFormatter={(label) => label}
              formatter={(value: number, name: string) => [formatCurrencyBR(value), name]}
            />
            <Legend />
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="gastoReal"
              stroke="#10b981"
              fill="url(#colorReal)"
              name="Gasto Real"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="projecao"
              stroke="#8b5cf6"
              strokeDasharray="5 5"
              fill="transparent"
              name="Projeção"
              connectNulls
            />
             <Area
              type="monotone"
              dataKey="orcamento"
              stroke="#ef4444"
              strokeWidth={2}
              fill="transparent"
              name="Orçamento Disponível"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 