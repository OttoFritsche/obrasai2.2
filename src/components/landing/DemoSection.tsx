import { motion } from "framer-motion";
import { Play, ShieldCheck, Lock, Zap, MonitorPlay, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

export const DemoSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    { icon: Lock, label: "Dados Criptografados", color: "text-blue-400" },
    { icon: ShieldCheck, label: "LGPD Compliant", color: "text-purple-400" },
    { icon: Zap, label: "99.9% Uptime", color: "text-construction-accent" }
  ];

  const demoStats = [
    { number: "3min", label: "Para configurar", description: "Setup completo em minutos" },
    { number: "98%", label: "Precisão IA", description: "Previsões ultra-precisas" },
    { number: "40%", label: "Economia", description: "Redução de custos média" }
  ];

  return (
    <section id="demo" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-construction-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
        
        {/* Floating particles */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-3 h-3 bg-construction-accent/30 rounded-full"
        />
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400/40 rounded-full"
        />
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
            <MonitorPlay className="w-5 h-5" />
            <span className="font-semibold">Demonstração Ao Vivo</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Veja a{" "}
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              Magia Acontecer
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Descubra como nossa IA transforma dados complexos em insights simples e acionáveis
            em uma demonstração interativa de 3 minutos
          </p>
        </motion.div>
        
        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative mb-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-construction-accent/20 to-orange-400/20 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500" />
            
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-gray-700/50 group-hover:border-construction-accent/50 transition-all duration-300">
              {/* Video container */}
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                {/* Mock dashboard preview */}
                <div className="absolute inset-4 bg-slate-900 rounded-xl border border-gray-600/50 overflow-hidden">
                  <div className="bg-slate-800 px-6 py-4 border-b border-gray-600/50 flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-sm">ObrasAI Dashboard</div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {demoStats.map((stat, index) => (
                        <motion.div
                          key={index}
                          animate={{ scale: isHovered ? 1.05 : 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="bg-slate-700/50 p-4 rounded-lg text-center"
                        >
                          <div className="text-2xl font-bold text-construction-accent">{stat.number}</div>
                          <div className="text-xs text-gray-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      {[60, 85, 70, 90].map((width, index) => (
                        <motion.div
                          key={index}
                          animate={{ width: isHovered ? `${width}%` : '40%' }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-2 bg-gradient-to-r from-construction-accent to-orange-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Play button overlay */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVideoPlaying(true)}
                  className="relative z-10 flex items-center justify-center w-20 h-20 bg-gradient-to-br from-construction-accent to-orange-500 rounded-full shadow-2xl hover:shadow-construction-accent/50 transition-all duration-300 group/play"
                >
                  <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                  
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover/play:scale-150 transition-transform duration-500" />
                </motion.button>
                
                {/* Corner decorations */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-gradient-to-br from-construction-accent to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-xs text-construction-accent font-semibold px-2 py-1 bg-construction-accent/20 rounded-full">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-construction-accent/50 transition-all duration-300"
            >
              <feature.icon className={`h-5 w-5 ${feature.color}`} />
              <span className="text-gray-300 font-medium text-sm">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              O que Você Verá na{" "}
              <span className="text-construction-accent">Demonstração</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demoStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-300"
                >
                  <CheckCircle className="w-8 h-8 text-construction-accent mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-construction-accent font-semibold mb-2">{stat.label}</div>
                  <div className="text-gray-400 text-sm">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Pronto para Transformar Sua{" "}
              <span className="text-construction-accent">Gestão</span>?
            </h3>
            <p className="text-gray-400 mb-8">
              Agende uma demonstração personalizada e veja como o ObrasAI pode 
              revolucionar seus projetos de construção
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-construction-accent to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-construction-accent/50 transition-all duration-300 group"
              >
                Agende Demonstração Gratuita
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 hover:border-construction-accent hover:text-white font-bold rounded-xl transition-all duration-300"
              >
                Ver Mais Recursos
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating elements */}
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 360, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-20 opacity-20"
      >
        <Sparkles className="w-8 h-8 text-construction-accent" />
      </motion.div>
      
      <motion.div
        animate={{ y: [20, -20, 20], rotate: [360, 0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 left-20 opacity-20"
      >
        <Zap className="w-6 h-6 text-orange-400" />
      </motion.div>
    </section>
  );
};
