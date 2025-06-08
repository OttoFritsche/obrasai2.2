import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      viewport={{ once: true }}
      className="border-b border-gray-700/50 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-construction-accent transition-colors duration-200"
      >
        <h3 className="text-lg font-semibold text-white pr-8">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-construction-accent flex-shrink-0" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 pb-6 pr-12 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQSection = () => {
  const faqs = [
    {
      question: "Como a IA do ObrasAI funciona na prática?",
      answer: "Nossa IA analisa dados históricos de mais de 15.000 obras, identificando padrões de custos, atrasos e riscos. Ela processa informações em tempo real do seu projeto e compara com casos similares, gerando previsões com 98% de precisão. Você recebe alertas automáticos sobre possíveis problemas antes que eles aconteçam."
    },
    {
      question: "Preciso ter conhecimento técnico para usar o sistema?",
      answer: "Não! O ObrasAI foi projetado para ser intuitivo e fácil de usar. Nossa interface é simples e amigável, com tutoriais interativos e suporte 24/7. Em média, nossos clientes levam apenas 2 horas para dominar completamente o sistema. Oferecemos treinamento gratuito para toda sua equipe."
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 30 dias para testar todas as funcionalidades do plano Profissional, sem limitações. Não pedimos cartão de crédito e você pode cancelar a qualquer momento. Durante o teste, você tem acesso completo ao suporte e pode migrar seus dados gratuitamente."
    },
    {
      question: "O ObrasAI integra com outros sistemas que já uso?",
      answer: "Sim! Temos integrações nativas com os principais ERPs do mercado, sistemas de contabilidade, ferramentas de projeto e muito mais. Nossa API permite integração com praticamente qualquer sistema. A migração de dados é gratuita e nossa equipe cuida de tudo para você."
    },
    {
      question: "Qual a diferença entre os planos?",
      answer: "A principal diferença está no número de obras simultâneas, usuários e recursos avançados de IA. O plano Essencial é perfeito para pequenas construtoras, o Profissional para empresas em crescimento, e o Enterprise para grandes construtoras que precisam de personalização total. Todos incluem nossa IA e você pode mudar de plano a qualquer momento."
    },
    {
      question: "Como é calculado o ROI do ObrasAI?",
      answer: "Nossos clientes reportam economia média de 40% em custos e redução de 65% em atrasos. Com base nesses números, o investimento se paga em média em 3 meses. Oferecemos uma calculadora de ROI personalizada onde você pode inserir seus dados e ver exatamente quanto pode economizar."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Não temos fidelidade ou multas. Você pode cancelar seu plano a qualquer momento diretamente no painel. Seus dados ficam disponíveis para download por 90 dias após o cancelamento. Se mudar de ideia, pode reativar mantendo todo seu histórico."
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-6xl">
          <div className="absolute top-20 left-0 w-64 h-64 bg-construction-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
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
            <HelpCircle className="w-5 h-5" />
            <span className="font-semibold">Perguntas Frequentes</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tire suas <span className="text-construction-accent">dúvidas</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Reunimos as perguntas mais comuns dos nossos clientes. 
            Se ainda tiver dúvidas, nossa equipe está pronta para ajudar.
          </p>
        </motion.div>
        
        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto mb-16">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </div>
        
        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-gray-700/50"
        >
          <MessageCircle className="w-12 h-12 text-construction-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-gray-400 mb-6">
            Nossa equipe de especialistas está pronta para esclarecer qualquer dúvida 
            e ajudar você a revolucionar a gestão das suas obras.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-construction-accent to-orange-500 hover:from-construction-accent/90 hover:to-orange-500/90 text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat ao Vivo
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-white/10"
            >
              📞 Agendar Demonstração
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 