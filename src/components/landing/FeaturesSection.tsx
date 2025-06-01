import { motion } from "framer-motion";
import { ChartBar, Calendar, Shield, Zap, Brain, Database, TrendingUp, Clock, Users } from "lucide-react";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
  color: string;
  badge: string;
}

const FeatureCard = ({ title, description, icon: Icon, index, color, badge }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full group"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
      
      <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-construction-accent/50 transition-all duration-300">
        {/* Icon container with animation */}
        <motion.div
          animate={{ 
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
          className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-6 relative`}
        >
          <Icon className="w-8 h-8 text-white" />
          
          {/* Floating particles around icon */}
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-construction-accent rounded-full"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full"
              />
            </>
          )}
        </motion.div>
        
        {/* Badge */}
        <div className="mb-4">
          <span className="text-sm font-semibold px-3 py-1 bg-construction-accent/20 text-construction-accent rounded-full border border-construction-accent/30">
            {badge}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-construction-accent transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
        
        {/* Progress indicator */}
        <motion.div
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-construction-accent to-orange-400 rounded-b-2xl"
        />
        
        {/* Corner decoration */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-construction-accent/20 group-hover:border-construction-accent/50 transition-colors duration-300" />
      </div>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  const features = [
    {
      title: "Previsão de Custos com IA",
      description: "Antecipe desvios orçamentários antes que aconteçam com previsões baseadas em IA e dados em tempo real do seu projeto, alcançando até 98% de precisão.",
      icon: ChartBar,
      color: "from-construction-accent to-orange-500",
      badge: "IA Avançada"
    },
    {
      title: "Otimização de Cronograma",
      description: "Otimize prazos e alocação de recursos usando insights de machine learning para evitar gargalos e atrasos, melhorando a eficiência em até 40%.",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      badge: "Machine Learning"
    },
    {
      title: "Análise Preditiva de Riscos",
      description: "Identifique potenciais problemas antecipadamente através do reconhecimento de padrões em relatórios e progresso, prevenindo 85% dos riscos.",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      badge: "Prevenção"
    },
    {
      title: "Dashboard Inteligente",
      description: "Visualize todos os seus projetos em um painel unificado com métricas em tempo real, KPIs personalizados e alertas automáticos.",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      badge: "Tempo Real"
    },
    {
      title: "Automação de Processos",
      description: "Automatize tarefas repetitivas como relatórios, aprovações e notificações, economizando até 60% do tempo administrativo da equipe.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      badge: "Automação"
    },
    {
      title: "Gestão de Equipes",
      description: "Coordene equipes distribuídas com ferramentas colaborativas, rastreamento de produtividade e comunicação centralizada.",
      icon: Users,
      color: "from-indigo-500 to-purple-500",
      badge: "Colaboração"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-construction-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-construction-accent/20 text-construction-accent px-4 py-2 rounded-full mb-4"
          >
            <Brain className="w-5 h-5" />
            <span className="font-semibold">Recursos Inteligentes</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transforme Sua Gestão com{" "}
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              Recursos Inteligentes
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Nossa tecnologia de inteligência artificial oferece insights precisos para que você 
            tome decisões baseadas em dados e revolucione sua forma de construir
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
        
        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "98%", label: "Precisão nas Previsões", icon: TrendingUp },
            { number: "40%", label: "Redução de Custos", icon: ChartBar },
            { number: "60%", label: "Economia de Tempo", icon: Clock }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
            >
              <stat.icon className="w-8 h-8 text-construction-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
