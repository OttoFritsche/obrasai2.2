
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";
import WidgetAnaliseAI from "./WidgetAnaliseAI";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type InsightObraProps = {
  obraId: string;
};

// Define the type more explicitly for insight_data
type InsightData = {
  [key: string]: any;
};

interface Insight {
  id: string;
  obra_id: string;
  insight_type: string;
  insight_data: InsightData | null;
  summary_ptbr: string | null;
  generated_at: string;
  created_at: string;
}

const InsightsObra = ({ obraId }: InsightObraProps) => {
  // Buscar insights para a obra específica
  const { data: insights, isLoading } = useQuery({
    queryKey: ["ai_insights", obraId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("obra_id", obraId)
        .order("generated_at", { ascending: false });
      
      if (error) throw error;
      return data as Insight[] || [];
    },
  });

  // Função de placeholder para gerar novos insights
  const handleGenerateInsights = () => {
    // TODO: Implementar chamada real para API/Função de geração de insights AI
    console.log("Gerando insights para a obra ID:", obraId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  // Se não houver insights, exibir mensagem e botão para gerar
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-muted/50 text-center space-y-4">
        <div className="flex justify-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhum insight disponível</h3>
        <p className="text-muted-foreground">
          Ainda não há análises de IA disponíveis para esta obra.
        </p>
        <Button onClick={handleGenerateInsights}>
          Gerar Insights de IA
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights de IA
        </h2>
        <Button onClick={handleGenerateInsights} size="sm">
          Atualizar Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <WidgetAnaliseAI
            key={insight.id}
            titulo={insight.insight_type === "COST_OPTIMIZATION" ? "Otimização de Custos" : 
                   insight.insight_type === "RISK_PREDICTION" ? "Previsão de Riscos" : 
                   "Análise da IA"}
            resumo={insight.summary_ptbr || "Sem resumo disponível"}
            tipo_insight={insight.insight_type}
            dados_insight={insight.insight_data}
            data_geracao={insight.generated_at}
          />
        ))}
      </div>
    </div>
  );
};

export default InsightsObra;
