import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Shield, Award } from "lucide-react";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const StatItem = ({ value, suffix = "", label, icon: Icon, color, delay }: StatItemProps) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
      
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600"
          />
        </div>
        
        <div className="space-y-2">
          <div className="text-4xl font-bold text-white">
            {count.toLocaleString('pt-BR')}{suffix}
          </div>
          <div className="text-gray-400 text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

export const StatsSection = () => {
  const stats = [
    {
      value: 40,
      suffix: "%",
      label: "Redução média de custos",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      delay: 0
    },
    {
      value: 15000,
      suffix: "+",
      label: "Obras gerenciadas",
      icon: Shield,
      color: "from-blue-500 to-cyan-600",
      delay: 0.1
    },
    {
      value: 98,
      suffix: "%",
      label: "Precisão das previsões",
      icon: Award,
      color: "from-purple-500 to-pink-600",
      delay: 0.2
    },
    {
      value: 24,
      suffix: "/7",
      label: "Suporte disponível",
      icon: Clock,
      color: "from-orange-500 to-red-600",
      delay: 0.3
    }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Números que <span className="text-construction-accent">impressionam</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Nossa plataforma já transformou a gestão de centenas de construtoras em todo o Brasil
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
        
        {/* Trusted by section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20"
        >
          <p className="text-center text-gray-500 mb-8">Confiado por líderes do mercado</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['MRV', 'Cyrela', 'Even', 'Tenda', 'Direcional'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-2xl font-bold text-gray-600"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 