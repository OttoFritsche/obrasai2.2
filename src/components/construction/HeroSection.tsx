
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth/hooks";
import { t } from "@/lib/i18n";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative overflow-hidden bg-construction-dark">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1460574283810-2aab119d8511?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-construction-light">
              Pare de Imaginar, Comece a Construir
            </h1>
            <p className="text-2xl text-construction-light/90 font-semibold mb-4">
              IA para Precisão nos Seus Projetos de Construção
            </p>
            <p className="text-lg text-construction-light/80 mb-8">
              Otimize recursos, antecipe riscos e garanta a lucratividade do projeto com 
              nossa plataforma de IA para o setor de construção civil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-construction-accent hover:bg-construction-accent/90 text-white"
              >
                {isLoading ? t('actions.loading') : user ? "Ir para Dashboard" : "Solicitar Demo Personalizada"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/register")}
                className="border-construction-light text-construction-light hover:bg-construction-light/10"
              >
                Conhecer Planos
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 pl-0 md:pl-8">
            <div className="rounded-lg overflow-hidden shadow-xl border border-construction-light/20">
              <img 
                src="https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Dashboard ObrasAI" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-construction-dark to-transparent opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
