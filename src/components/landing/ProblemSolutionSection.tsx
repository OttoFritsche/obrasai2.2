import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, TrendingUp, Clock, DollarSign, Shield, CheckCircle, X, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ProblemCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  stat: string;
  index: number;
  color: string;
}

const ProblemCard = ({ title, description, icon: Icon, stat, index, color }: ProblemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
      
      <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300 group">
        {/* Icon container */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-6`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Badge */}
        <div className="mb-4">
          <span className="text-sm font-semibold px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
            {stat}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        
        {/* Hover indicator */}
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          className="absolute bottom-8 right-8 text-red-400"
        >
          <AlertTriangle className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

interface SolutionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  stat: string;
  index: number;
  color: string;
}

const SolutionCard = ({ title, description, icon: Icon, stat, index, color }: SolutionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
      
      <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-construction-accent/30 rounded-2xl p-8 hover:border-construction-accent/50 transition-all duration-300 group">
        {/* Icon container */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-6`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Badge */}
        <div className="mb-4">
          <span className="text-sm font-semibold px-3 py-1 bg-construction-accent/20 text-construction-accent rounded-full border border-construction-accent/30">
            {stat}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        
        {/* Hover indicator */}
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          className="absolute bottom-8 right-8 text-construction-accent"
        >
          <CheckCircle className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const ProblemSolutionSection = () => {
  const problems = [
    {
      title: "Estouros de Orçamento",
      description: "Projetos que ultrapassam o orçamento previsto, gerando prejuízos e comprometendo a viabilidade financeira dos empreendimentos.",
      icon: DollarSign,
      stat: "+35% em média",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Atrasos no Cronograma", 
      description: "Entregas que não cumprem os prazos estabelecidos, levando a multas contratuais e insatisfação dos clientes.",
      icon: Clock,
      stat: "60% dos projetos",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Falhas de Planejamento",
      description: "Falta de visibilidade sobre riscos potenciais, levando a decisões reativas ao invés de preventivas.",
      icon: AlertTriangle,
      stat: "3x mais custos",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const solutions = [
    {
      title: "Previsão Assistida por IA",
      description: "Algoritmos de Machine Learning que aprendem com dados históricos de milhares de obras para prever custos com precisão cirúrgica.",
      icon: TrendingUp,
      stat: "Até 98% de precisão",
      color: "from-construction-accent to-yellow-500"
    },
    {
      title: "Otimização de Recursos",
      description: "Recomendações inteligentes para alocação eficiente de mão de obra e materiais, evitando gargalos e desperdícios.",
      icon: Lightbulb,
      stat: "Redução de 40% custos",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Análise Preditiva de Riscos",
      description: "Identificação precoce de fatores de risco baseada em padrões complexos detectados pela nossa IA avançada.",
      icon: Shield,
      stat: "Antecipa 85% dos riscos",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-construction-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Problems Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full mb-4"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Desafios Reais do Mercado</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Os Problemas que <span className="text-red-400">Custam Milhões</span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Construtores e gerentes de projeto enfrentam diariamente desafios que podem 
              comprometer completamente o sucesso de seus empreendimentos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {problems.map((problem, index) => (
              <ProblemCard key={index} {...problem} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Transformation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-700/50">
              {/* Header badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-gradient-to-r from-construction-accent to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                  Transformação Comprovada
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                {/* Before */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <X className="w-8 h-8 text-red-500" />
                    <h3 className="text-2xl font-bold text-red-400">Gestão Tradicional</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      "Projetos com 35% de estouro em média",
                      "60% dos projetos com atrasos significativos", 
                      "Riscos identificados quando já é tarde demais",
                      "Decisões baseadas em intuição e experiência",
                      "Controle manual e planilhas desatualizadas"
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* After */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-construction-accent" />
                    <h3 className="text-2xl font-bold text-construction-accent">Com ObrasAI</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      "Redução de 40% nos custos operacionais",
                      "94% das obras entregues no prazo",
                      "85% dos riscos antecipados e mitigados",
                      "Decisões baseadas em dados e IA",
                      "Controle em tempo real e automático"
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-construction-accent mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Solutions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-construction-accent/20 text-construction-accent px-4 py-2 rounded-full mb-4"
            >
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">Soluções Inteligentes</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              A <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
                Revolução da IA
              </span> na Construção
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Nossa plataforma utiliza algoritmos avançados de inteligência artificial para 
              transformar completamente a forma como você gerencia seus projetos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution, index) => (
              <SolutionCard key={index} {...solution} index={index} />
            ))}
          </div>
          
          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-construction-accent to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-construction-accent/50 transition-all duration-300 group"
            >
              Ver Como Funciona na Prática
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}; 