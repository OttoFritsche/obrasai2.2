import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, BarChart2, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBR } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { orcamentosParametricosApi } from "@/services/orcamentoApi";

interface ComparativoEstimativasProps {
  orcamentoId: string | undefined;
}

export const ComparativoEstimativas: React.FC<ComparativoEstimativasProps> = ({
  orcamentoId,
}) => {
  const {
    data: comparativo,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["comparativoCustoM2", orcamentoId],
    queryFn: () => orcamentosParametricosApi.getComparativoCustoM2(orcamentoId!),
    enabled: !!orcamentoId,
  });

  if (!orcamentoId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Selecione uma obra com orçamento paramétrico para ver o comparativo.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Buscando dados de referência...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400 font-semibold">Erro ao carregar</p>
        <p className="text-sm text-red-500 dark:text-red-400/80">{error.message}</p>
      </div>
    );
  }
  
  if (!comparativo || !comparativo.custo_m2_referencia) {
    return (
        <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">Dados de Referência Indisponíveis</p>
          <p className="text-sm text-yellow-500 dark:text-yellow-400/80">
            Não encontramos uma base de custos de referência (SINAPI/CUB) para o tipo, padrão e local desta obra.
          </p>
        </div>
      );
  }

  const {
    custo_m2_estimado,
    custo_m2_referencia,
    variacao_percentual,
    fonte_referencia,
    data_referencia,
  } = comparativo;

  const temVariacao = variacao_percentual !== null;
  const corVariacao = variacao_percentual > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
  const bgVariacao = variacao_percentual > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-green-100 dark:bg-green-900/50";
  const IconeVariacao = variacao_percentual > 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo de Custo por m²</CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise do seu custo estimado em relação à referência de mercado para o mesmo tipo de obra.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Card 1: Sua Estimativa */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                Sua Estimativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrencyBR(custo_m2_estimado)}</p>
              <p className="text-sm text-muted-foreground">por m²</p>
            </CardContent>
          </Card>

          {/* Ícone de Comparação */}
          <div className="col-span-1 flex flex-col items-center justify-center text-center">
            <ArrowDownUp className="h-8 w-8 text-muted-foreground" />
            {temVariacao && (
                <Badge variant="outline" className={cn("mt-2 text-lg", bgVariacao, corVariacao)}>
                    <IconeVariacao className="h-4 w-4 mr-1" />
                    {variacao_percentual.toFixed(2)}%
                </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-1">
                {variacao_percentual > 0 ? "Acima da referência" : "Abaixo da referência"}
            </p>
          </div>

          {/* Card 2: Referência de Mercado */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-500" />
                Referência de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrencyBR(custo_m2_referencia)}</p>
              <p className="text-sm text-muted-foreground">por m²</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            Referência de Custo: {fonte_referencia} | Data Base: {new Date(data_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </CardContent>
    </Card>
  );
}; 