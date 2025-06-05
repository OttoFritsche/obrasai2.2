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
      {/* Background sutil - removendo partículas e efeitos excessivos */}
      <div className="absolute inset-0">
        {/* Grid pattern muito sutil */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02] dark:opacity-[0.05]" />
        
        {/* Gradiente sutil sem muitos efeitos */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-orange-50/20 dark:from-blue-950/20 dark:via-transparent dark:to-orange-950/10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo Principal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
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
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="text-slate-900 dark:text-white">Gerencie suas obras com</span>{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                precisão total
              </span>
            </motion.h1>

            {/* Subtítulo mais focado em resultados */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed"
            >
              Desenvolvido por uma equipe multidisciplinar de 
              <strong className="text-slate-900 dark:text-white"> engenheiros civis, desenvolvedores especialistas e agentes de IA avançada</strong> para resolver os desafios reais da construção.
            </motion.p>

            {/* Métricas reais - mais profissional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-6 mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">30%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Economia projetada*</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">24h</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Implementação</div>
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
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Beta</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Teste gratuito</div>
                </div>
              </div>
            </motion.div>

            {/* Benefícios principais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {[
                { icon: Shield, text: "30 dias grátis" },
                { icon: CheckCircle, text: "Setup em 24h" },
                { icon: Award, text: "ISO 27001" },
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
              className="flex flex-col sm:flex-row gap-4"
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
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setVideoModalOpen(true)}
                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 text-lg px-8 py-6 group"
              >
                <Play className="h-5 w-5 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />
                Ver Cases Reais (3 min)
              </Button>
            </motion.div>

            {/* Descrição do chatbot */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-center"
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
              className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>LGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>99.9% Uptime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interface do sistema */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow effect muito sutil */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-100/20 to-yellow-100/20 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-2xl blur-xl" />
              
              {/* Interface mockup mais realista */}
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700 shadow-2xl">
                {/* Browser bar */}
                <div className="bg-slate-100 dark:bg-slate-900 rounded-t-xl p-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-700 rounded px-3 py-1 mx-4 border border-slate-200 dark:border-slate-600">
                    <span className="text-xs text-slate-500 dark:text-slate-400">https://app.obrasai.com</span>
                  </div>
                </div>
                
                {/* Dashboard content realista */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-b-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">Obras em Andamento</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 dark:text-green-400 text-xs font-medium">Online</span>
                    </div>
                  </div>
                  
                  {/* Cards de métricas realistas */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Orçamento", value: "R$ 2.1M", trend: "+5%", color: "text-green-600" },
                      { label: "Cronograma", value: "78%", trend: "No prazo", color: "text-blue-600" },
                      { label: "Qualidade", value: "9.2/10", trend: "+0.3", color: "text-orange-600" }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
                      >
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
                        <div className={`text-xs font-medium ${stat.color}`}>{stat.trend}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Lista de obras simplificada */}
                  <div className="space-y-2">
                    {[
                      { nome: "Residencial Aurora", status: "Em andamento", progresso: 75 },
                      { nome: "Centro Comercial Plaza", status: "Revisão", progresso: 45 },
                      { nome: "Condomínio Jardins", status: "Finalização", progresso: 90 }
                    ].map((obra, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">{obra.nome}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">{obra.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{obra.progresso}%</div>
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                              style={{ width: `${obra.progresso}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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
