import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar,
  CheckCircle,
  FileText,
  Play,
  Settings, 
  Upload, 
  UserPlus, 
  Users
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Cadastro Simples',
      description: 'Crie sua conta e configure seu perfil empresarial em menos de 5 minutos.',
      details: [
        'Validação automática de CNPJ',
        'Setup inicial do sistema',
        'Configuração de preferências'
      ],
      time: '5 min',
      color: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
    },
    {
      number: '02',
      icon: Settings,
      title: 'Configuração Personalizada',
      description: 'Configure etapas de obra, categorias de insumos e parâmetros específicos da sua empresa.',
      details: [
        'Personalização de 21 etapas',
        'Configuração de 150+ insumos',
        'Definição de permissões'
      ],
      time: '30 min',
      color: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
    },
    {
      number: '03',
      icon: Upload,
      title: 'Importação de Dados',
      description: 'Importe seus projetos existentes e cadastre fornecedores, obras e dados históricos.',
      details: [
        'Upload de planilhas Excel',
        'Migração de dados existentes',
        'Validação automática'
      ],
      time: '2-4h',
      color: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Gestão Inteligente',
      description: 'Comece a usar todas as funcionalidades: orçamentos, controle de gastos e relatórios.',
      details: [
        'Orçamento paramétrico com IA',
        'Dashboards em tempo real',
        'Relatórios automatizados'
      ],
      time: 'Imediato',
      color: 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30'
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Cronograma Automatizado',
      description: 'Planejamento inteligente baseado em dados históricos'
    },
    {
      icon: FileText,
      title: 'Relatórios Dinâmicos',
      description: 'Análises em tempo real com filtros avançados'
    },
    {
      icon: Users,
      title: 'Gestão de Equipes',
      description: 'Controle de produtividade e alocação de recursos'
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
            <Play className="w-4 h-4 mr-2" />
            Como Funciona
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">Implementação </span>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Rápida
            </span>
            <span className="text-slate-900 dark:text-white"> e Simples</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Em apenas algumas horas você terá um sistema completo de gestão de obras 
            funcionando na sua empresa. Sem complicações técnicas.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-800 dark:to-orange-700 z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 origin-left"
                  />
                </div>
              )}

              <Card className="relative z-10 h-full p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Step number */}
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mr-3">
                    {step.number}
                  </div>
                  <div className="text-sm px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-700">
                    {step.time}
                  </div>
                </div>

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} mb-4`}>
                  <step.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
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
              whileHover={{ y: -5 }}
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

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-block p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-slate-900 dark:text-white font-semibold text-lg">Comece agora mesmo!</span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
              Converse com nossa IA para entender como o ObrasAI pode 
              revolucionar a gestão das suas obras.
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
                <Play className="h-5 w-5 mr-2" />
                Testar Sistema
              </Button>
              
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Implementação em 24h • Suporte incluído</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export { HowItWorksSection };
