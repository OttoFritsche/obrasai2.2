import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Play,
  Building2, 
  Shield,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  Users,
  BarChart3,
  Calculator
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { VideoModal } from "./VideoModal";
import LeadChatbot from "./LeadChatbot";
import background3 from "@/assets/images/background3.jpg";

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [leadChatbotOpen, setLeadChatbotOpen] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    if (user) {
      navigate("/dashboard");
    } else {
      setLeadChatbotOpen(true);
    }
    setIsLoading(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Imagem de fundo com overlay, igual ao Login */}
      <img
        src={background3}
        alt="Background ObrasAI"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "blur(0px) brightness(0.6)" }}
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      <div className="container mx-auto px-4 relative z-20 flex flex-col justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-7xl mx-auto"
        >
          {/* Badge profissional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Sistema de Gestão de Obras
            </Badge>
          </motion.div>

          {/* Título principal - mais direto */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center md:text-left"
          >
            Gerencie suas obras com <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">precisão total</span>
          </motion.h1>

          {/* Subtítulo mais focado em resultados */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-center md:text-left"
          >
            A única plataforma criada por engenheiros civis e especialistas em IA para transformar a gestão de obras no Brasil. Mais controle, menos desperdício, resultados reais.
          </motion.p>

          {/* Métricas reais - mais profissional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 justify-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">20%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Economia projetada*</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Implementação</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Imediata</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">15+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Anos experiência</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Teste gratuito</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">7 dias</div>
              </div>
            </div>
          </motion.div>

          {/* Benefícios principais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start"
          >
            {[
              { icon: Shield, text: "7 dias grátis" },
              { icon: CheckCircle, text: "Setup em 24h" },
              { icon: Calculator, text: "ROI em 3 meses" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs mais profissionais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Button 
              size="lg"
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg px-8 py-6"
            >
              <span className="font-semibold">
                {isLoading ? "Carregando..." : user ? "Ir para Dashboard" : "Conversar com IA"}
              </span>
              {!isLoading && (
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
            
          </motion.div>

          {/* Descrição do chatbot */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-4 text-center md:text-left"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                💬 <strong>Nossa IA especializada</strong> vai capturar suas informações e responder suas dúvidas sobre gestão de obras
              </p>
            </motion.div>
          )}

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 justify-center md:justify-start"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
      />
      <LeadChatbot 
        isOpen={leadChatbotOpen} 
        onClose={() => setLeadChatbotOpen(false)} 
      />
    </section>
  );
}; 