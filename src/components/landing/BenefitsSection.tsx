import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  Target,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Redução de Custos',
      description: 'Controle preciso de gastos com orçamentos paramétricos baseados na tabela SINAPI oficial.',
      metric: 'Até 30%',
      detail: 'Economia projetada',
      color: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
    },
    {
      icon: Clock,
      title: 'Otimização de Tempo',
      description: 'Automatização de processos manuais e relatórios instantâneos para decisões ágeis.',
      metric: '70%',
      detail: 'Menos tempo manual',
      color: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
    },
    {
      icon: BarChart3,
      title: 'Visibilidade Total',
      description: 'Dashboards em tempo real com métricas consolidadas de todas as obras.',
      metric: '100%',
      detail: 'Transparência',
      color: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
    },
    {
      icon: Shield,
      title: 'Segurança de Dados',
      description: 'Isolamento completo entre empresas com Row Level Security nativo do Supabase.',
      metric: 'RLS',
      detail: 'Nível enterprise',
      color: 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
    },
    {
      icon: Target,
      title: 'Gestão Precisa',
      description: 'Controle detalhado por 21 etapas de obra e 150+ insumos especializados.',
      metric: '21',
      detail: 'Etapas controladas',
      color: 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30'
    },
    {
      icon: Zap,
      title: 'Implementação Rápida',
      description: 'Sistema pronto para uso em 24 horas com suporte completo de onboarding.',
      metric: '24h',
      detail: 'Para começar',
      color: 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30'
    }
  ];

  const stats = [
    {
      icon: Users,
      number: 'Multi-tenant',
      label: 'Arquitetura',
      description: 'Isolamento total de dados'
    },
    {
      icon: Shield,
      number: 'ISO 27001',
      label: 'Segurança',
      description: 'Padrão internacional'
    },
    {
      icon: Clock,
      number: '99.9%',
      label: 'Uptime',
      description: 'Disponibilidade garantida'
    },
    {
      icon: CheckCircle,
      number: 'SINAPI',
      label: 'Base oficial',
      description: 'Preços atualizados'
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
            <TrendingUp className="w-4 h-4 mr-2" />
            Benefícios
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">Resultados </span>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Mensuráveis
            </span>
            <span className="text-slate-900 dark:text-white"> para sua Empresa</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Nossa plataforma foi desenvolvida para gerar resultados concretos e mensuráveis 
            na gestão das suas obras e controle de custos.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="h-full p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.color} mb-6`}>
                  <benefit.icon className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                </div>

                {/* Metric highlight */}
                <div className="mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {benefit.metric}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{benefit.detail}</div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Status implementado */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Disponível</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-900 dark:text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.description}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="inline-block p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Pronto para transformar sua gestão de obras?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
              Converse com nossa IA e descubra como podemos otimizar 
              seus processos de construção civil.
            </p>
            <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Sistema em operação • Resultados comprovados</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export { BenefitsSection }; 