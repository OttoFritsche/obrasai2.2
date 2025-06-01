
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { t } from "@/lib/i18n";

export const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <div id="cta" className="bg-construction-dark py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-construction-light mb-4">
          Pronto para revolucionar seus projetos de construção?
        </h2>
        <p className="text-xl text-construction-light/90 mb-8 max-w-2xl mx-auto">
          Junte-se a centenas de construtoras que já estão economizando tempo e dinheiro com ObrasAI.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/register")}
            className="bg-construction-accent hover:bg-construction-accent/90 text-white"
          >
            Solicitar Demo Gratuita
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-construction-light border-construction-light hover:bg-construction-light/10"
            onClick={() => navigate("/login")}
          >
            {t('auth.login')}
          </Button>
        </div>
      </div>
    </div>
  );
};
