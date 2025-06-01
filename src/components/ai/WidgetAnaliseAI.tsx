
import { AlertCircle, AlertTriangle, TrendingUp, CheckCircle2, Info, Lightbulb, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateBR } from "@/lib/i18n";

type InsightData = {
  [key: string]: any;
};

type WidgetAnaliseAIProps = {
  titulo: string;
  resumo: string;
  tipo_insight: string;
  dados_insight?: InsightData;
  data_geracao?: string;
};

const WidgetAnaliseAI = ({
  titulo,
  resumo,
  tipo_insight,
  dados_insight,
  data_geracao
}: WidgetAnaliseAIProps) => {
  // Função para determinar o ícone baseado no tipo de insight
  const getIcon = () => {
    switch (tipo_insight) {
      case 'RISK_PREDICTION':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'COST_OPTIMIZATION':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'SCHEDULE_ALERT':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'QUALITY_CHECK':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'MATERIAL_SUGGESTION':
        return <Lightbulb className="h-5 w-5 text-amber-400" />;
      case 'PERFORMANCE_ANALYSIS':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  // Determinar a cor do badge baseado no tipo de insight
  const getBadgeVariant = () => {
    switch (tipo_insight) {
      case 'RISK_PREDICTION':
        return "warning";
      case 'COST_OPTIMIZATION':
        return "success";
      case 'SCHEDULE_ALERT':
        return "destructive";
      case 'QUALITY_CHECK':
        return "secondary";
      case 'MATERIAL_SUGGESTION':
        return "default";
      case 'PERFORMANCE_ANALYSIS':
        return "outline";
      default:
        return "default";
    }
  };

  // Traduzir o tipo de insight para português
  const getInsightTypeLabel = () => {
    switch (tipo_insight) {
      case 'RISK_PREDICTION':
        return "Previsão de Risco";
      case 'COST_OPTIMIZATION':
        return "Otimização de Custo";
      case 'SCHEDULE_ALERT':
        return "Alerta de Cronograma";
      case 'QUALITY_CHECK':
        return "Verificação de Qualidade";
      case 'MATERIAL_SUGGESTION':
        return "Sugestão de Material";
      case 'PERFORMANCE_ANALYSIS':
        return "Análise de Desempenho";
      default:
        return tipo_insight;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle>{titulo}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant() as any}>
            {getInsightTypeLabel()}
          </Badge>
        </div>
        <CardDescription>
          {data_geracao && (
            <span className="text-xs text-muted-foreground">
              Gerado em {formatDateBR(data_geracao)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{resumo}</p>

        {dados_insight && dados_insight.detalhe && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Detalhes:</h4>
            <p className="text-sm text-muted-foreground">
              {dados_insight.detalhe}
            </p>
          </div>
        )}

        {dados_insight && dados_insight.recomendacao && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Recomendação:</h4>
            <p className="text-sm text-muted-foreground">
              {dados_insight.recomendacao}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WidgetAnaliseAI;
