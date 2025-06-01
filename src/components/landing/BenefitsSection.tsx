import { motion } from "framer-motion";
import { 
  TrendingDown, 
  Clock, 
  Brain, 
  Shield, 
  Users, 
  BarChart,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  color: string;
  index: number;
}

const BenefitCard = ({ icon: Icon, title, description, stats, color, index }: BenefitCardProps) => {
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
      
      <div className="relative h-full bg-slate-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300 group">
        {/* Icon container */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-6`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
        
        {/* Stats */}
        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center justify-between py-2 border-b border-gray-700/50"
            >
              <span className="text-sm text-gray-500">{stat.label}</span>
              <span className="text-lg font-bold text-construction-accent">{stat.value}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Hover indicator */}
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          className="absolute bottom-8 right-8 text-construction-accent"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Redução de Custos",
      description: "IA analisa padrões e identifica oportunidades de economia em tempo real, otimizando recursos e eliminando desperdícios.",
      stats: [
        { label: "Economia média", value: "40%" },
        { label: "ROI", value: "3 meses" },
        { label: "Redução desperdícios", value: "65%" }
      ],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Entregas no Prazo",
      description: "Previsões precisas de IA antecipam riscos e gargalos, garantindo que suas obras sejam entregues dentro do cronograma.",
      stats: [
        { label: "Obras no prazo", value: "94%" },
        { label: "Antecipação riscos", value: "15 dias" },
        { label: "Produtividade", value: "+45%" }
      ],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Brain,
      title: "Decisões Inteligentes",
      description: "Insights baseados em dados reais de milhares de obras, ajudando você a tomar as melhores decisões estratégicas.",
      stats: [
        { label: "Precisão previsões", value: "98%" },
        { label: "Dados analisados", value: "15TB" },
        { label: "Insights/dia", value: "200+" }
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Proteção de dados com criptografia de ponta, conformidade LGPD e certificações ISO para sua tranquilidade.",
      stats: [
        { label: "Uptime", value: "99.9%" },
        { label: "Certificações", value: "ISO 27001" },
        { label: "Backup", value: "Tempo real" }
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Users,
      title: "Gestão de Equipes",
      description: "Centralize a comunicação, acompanhe a produtividade e gerencie suas equipes com eficiência nunca vista.",
      stats: [
        { label: "Comunicação", value: "+85%" },
        { label: "Conflitos", value: "-70%" },
        { label: "Satisfação", value: "4.8/5" }
      ],
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: BarChart,
      title: "Relatórios Avançados",
      description: "Dashboards customizáveis e relatórios detalhados que transformam dados complexos em insights acionáveis.",
      stats: [
        { label: "Tipos relatórios", value: "50+" },
        { label: "Tempo geração", value: "2 seg" },
        { label: "Personalização", value: "100%" }
      ],
      color: "from-teal-500 to-green-600"
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-construction-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
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
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Benefícios Comprovados</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Por que as construtoras escolhem o{" "}
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              ObrasAI
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Não é apenas um software. É uma revolução na forma como você gerencia suas obras, 
            com resultados comprovados desde o primeiro mês.
          </p>
        </motion.div>
        
        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Junte-se a mais de 300 construtoras que já transformaram sua gestão
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-construction-accent to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-construction-accent/50 transition-all duration-300"
          >
            Ver Casos de Sucesso
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}; 