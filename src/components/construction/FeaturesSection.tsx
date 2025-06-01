
import { ChartBar, Calendar, Shield } from "lucide-react";
import { FeatureCard } from "@/components/construction/FeatureCard";

export const FeaturesSection = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-dark">Recursos Impulsionados por IA</h2>
          <p className="text-lg text-construction-dark/80 max-w-2xl mx-auto">
            Nossa tecnologia de inteligência artificial oferece insights precisos para que você tome decisões baseadas em dados.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Análise Preditiva de Custos"
            description="Antecipe desvios orçamentários antes que aconteçam com previsões baseadas em IA e dados em tempo real do seu projeto."
            icon={ChartBar}
          />
          <FeatureCard 
            title="Cronograma Inteligente"
            description="Otimize prazos e alocação de recursos usando insights de machine learning para evitar gargalos e atrasos."
            icon={Calendar}
          />
          <FeatureCard 
            title="Avaliação Automática de Riscos"
            description="Identifique potenciais problemas antecipadamente através do reconhecimento de padrões em relatórios e progresso."
            icon={Shield}
          />
        </div>
      </div>
    </div>
  );
};
