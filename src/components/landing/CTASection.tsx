import { motion } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle,Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Pronto para <span className="text-yellow-200">triplicar</span> sua margem?
            </h2>
            
            <p className="text-xl md:text-2xl text-orange-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Sistema desenvolvido por especialistas com 15+ anos na indústria de construção. 
              <strong className="text-white">Teste grátis para comprovar o potencial.</strong>
            </p>
          </div>
          
          {/* Trust metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { icon: Calculator, text: "15+ anos", desc: "Experiência da equipe" },
              { icon: Clock, text: "24h implementação", desc: "Setup completo" },
              { icon: Shield, text: "99.9% uptime", desc: "Disponibilidade garantida" },
              { icon: CheckCircle, text: "7 dias grátis", desc: "Teste completo" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <item.icon className="w-8 h-8 text-yellow-200 mx-auto mb-3" />
                <div className="text-lg font-bold text-white mb-1">{item.text}</div>
                <div className="text-sm text-orange-100">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-orange-600 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg px-8 py-6 font-semibold group"
            >
              Começar Teste Grátis (30 dias)
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white hover:bg-white/10 transition-all duration-300 text-lg px-8 py-6 backdrop-blur-sm"
            >
              Falar com Especialista
            </Button>
          </motion.div>
          
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 text-sm text-orange-100"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Setup Imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Suporte brasileiro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>LGPD compliant</span>
            </div>
          </motion.div>
          
          {/* Bottom guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-yellow-200" />
              <span className="text-xl font-bold text-white">Garantia de Resultados</span>
            </div>
            <p className="text-orange-100 leading-relaxed">
              Se você não economizar pelo menos 20% dos custos em 90 dias, 
              devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
