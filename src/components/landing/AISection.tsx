import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Brain, 
  Calculator,
  CheckCircle,
  Database,
  MessageSquare, 
  Search,
  Target,
  TrendingUp,
  Zap} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AISection = () => {
  const aiFeatures = [
    {
      icon: MessageSquare,
      title: 'Chat Contextual Inteligente',
      description: 'Converse com nossa IA que conhece todos os dados da sua obra. Faça perguntas sobre orçamento, despesas, fornecedores e receba insights precisos.',
    },
    {
      icon: Calculator,
      title: 'Orçamento Paramétrico Automático',
      description: 'IA analisa parâmetros da obra e gera orçamentos precisos baseados na base SINAPI e dados históricos do mercado.',
    },
    {
      icon: BarChart3,
      title: 'Análise Financeira Avançada',
      description: 'Comparação automática entre orçado vs realizado, identificação de desvios e sugestões para otimização de custos.',
    },
    {
      icon: Search,
      title: 'Busca Semântica SINAPI',
      description: 'Encontre códigos e preços oficiais usando linguagem natural. Digite "concreto para laje" e encontre exatamente o que precisa.',
    },
    {
      icon: TrendingUp,
      title: 'Insights Preditivos',
      description: 'IA identifica padrões nos seus projetos e sugere melhorias baseadas em dados históricos e tendências do mercado.',
    },
    {
      icon: Target,
      title: 'Recomendações Personalizadas',
      description: 'Sugestões de fornecedores, materiais e estratégias específicas para cada tipo de obra e região.',
    }
  ];

  const stats = [
    { 
      number: 'SINAPI', 
      label: 'Base de Dados', 
      description: 'Preços oficiais integrados' 
    },
    { 
      number: '21', 
      label: 'Etapas de Obra', 
      description: 'Controle detalhado' 
    },
    { 
      number: '150+', 
      label: 'Insumos', 
      description: 'Categorizados no sistema' 
    },
    { 
      number: '24/7', 
      label: 'Disponibilidade', 
      description: 'Assistente IA sempre ativo' 
    }
  ];

  return (
    <section id="ai-section" className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
            <Brain className="w-4 h-4 mr-2" />
            Inteligência Artificial
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">IA que </span>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Revoluciona
            </span>
            <span className="text-slate-900 dark:text-white"> a Construção Civil</span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Nossa inteligência artificial não é apenas um chatbot. É um especialista em construção civil que analisa dados reais das suas obras, 
            gera insights precisos e toma decisões baseadas em normas técnicas e experiência do setor.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-900 dark:text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.description}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {aiFeatures.map((feature, index) => (
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
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 mb-6">
                  <feature.icon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* CheckCircle para indicar funcionalidade implementada */}
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Implementado</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-block p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-slate-900 dark:text-white font-semibold text-lg">Teste nossa IA agora mesmo!</span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
              Clique no chat flutuante ao lado e faça suas perguntas sobre gestão de obras, 
              orçamentos, sistema SINAPI e todas as funcionalidades do ObrasAI.
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
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversar com a IA
              </Button>
              
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Database className="h-4 w-4" />
                <span>Powered by DeepSeek AI</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export { AISection }; 