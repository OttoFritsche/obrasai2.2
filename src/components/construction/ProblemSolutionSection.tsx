
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export const ProblemSolutionSection = () => {
  return (
    <div className="py-20 bg-construction-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-dark">Os Desafios da Construção Civil</h2>
          <p className="text-lg text-construction-dark/80 max-w-2xl mx-auto">
            A indústria da construção enfrenta desafios únicos que comprometem a eficiência e a lucratividade dos projetos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <Card className="bg-white shadow-md border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-construction-dark mb-4">Os Problemas</h3>
              <ul className="space-y-3">
                {[
                  "Estouros de orçamento frequentes e imprevisíveis",
                  "Atrasos que comprometem cronogramas e elevam custos",
                  "Previsões imprecisas de materiais e mão de obra",
                  "Dificuldade para identificar riscos antecipadamente",
                  "Gestão manual e fragmentada de dados complexos"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 min-w-4 h-4 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </div>
                    <span className="text-construction-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-construction-dark mb-4">Nossa Solução</h3>
              <ul className="space-y-3">
                {[
                  "Análise preditiva de custos com IA para previsões precisas",
                  "Otimização inteligente de cronogramas baseada em dados reais",
                  "Recomendações de alocação de recursos com aprendizado de máquina",
                  "Detecção antecipada de riscos usando reconhecimento de padrões",
                  "Plataforma centralizada com insights acionáveis em tempo real"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 min-w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <Check size={12} />
                    </div>
                    <span className="text-construction-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
