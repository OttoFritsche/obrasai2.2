import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Award } from "lucide-react";
import { useState } from "react";

export const CTASection = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-construction-dark via-slate-900 to-construction-dark">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-construction-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-construction-accent/20 to-orange-500/20 text-construction-accent px-6 py-3 rounded-full mb-8 border border-construction-accent/30"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Oferta por tempo limitado</span>
          </motion.div>
          
          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">Pronto para </span>
            <span className="bg-gradient-to-r from-construction-accent to-orange-400 bg-clip-text text-transparent">
              triplicar sua produtividade?
            </span>
          </motion.h2>
          
          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            Junte-se a mais de 300 construtoras que já revolucionaram sua gestão de obras. 
            <br />
            <span className="text-construction-accent font-semibold">30 dias grátis</span> • Sem cartão • Cancele quando quiser
          </motion.p>
          
          {/* Benefits grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
          >
            {[
              { icon: Award, text: "Garantia de 30 dias" },
              { icon: Calendar, text: "Setup em 24 horas" },
              { icon: Sparkles, text: "ROI em 3 meses" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
              >
                <item.icon className="w-8 h-8 text-construction-accent mx-auto mb-2" />
                <p className="text-gray-300">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-construction-accent to-orange-500 hover:from-construction-accent/90 hover:to-orange-500/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl shadow-construction-accent/30 group"
              >
                <span className="font-bold">Começar Teste Gratuito</span>
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-gray-600 hover:border-construction-accent hover:bg-white/10 text-lg px-10 py-7 rounded-xl backdrop-blur-sm"
                onClick={() => navigate("/login")}
              >
                Já sou cliente
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-slate-800 flex items-center justify-center text-white font-semibold text-xs"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p>
              <span className="text-construction-accent font-semibold">+300</span> empresas 
              já transformaram sua gestão
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating elements */}
      {isHovered && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 right-20 text-4xl"
          >
            🚀
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute bottom-20 left-20 text-4xl"
          >
            🏗️
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-40 left-1/2 text-4xl"
          >
            ⚡
          </motion.div>
        </>
      )}
    </section>
  );
};
