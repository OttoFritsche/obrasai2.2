import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle,Clock, DollarSign, Lightbulb, Shield, TrendingUp } from "lucide-react";
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
      <div className="relative h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group">
        {/* Icon container */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-6`}
        >
          <Icon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>
        
        {/* Badge */}
        <div className="mb-4">
          <span className="text-sm font-semibold px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800">
            {stat}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        
        {/* Hover indicator */}
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          className="absolute bottom-8 right-8 text-red-500 dark:text-red-400"
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
      <div className="relative h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group">
        {/* Icon container */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-6`}
        >
          <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        
        {/* Badge */}
        <div className="mb-4">
          <span className="text-sm font-semibold px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
            {stat}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        
        {/* Hover indicator */}
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          className="absolute bottom-8 right-8 text-green-600 dark:text-green-400"
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
      stat: "Problema comum",
      color: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
    },
    {
      title: "Atrasos no Cronograma", 
      description: "Entregas que não cumprem os prazos estabelecidos, levando a multas contratuais e insatisfação dos clientes.",
      icon: Clock,
      stat: "Desafio recorrente",
      color: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30"
    },
    {
      title: "Falhas de Planejamento",
      description: "Falta de visibilidade sobre riscos potenciais, levando a decisões reativas ao invés de preventivas.",
      icon: AlertTriangle,
      stat: "Custos elevados",
      color: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30"
    }
  ];

  const solutions = [
    {
      title: "Previsão Assistida por IA",
      description: "Algoritmos de Machine Learning que analisam dados de obras para prever custos com base em normas técnicas e experiência do setor.",
      icon: TrendingUp,
      stat: "IA Integrada",
      color: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
    },
    {
      title: "Otimização de Recursos",
      description: "Recomendações inteligentes para alocação eficiente de mão de obra e materiais, evitando gargalos e desperdícios.",
      icon: Lightbulb,
      stat: "Otimização projetada",
      color: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
    },
    {
      title: "Análise Preditiva de Riscos",
      description: "Identificação precoce de fatores de risco baseada em padrões detectados pela nossa IA e conhecimento técnico.",
      icon: Shield,
      stat: "Prevenção ativa",
      color: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background sutil igual à hero */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02] dark:opacity-[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-orange-50/20 dark:from-blue-950/20 dark:via-transparent dark:to-orange-950/10" />
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
              className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full mb-4 border border-red-200 dark:border-red-800"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Desafios Reais do Mercado</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Os Problemas que <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Custam Caro</span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              A construção civil enfrenta desafios complexos que podem comprometer projetos. 
              Identificamos os principais problemas e desenvolvemos soluções baseadas em tecnologia.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {problems.map((problem, index) => (
              <ProblemCard key={index} {...problem} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Solutions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-full mb-4 border border-green-200 dark:border-green-800"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Soluções Inteligentes</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Nossa <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Abordagem</span> Tecnológica
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Desenvolvemos ferramentas específicas para resolver cada problema identificado, 
              usando inteligência artificial e conhecimento técnico especializado.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <SolutionCard key={index} {...solution} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 