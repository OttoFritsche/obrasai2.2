import { motion } from "framer-motion";
import { Database, Brain, Target, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { useState } from "react";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
  color: string;
  badge: string;
  isLast?: boolean;
}

const StepCard = ({ step, title, description, icon: Icon, index, color, badge, isLast }: StepCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center group"
    >
      {/* Connection line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-32 xl:w-40 h-0.5 bg-gradient-to-r from-construction-accent/50 to-transparent z-10">
          <motion.div
            animate={{ scale: isHovered ? 1.2 : 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 border-t-2 border-r-2 border-construction-accent/70"
          />
          
          {/* Animated dots */}
          <motion.div
            animate={{ x: isHovered ? 120 : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-construction-accent rounded-full"
          />
        </div>
      )}
      
      {/* Step number floating badge */}
      <motion.div
        animate={{ y: isHovered ? -5 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-construction-accent to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-20"
      >
        Etapa {step}
      </motion.div>
      
      {/* Main card */}
      <div className="relative w-full max-w-sm">
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
        
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-construction-accent/50 transition-all duration-300">
          {/* Icon container */}
          <motion.div
            animate={{ 
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${color} mb-6 mx-auto relative`}
          >
            <Icon className="w-10 h-10 text-white" />
            
            {/* Sparkle effects */}
            {isHovered && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-4 h-4 text-construction-accent" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: -360 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Sparkles className="w-3 h-3 text-orange-400" />
                </motion.div>
              </>
            )}
          </motion.div>
          
          {/* Badge */}
          <div className="text-center mb-4">
            <span className="text-sm font-semibold px-3 py-1 bg-construction-accent/20 text-construction-accent rounded-full border border-construction-accent/30">
              {badge}
            </span>
          </div>
          
          {/* Content */}
          <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-construction-accent transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-400 leading-relaxed text-center group-hover:text-gray-300 transition-colors duration-300">
            {description}
          </p>
          
          {/* Progress indicator */}
          <motion.div
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-construction-accent to-orange-400 rounded-b-2xl"
          />
        </div>
      </div>
    </motion.div>
  );
};

export const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: "Integre seus Dados",
      description: "Conecte planilhas, ERPs, cronogramas e documentos do projeto em nossa plataforma segura com APIs robustas e sincronização automática.",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      badge: "Automático"
    },
    {
      step: 2,
      title: "IA Analisa & Prevê",
      description: "Nossos algoritmos de machine learning processam e analisam seus dados para identificar padrões complexos e fazer previsões precisas.",
      icon: Brain,
      color: "from-construction-accent to-orange-500",
      badge: "IA Avançada"
    },
    {
      step: 3,
      title: "Receba Insights Acionáveis",
      description: "Visualize recomendações práticas em dashboards intuitivos e tome decisões embasadas para o sucesso do seu projeto.",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      badge: "Resultados"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-construction-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
        
        {/* Floating particles */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-construction-accent/30 rounded-full"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400/30 rounded-full"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-construction-accent/20 text-construction-accent px-4 py-2 rounded-full mb-4"
          >
            <Target className="w-5 h-5" />
            <span className="font-semibold">Processo Simplificado</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Como{" "}
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              Transformamos
            </span>{" "}
            Seus Dados
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Nosso processo simplificado transforma dados complexos em insights acionáveis 
            em apenas três etapas inteligentes e automatizadas
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <StepCard 
              key={index} 
              {...step} 
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
        
        {/* Bottom benefits section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Resultados em{" "}
                <span className="text-construction-accent">Minutos</span>, 
                não Semanas
              </h3>
              <p className="text-gray-400">
                Enquanto métodos tradicionais levam semanas para análise, nossa IA entrega insights em tempo real
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Integração Instantânea", time: "< 5 min", color: "text-blue-400" },
                { label: "Análise Completa", time: "< 2 min", color: "text-construction-accent" },
                { label: "Relatórios Prontos", time: "< 1 min", color: "text-green-400" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center bg-slate-700/30 rounded-xl p-4"
                >
                  <CheckCircle className="w-6 h-6 text-construction-accent mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.time}</div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-construction-accent to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-construction-accent/50 transition-all duration-300 group"
          >
            Comece Agora Gratuitamente
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
