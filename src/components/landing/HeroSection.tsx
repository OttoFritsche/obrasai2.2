import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Play,
  Sparkles, 
  Shield,
  TrendingUp,
  Clock,
  Award,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VideoModal } from "./VideoModal";

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
    setIsLoading(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background com efeito parallax */}
      <div className="absolute inset-0">
        {/* Grid pattern animado */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10 animate-pulse-slow" />
        
        {/* Gradiente radial */}
        <div className="absolute inset-0 bg-gradient-radial from-construction-accent/20 via-transparent to-transparent" />
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-construction-accent rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo Principal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge de destaque */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Badge className="bg-construction-accent/20 text-construction-accent border-construction-accent/30 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma de IA para Construção Civil
              </Badge>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Revolucione suas</span>{" "}
              <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
                Obras com IA
              </span>
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
            >
              Transforme a gestão de suas construções com inteligência artificial avançada. 
              Previsões precisas, controle de custos e otimização de cronogramas em tempo real.
            </motion.p>

            {/* Benefícios principais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-construction-accent to-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">Redução de custos até 40%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">Previsões em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">Análise preditiva de riscos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">Automação inteligente</span>
              </div>
            </motion.div>

            {/* Badges de garantia */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {[
                { icon: Shield, text: "Teste grátis por 14 dias" },
                { icon: TrendingUp, text: "Setup em 24 horas" },
                { icon: Clock, text: "Suporte especializado" },
                { icon: Award, text: "Segurança empresarial" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
                >
                  <item.icon className="h-4 w-4 text-construction-accent" />
                  <span className="text-sm text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
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
                className="bg-gradient-to-r from-construction-accent to-orange-500 hover:from-construction-accent/90 hover:to-orange-500/90 text-white group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-construction-accent/50 text-lg px-8 py-6"
              >
                <span className="font-semibold">
                  {isLoading ? "Carregando..." : "Começar Teste Grátis"}
                </span>
                {!isLoading && (
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setVideoModalOpen(true)}
                className="border-2 border-gray-600 text-white hover:bg-white/10 hover:border-construction-accent transition-all duration-300 text-lg px-8 py-6 group"
              >
                <Play className="h-5 w-5 mr-2 text-construction-accent group-hover:scale-110 transition-transform" />
                Ver Demonstração (2 min)
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-4 text-sm text-gray-400"
            >
              <span>Tecnologia segura e confiável:</span>
              <div className="flex gap-4 opacity-60">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">SSL</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">LGPD</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">ISO 27001</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Mockup interativo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-construction-accent/30 to-orange-500/30 rounded-2xl blur-2xl animate-pulse-slow" />
              
              {/* Main mockup */}
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50 shadow-2xl">
                {/* Browser bar */}
                <div className="bg-slate-900 rounded-t-xl p-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-slate-700 rounded px-3 py-1 mx-4">
                    <span className="text-xs text-gray-400">https://app.obrasai.com</span>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg">Dashboard ObrasAI</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs">Ao vivo</span>
                    </div>
                  </div>
                  
                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "IA", value: "98%", color: "bg-construction-accent" },
                      { label: "Economia", value: "35%", color: "bg-green-500" },
                      { label: "Tempo", value: "47h", color: "bg-blue-500" }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          backgroundColor: ["rgba(100,100,100,0.3)", "rgba(100,100,100,0.5)", "rgba(100,100,100,0.3)"]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                        className="bg-slate-700/30 rounded-lg p-3"
                      >
                        <div className={`text-sm font-bold text-white`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Progress bars */}
                  <div className="space-y-3">
                    {[60, 85, 70].map((width, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Projeto {index + 1}</span>
                          <span>{width}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 1.5, delay: 1 + index * 0.2 }}
                            className="h-full bg-gradient-to-r from-construction-accent to-orange-500"
                          />
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

      {/* Video Modal */}
      <VideoModal 
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </section>
  );
};
