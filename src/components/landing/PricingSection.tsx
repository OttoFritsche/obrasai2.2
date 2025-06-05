import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Building, 
  Zap,
  Users,
  MessageCircle,
  Shield,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const plans = [
    {
      name: 'Básico',
      subtitle: 'Para pequenas construtoras',
      price: 'R$ 299',
      period: '/mês',
      icon: Building,
      featured: false,
      color: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
      features: [
        { name: 'Até 5 obras simultâneas', included: true },
        { name: 'Gestão básica de fornecedores', included: true },
        { name: 'Relatórios essenciais', included: true },
        { name: 'Base SINAPI integrada', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Orçamento paramétrico', included: false },
        { name: 'IA para análises avançadas', included: false },
        { name: 'Dashboards personalizados', included: false },
        { name: 'API para integrações', included: false }
      ],
      description: 'Ideal para empresas que estão começando na digitalização'
    },
    {
      name: 'Profissional',
      subtitle: 'Recomendado para médias empresas',
      price: 'R$ 599',
      period: '/mês',
      icon: Star,
      featured: true,
      color: 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30',
      features: [
        { name: 'Obras ilimitadas', included: true },
        { name: 'Gestão completa de fornecedores', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'Base SINAPI integrada', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Orçamento paramétrico com IA', included: true },
        { name: 'IA para análises preditivas', included: true },
        { name: 'Dashboards personalizados', included: true },
        { name: 'API para integrações', included: false }
      ],
      description: 'Funcionalidades completas para maximizar resultados'
    },
    {
      name: 'Enterprise',
      subtitle: 'Para grandes construtoras',
      price: 'Sob consulta',
      period: '',
      icon: Crown,
      featured: false,
      color: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
      features: [
        { name: 'Obras ilimitadas', included: true },
        { name: 'Gestão completa multi-tenant', included: true },
        { name: 'Relatórios customizados', included: true },
        { name: 'Base SINAPI + dados próprios', included: true },
        { name: 'Suporte 24/7 dedicado', included: true },
        { name: 'IA personalizada', included: true },
        { name: 'Machine Learning avançado', included: true },
        { name: 'Dashboards ilimitados', included: true },
        { name: 'API completa + webhooks', included: true }
      ],
      description: 'Solução personalizada com recursos exclusivos'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'RLS nativo e criptografia de ponta a ponta'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'Dashboards em tempo real com métricas personalizadas'
    },
    {
      icon: Users,
      title: 'Suporte Especializado',
      description: 'Equipe técnica com expertise em construção civil'
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background sutil igual à hero */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02] dark:opacity-[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-orange-50/20 dark:from-blue-950/20 dark:via-transparent dark:to-orange-950/10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Planos
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">Escolha o </span>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Plano Ideal
            </span>
            <span className="text-slate-900 dark:text-white"> para sua Empresa</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Soluções flexíveis que crescem com sua empresa. Todos os planos incluem 
            a base SINAPI oficial e suporte técnico especializado.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <Card className={`h-full p-8 ${plan.featured ? 'ring-2 ring-orange-200 dark:ring-orange-700 shadow-xl' : 'shadow-sm hover:shadow-lg'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                    <plan.icon className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {plan.subtitle}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-lg">
                      {plan.period}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.featured
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  } font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300`}
                  onClick={() => {
                    const event = new CustomEvent('openLandingChat');
                    window.dispatchEvent(event);
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ/Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-block p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg max-w-2xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Dúvidas sobre qual plano escolher?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Nossa IA pode ajudar você a entender qual plano melhor se adapta 
              às necessidades da sua empresa. Converse conosco agora!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  const event = new CustomEvent('openLandingChat');
                  window.dispatchEvent(event);
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversar com IA
              </Button>
              
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Teste grátis • Sem compromisso</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export { PricingSection }; 