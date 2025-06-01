import { motion } from "framer-motion";
import { Quote, Star, Building, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  index: number;
  color: string;
}

const TestimonialCard = ({ quote, author, role, company, rating, index, color }: TestimonialCardProps) => {
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
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500`} />
      
      <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-construction-accent/50 transition-all duration-300">
        {/* Quote icon */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-4 -left-4 bg-gradient-to-br from-construction-accent to-orange-500 p-3 rounded-full shadow-lg"
        >
          <Quote className="w-6 h-6 text-white" />
        </motion.div>
        
        {/* Stars rating */}
        <div className="flex gap-1 mb-6 pt-4">
          {[...Array(rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
              viewport={{ once: true }}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </motion.div>
          ))}
        </div>
        
        {/* Quote text */}
        <blockquote className="text-gray-300 text-lg leading-relaxed mb-8 group-hover:text-white transition-colors duration-300">
          "{quote}"
        </blockquote>
        
        {/* Author info */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
            <Building className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-white text-lg group-hover:text-construction-accent transition-colors duration-300">
              {author}
            </div>
            <div className="text-gray-400 text-sm">{role}</div>
            <div className="text-construction-accent font-semibold text-sm">{company}</div>
          </div>
        </div>
        
        {/* Hover effect sparkle */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 right-4"
          >
            <Sparkles className="w-5 h-5 text-construction-accent" />
          </motion.div>
        )}
        
        {/* Progress indicator */}
        <motion.div
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-construction-accent to-orange-400 rounded-b-2xl"
        />
      </div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Com o ObrasAI, conseguimos reduzir em 35% os desvios de orçamento e antecipar problemas antes que impactassem nossos projetos. A precisão das previsões é impressionante.",
      author: "Ricardo Mendes",
      role: "Diretor de Operações",
      company: "Construtora Horizonte",
      rating: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      quote: "A plataforma transformou nossa forma de planejar. Conseguimos visualizar gargalos potenciais e otimizar nossos recursos com antecedência, economizando milhões em cada projeto.",
      author: "Ana Paula Silva",
      role: "Gerente de Projetos",
      company: "Incorporadora Elite",
      rating: 5,
      color: "from-construction-accent to-orange-500"
    },
    {
      quote: "Antes do ObrasAI, enfrentávamos constantes surpresas nos custos. Hoje, temos previsibilidade e controle muito maiores sobre nossos empreendimentos. ROI fantástico!",
      author: "Carlos Eduardo Santos",
      role: "CFO",
      company: "Grupo Construir",
      rating: 5,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const companies = [
    { name: "MRV", logo: "🏗️" },
    { name: "Cyrela", logo: "🏢" },
    { name: "Even", logo: "🏠" },
    { name: "Tenda", logo: "🏘️" },
    { name: "Direcional", logo: "🏗️" },
    { name: "PDG", logo: "🏢" }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
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
            <Star className="w-5 h-5" />
            <span className="font-semibold">Avaliações Reais</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            O que Dizem{" "}
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              Nossos Clientes
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Construtores e incorporadoras de todo o Brasil já transformaram sua gestão 
            com o ObrasAI e estão obtendo resultados extraordinários
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard
              key={idx}
              {...testimonial}
              index={idx}
            />
          ))}
        </div>
        
        {/* Companies section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700/30">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Empresas que{" "}
                <span className="text-construction-accent">Confiam</span> no ObrasAI
              </h3>
              <p className="text-gray-400 text-lg">
                Mais de 300+ construtoras já escolheram nossa plataforma
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              {companies.map((company, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-700/70 transition-all duration-300 border border-gray-600/30 hover:border-construction-accent/30"
                >
                  <div className="text-3xl mb-2">{company.logo}</div>
                  <div className="text-white font-semibold text-sm text-center">{company.name}</div>
                </motion.div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { number: "300+", label: "Empresas Ativas", icon: Building },
                { number: "4.9/5", label: "Avaliação Média", icon: Star },
                { number: "98%", label: "Taxa de Satisfação", icon: Sparkles }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 text-construction-accent mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
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
            Junte-se aos Nossos Clientes
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
