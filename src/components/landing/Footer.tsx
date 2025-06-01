import { motion } from "framer-motion";
import { Zap, Github, Linkedin, Twitter, Mail, Phone, MapPin, Shield, Award, Heart } from "lucide-react";

export const Footer = () => {
  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contato@obrasai.com", label: "Email" }
  ];

  const certifications = [
    { icon: Shield, label: "ISO 27001" },
    { icon: Award, label: "SOC 2 Type II" },
    { icon: Shield, label: "LGPD Compliant" }
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-construction-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-br from-construction-accent to-orange-500 rounded-xl flex items-center justify-center"
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ObrasAI
                </h3>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Transformando a gestão de construções com inteligência artificial avançada. 
                Reduza custos, evite atrasos e tome decisões mais inteligentes.
              </p>
              
              {/* Contact info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-construction-accent" />
                  <span>contato@obrasai.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-construction-accent" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-construction-accent" />
                  <span>São Paulo, SP - Brasil</span>
                </div>
              </div>
            </motion.div>
            
            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">Recursos</h4>
              <ul className="space-y-3">
                {[
                  { label: "Plataforma", href: "#features" },
                  { label: "Preços", href: "#pricing" },
                  { label: "Documentação", href: "#" },
                  { label: "API", href: "#" },
                  { label: "Integrações", href: "#" },
                  { label: "Suporte", href: "#" }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-construction-accent transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">Empresa</h4>
              <ul className="space-y-3">
                {[
                  { label: "Sobre Nós", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Carreiras", href: "#" },
                  { label: "Imprensa", href: "#" },
                  { label: "Parceiros", href: "#" },
                  { label: "Contato", href: "#" }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-construction-accent transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          {/* Newsletter section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 p-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Fique por dentro das{" "}
                <span className="text-construction-accent">novidades</span>
              </h3>
              <p className="text-gray-400 mb-6">
                Receba dicas exclusivas, novos recursos e insights sobre IA na construção civil
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-construction-accent transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-construction-accent to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-construction-accent/25 transition-all duration-300"
                >
                  Inscrever
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-gray-700/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-center md:text-left"
            >
              <p>
                &copy; {new Date().getFullYear()} ObrasAI. Todos os direitos reservados.
              </p>
              <p className="text-sm mt-1">
                Feito com <Heart className="inline w-4 h-4 text-red-400 mx-1" /> para revolucionar a construção civil
              </p>
            </motion.div>
            
            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 border border-gray-600/50 hover:border-construction-accent/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-construction-accent transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
            
            {/* Certifications */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-lg border border-gray-700/30"
                >
                  <cert.icon className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400 font-medium">{cert.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Legal links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-8 pt-6 border-t border-gray-700/30 text-center"
          >
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { label: "Termos de Serviço", href: "#" },
                { label: "Política de Privacidade", href: "#" },
                { label: "Política de Cookies", href: "#" },
                { label: "LGPD", href: "#" }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-400 hover:text-construction-accent transition-colors duration-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
