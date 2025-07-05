import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock,
  Rocket,
  Star,
  TrendingUp,
  Users,
  X} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import LeadCaptureForm from './LeadCaptureForm';

const LeadCaptureSection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const benefits = [
    {
      icon: Calculator,
      title: 'Orçamentos 98% mais precisos',
      description: 'IA analisa dados SINAPI e histórico do mercado'
    },
    {
      icon: Clock,
      title: 'Economize 35% do tempo',
      description: 'Automatize processos manuais e repetitivos'
    },
    {
      icon: TrendingUp,
      title: 'Reduza custos em 20%',
      description: 'Identificação proativa de desvios e oportunidades'
    },
    {
      icon: Users,
      title: 'Gestão completa da equipe',
      description: 'Colaboração em tempo real e acompanhamento'
    }
  ];

  const features = [
    '✅ Chat com IA especializada em construção civil',
    '✅ Orçamento paramétrico automático',
    '✅ Sistema SINAPI integrado',
    '✅ Gestão completa de obras e fornecedores',
    '✅ Relatórios financeiros em tempo real',
    '✅ Suporte especializado incluído'
  ];

  const handleLeadSuccess = (leadId: string) => {
    setLeadCaptured(true);
    console.log('Lead capturado com sucesso:', leadId);
  };

  return (
    <>
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Lado esquerdo - Conteúdo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
                <Rocket className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Demonstração Gratuita</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Pronto para{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Revolucionar
                </span>
                <br />
                suas Obras?
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Junte-se a centenas de construtores que já estão economizando tempo e dinheiro 
                com nossa plataforma de IA. Comece sua jornada hoje mesmo!
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Começar Gratuitamente
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    // Scroll para a seção de IA
                    document.getElementById('ai-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="border-2 border-gray-300 hover:border-purple-500 px-8 py-4 rounded-xl text-lg"
                >
                  Ver Demonstração
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>500+</strong> construtores já confiam no ObrasAI
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Lado direito - Features Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">100% Gratuito por 30 dias</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Tudo que você precisa
                  </h3>
                  <p className="text-gray-600">
                    Uma plataforma completa para gestão de obras
                  </p>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 mb-2">
                      🎁 Oferta Limitada
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Primeiros 100 clientes ganham <strong>3 meses grátis</strong> + 
                      consultoria especializada de implantação
                    </p>
                    <div className="text-xs text-gray-500">
                      ⏱️ Válido até o final do mês
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => setIsFormOpen(true)}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Garantir Minha Vaga
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal com formulário de lead */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                🚀 Comece sua Jornada com o ObrasAI
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mt-2">
              Preencha os dados abaixo e nossa equipe entrará em contato para uma demonstração personalizada
            </p>
          </DialogHeader>
          
          <div className="p-6 pt-2">
            <LeadCaptureForm
              onSuccess={handleLeadSuccess}
              onClose={() => setIsFormOpen(false)}
              context={{
                origem: 'cta_landing_page',
                utm_source: 'landing_page',
                utm_medium: 'cta_section'
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { LeadCaptureSection }; 