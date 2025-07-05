/**
 * 🚀 Contrato com IA Premium - MODERNA
 * 
 * Versão premium exclusiva para clientes PRO/ENTERPRISE
 * Layout moderno com glass-morphism e animações suaves
 * 
 * Funcionalidades:
 * - IA Avançada com templates profissionais
 * - Interface moderna e responsiva
 * - Verificação de plano premium
 * - Análise contextual avançada
 * 
 * @author ObrasAI Team - Premium Version
 * @version 3.0.0
 */

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Crown,
  FileSignature,
  Sparkles,
  Star,
  Zap
} from "lucide-react";
import React, { useMemo } from "react";

import { ContratoAIChat } from "@/components/contratos/ContratoAIChat";
import { ContratoFormSection } from "@/components/contratos/ContratoFormSection";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { PremiumFeatureGuard } from "@/components/subscription/PremiumFeatureGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContratoForm } from "@/hooks/useContratoForm";
import { useObras } from "@/hooks/useObras";
import { useSubscription } from "@/hooks/useSubscription";

const ContratoComIAPremium: React.FC = () => {
  const { obras } = useObras();
  const { currentPlan, canUseFeature } = useSubscription();
  const contratoForm = useContratoForm();

  // ✅ Contexto avançado para IA Premium
  const contratoContext = useMemo(() => {
    const formData = contratoForm.form.getValues();
    const obra = contratoForm.obra;
    
    return {
      // Dados básicos
      contrato: {
        titulo: formData.titulo,
        valor_total: formData.valor_total,
        prazo_execucao: formData.prazo_execucao,
        descricao_servicos: formData.descricao_servicos,
      },
      // Dados da obra (contexto completo)
      obra: obra ? {
        nome: obra.nome,
        endereco: obra.endereco,
        cidade: obra.cidade,
        estado: obra.estado,
        tipo_obra: obra.tipo_obra,
        area_total: obra.area_total,
        orcamento_estimado: obra.orcamento_estimado,
      } : null,
      // Dados de partes
      contratante: {
        nome: formData.contratante_nome,
        documento: formData.contratante_documento,
        endereco: formData.contratante_endereco,
      },
      contratado: {
        nome: formData.contratado_nome,
        documento: formData.contratado_documento,
        endereco: formData.contratado_endereco,
      },
      // Dados financeiros
      financeiro: {
        valor_total: formData.valor_total,
        forma_pagamento: formData.forma_pagamento,
        prazo_execucao: formData.prazo_execucao,
      },
      // Orçamentos relacionados
      orcamentos: contratoForm.orcamentos || [],
      // Metadados
      metadata: {
        plano_usuario: currentPlan,
        template_id: formData.template_id,
        created_at: new Date().toISOString(),
      }
    };
  }, [
    contratoForm.form.watch(), 
    contratoForm.obra, 
    contratoForm.orcamentos,
    currentPlan
  ]);

  return (
    <DashboardLayout>
      <PremiumFeatureGuard feature="aiFeatures">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          
          {/* ✨ Header Premium */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            {/* Background decorativo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 backdrop-blur-3xl" />
            
            <div className="relative container mx-auto py-8 px-6">
              <div className="flex items-center justify-between">
                
                {/* Navegação e título */}
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={contratoForm.voltarParaLista}
                      className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                        <FileSignature className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                          Contrato com IA Avançada
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                          Crie contratos profissionais com inteligência artificial de última geração
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges Premium */}
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-700 dark:text-amber-400 backdrop-blur-sm"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    {currentPlan === 'enterprise' ? 'Enterprise' : 'Pro'}
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400 backdrop-blur-sm"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    IA Avançada
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-400 backdrop-blur-sm"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Templates Pro
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ⚡ Features Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="container mx-auto px-6 pb-6"
          >
            <Card className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-blue-200/20 dark:border-blue-700/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        Recursos Premium Ativados
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        IA avançada • Templates profissionais • Análise contextual • Sugestões inteligentes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="h-4 w-4 text-amber-500 fill-current" 
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎨 Layout Principal Moderno */}
          <div className="container mx-auto px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-8"
            >
              
              {/* 📝 Seção do Formulário - 7 colunas */}
              <div className="xl:col-span-7 space-y-6">
                <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 dark:border-slate-700/20 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                        <FileSignature className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-slate-800 dark:text-white">Dados do Contrato</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ContratoFormSection
                      form={contratoForm.form}
                      obras={obras || []}
                      templates={contratoForm.templates}
                      orcamentos={contratoForm.orcamentos}
                      isCarregandoOrcamentos={contratoForm.isCarregandoOrcamentos}
                      onPreencherDadosOrcamento={contratoForm.preencherDadosOrcamento}
                      onSubmit={contratoForm.handleSubmit}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 🤖 Seção do Chat IA - 5 colunas */}
              <div className="xl:col-span-5">
                <div className="sticky top-6">
                  <Card className="backdrop-blur-md bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 border-blue-200/20 dark:border-blue-700/20 shadow-2xl overflow-hidden">
                    <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="text-slate-800 dark:text-white">Assistente IA Premium</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                            Análise contextual avançada
                          </p>
                        </div>
                        <div className="ml-auto">
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                          >
                            Online
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[600px]">
                        <ContratoAIChat 
                          contratoContext={JSON.stringify(contratoContext, null, 2)}
                          isPremium={true}
                          userPlan={currentPlan}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </motion.div>
          </div>

          {/* 🌟 Floating Action Hints */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="space-y-3">
              {canUseFeature.advancedAnalytics && (
                <Button
                  size="sm"
                  className="backdrop-blur-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl border-0 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Análise Premium
                </Button>
              )}
            </div>
          </motion.div>

        </div>
      </PremiumFeatureGuard>
    </DashboardLayout>
  );
};

export default ContratoComIAPremium;