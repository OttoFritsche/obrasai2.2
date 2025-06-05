import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calculator, 
  Users, 
  FileText, 
  BarChart3, 
  Shield,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeaturesSection = () => {
  const features = [
    {
      icon: Building2,
      title: 'Gestão Completa de Obras',
      description: 'Controle total das suas obras com CRUD completo, validação de datas, orçamentos e endereços.',
      stats: { label: 'Obras ativas', value: 'Ilimitadas' },
      color: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
    },
    {
      icon: Calculator,
      title: 'Orçamento Paramétrico com IA',
      description: 'Cálculo automático de custos baseado na base SINAPI oficial e parâmetros personalizáveis.',
      stats: { label: 'Base SINAPI', value: 'Integrada' },
      color: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
    },
    {
      icon: Users,
      title: 'Fornecedores PJ e PF',
      description: 'CRUD completo com validação de CNPJ/CPF, razão social e dados completos.',
      stats: { label: 'Validação', value: 'Automática' },
      color: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
    },
    {
      icon: FileText,
      title: 'Controle de Despesas',
      description: 'Categorização detalhada por 21 etapas de obra e 150+ insumos especializados.',
      stats: { label: 'Categorias', value: '21 etapas' },
      color: 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30'
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Dashboards',
      description: 'Métricas consolidadas, listagens avançadas com filtros e exportação de dados.',
      stats: { label: 'Relatórios', value: 'Tempo real' },
      color: 'from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30'
    },
    {
      icon: Shield,
      title: 'Segurança Multi-tenant',
      description: 'RLS (Row Level Security) nativo com isolamento completo de dados por tenant.',
      stats: { label: 'Segurança', value: 'ISO 27001' },
      color: 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
    }
  ];

  return (
    <section id="features" className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
            <Building2 className="w-4 h-4 mr-2" />
            Funcionalidades
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">Sistema </span>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Completo
            </span>
            <span className="text-slate-900 dark:text-white"> para Construção</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Todas as ferramentas necessárias para gerenciar suas obras de forma profissional,
            integradas em uma única plataforma moderna e segura.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
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
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{feature.stats.label}</span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {feature.stats.value}
                    </span>
                  </div>
                </div>

                {/* Status implementado */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Implementado</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {[
            { 
              icon: Clock, 
              title: 'Implementação', 
              value: '24h', 
              desc: 'Setup completo' 
            },
            { 
              icon: DollarSign, 
              title: 'Economia projetada', 
              value: '30%', 
              desc: 'Otimização de custos' 
            },
            { 
              icon: Shield, 
              title: 'Segurança', 
              value: 'RLS', 
              desc: 'Nível enterprise' 
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{benefit.value}</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">{benefit.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{benefit.desc}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export { FeaturesSection };
