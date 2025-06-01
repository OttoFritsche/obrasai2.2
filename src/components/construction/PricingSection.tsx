
import { PricingCard } from "@/components/construction/PricingCard";

export const PricingSection = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-dark">Planos para Cada Necessidade</h2>
          <p className="text-lg text-construction-dark/80 max-w-2xl mx-auto">
            Escolha o plano ideal para seu negócio, desde pequenas reformas até grandes empreendimentos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            title="Básico"
            price="R$ 499"
            period="/mês"
            description="Ideal para construtoras de pequeno porte"
            features={[
              "Até 3 projetos simultâneos",
              "Análise básica de desvios orçamentários",
              "Cronograma com alertas de atrasos",
              "5GB para documentos de projeto",
              "Suporte por e-mail em horário comercial"
            ]}
            buttonText="Começar Agora"
          />
          
          <PricingCard 
            title="Profissional"
            price="R$ 999"
            period="/mês"
            description="Para construtoras de médio porte"
            features={[
              "Até 10 projetos simultâneos",
              "Análise preditiva completa de custos",
              "Otimização de cronograma com IA",
              "Gestão de fornecedores integrada",
              "20GB para documentos de projeto",
              "Suporte prioritário 7 dias por semana"
            ]}
            buttonText="Contratar Plano"
            highlighted={true}
          />
          
          <PricingCard 
            title="Empresarial"
            price="Sob consulta"
            period=""
            description="Solução completa para grandes construtoras"
            features={[
              "Projetos ilimitados",
              "IA avançada para otimização de projetos",
              "Integração com sistemas existentes",
              "Análise avançada de riscos",
              "Armazenamento ilimitado",
              "Suporte 24/7 com gerente dedicado",
              "Personalização conforme necessidade"
            ]}
            buttonText="Falar com Consultor"
          />
        </div>
      </div>
    </div>
  );
};
