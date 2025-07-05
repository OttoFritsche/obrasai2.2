/**
 * 🛡️ Premium Feature Guard - Proteção de Funcionalidades Premium
 * 
 * Componente para proteger funcionalidades premium e exibir telas de upgrade
 * Integrado com o sistema de planos e subscription
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { Crown, Sparkles, Star, Zap } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  feature: 'aiFeatures' | 'advancedAnalytics' | 'customReports' | 'apiAccess' | 'prioritySupport' | 'whiteLabel';
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  feature,
  fallback,
  showUpgrade = true,
}) => {
  const { canUseFeature, getUpgradeMessage, currentPlan, planInfo } = useSubscription();

  // ✅ Se o usuário tem acesso à funcionalidade, mostrar o conteúdo
  if (canUseFeature[feature]) {
    return <>{children}</>;
  }

  // ✅ Se tem fallback customizado, usar ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // ✅ Se não deve mostrar upgrade, não renderizar nada
  if (!showUpgrade) {
    return null;
  }

  // ✅ Tela de upgrade premium
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-blue-200/50 dark:border-blue-700/50 shadow-2xl overflow-hidden">
          
          {/* Header Premium */}
          <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 pb-8">
            <div className="text-center space-y-4">
              
              {/* Ícone principal */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl"
              >
                <Crown className="h-12 w-12 text-white" />
              </motion.div>
              
              {/* Título */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Funcionalidade Premium
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {getUpgradeMessage(feature)}
                </p>
              </motion.div>
              
              {/* Badge do plano atual */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge 
                  variant="outline" 
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 px-4 py-2 text-sm"
                >
                  Plano Atual: {planInfo.displayName}
                </Badge>
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            
            {/* Features Premium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-center text-slate-800 dark:text-white">
                O que você ganha com o upgrade:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IA Avançada */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">IA Avançada</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Contratos inteligentes com análise contextual</p>
                  </div>
                </div>
                
                {/* Análises Premium */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">Análises Avançadas</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Insights detalhados sobre suas obras</p>
                  </div>
                </div>
                
                {/* Templates Pro */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">Templates Pro</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Modelos profissionais pré-aprovados</p>
                  </div>
                </div>
                
                {/* Suporte Premium */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">Suporte Priority</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Atendimento especializado e prioritário</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl px-8 py-4 text-lg font-semibold"
                  onClick={() => {
                    // TODO: Integrar com sistema de pagamento
                    window.open('/subscription', '_blank');
                  }}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Fazer Upgrade Agora
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 dark:border-slate-600 px-8 py-4 text-lg"
                  onClick={() => {
                    // TODO: Redirecionar para comparação de planos
                    window.open('/pricing', '_blank');
                  }}
                >
                  Ver Todos os Planos
                </Button>
              </div>
              
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                🔒 Cancele a qualquer momento • 💳 Teste grátis por 14 dias
              </p>
            </motion.div>

            {/* Testimonial ou garantia */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border"
            >
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-amber-500 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                "O ObrasAI Premium revolucionou nossa gestão de contratos!"
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                — Construtora Silva & Cia
              </p>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};