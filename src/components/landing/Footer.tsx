import { motion } from "framer-motion";
import { Building2, Phone, Mail, MapPin, Shield, Clock, Award } from "lucide-react";
import logoDarkHorizon from "@/assets/logo/logo_dark_horizon.png";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white relative">
      <div className="container mx-auto px-4 relative">
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
                <img 
                  src={logoDarkHorizon} 
                  alt="ObrasAI" 
                  className="h-12 w-auto"
                />
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-8 max-w-md">
                Sistema profissional de gestão de obras com inteligência artificial. 
                Reduza custos, elimine atrasos e tome decisões baseadas em dados reais.
              </p>
              
              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-4 w-4 text-orange-400" />
                  <span>+55 (11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-orange-400" />
                  <span>contato@obrasai.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="h-4 w-4 text-orange-400" />
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
                  { label: "Funcionalidades", href: "#features" },
                  { label: "Preços", href: "#pricing" },
                  { label: "Cases de Sucesso", href: "#testimonials" },
                  { label: "Blog", href: "/blog" },
                  { label: "Central de Ajuda", href: "/help" },
                  { label: "API Docs", href: "/api" }
                ].map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="text-slate-300 hover:text-orange-400 transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
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
                  { label: "Sobre Nós", href: "/about" },
                  { label: "Carreiras", href: "/careers" },
                  { label: "Contato", href: "/contact" },
                  { label: "Parcerias", href: "/partners" },
                  { label: "Imprensa", href: "/press" },
                  { label: "Política de Privacidade", href: "/privacy" }
                ].map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="text-slate-300 hover:text-orange-400 transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        
        {/* Trust section */}
        <div className="border-t border-slate-800 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-6 h-6 text-orange-400" />
              <div>
                <div className="font-semibold text-white">99.9% Uptime</div>
                <div className="text-sm text-slate-400">Disponibilidade</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-orange-400" />
              <div>
                <div className="font-semibold text-white">LGPD</div>
                <div className="text-sm text-slate-400">Compliant</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="text-slate-400 text-sm">
              © 2024 ObrasAI. Todos os direitos reservados.
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="/terms" className="text-slate-400 hover:text-orange-400 transition-colors">
                Termos de Uso
              </a>
              <a href="/privacy" className="text-slate-400 hover:text-orange-400 transition-colors">
                Privacidade
              </a>
              <a href="/cookies" className="text-slate-400 hover:text-orange-400 transition-colors">
                Cookies
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
