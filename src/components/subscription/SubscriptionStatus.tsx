import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Crown, Sparkles, X } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SubscriptionStatusProps {
  showUsageStats?: boolean;
  compact?: boolean;
  className?: string;
}

export const SubscriptionStatus = ({ 
  showUsageStats = true, 
  compact = false,
  className 
}: SubscriptionStatusProps) => {
  const { 
    subscription, 
    currentPlan, 
    planConfig, 
    isActiveSubscription,
    isPremiumOrHigher 
  } = useSubscription();

  // Ícone e cor baseados no plano
  const planDisplay = useMemo(() => {
    switch (currentPlan) {
      case 'free':
        return {
          icon: Clock,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          name: 'Gratuito',
        };
      case 'basic':
        return {
          icon: Check,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          name: 'Básico',
        };
      case 'pro':
        return {
          icon: Crown,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-700',
          name: 'Profissional',
        };
      case 'enterprise':
        return {
          icon: Sparkles,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-700',
          name: 'Empresarial',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          name: 'Gratuito',
        };
    }
  }, [currentPlan]);

  // Status da assinatura
  const subscriptionStatus = useMemo(() => {
    if (!subscription) {
      return { status: 'free', label: 'Gratuito', color: 'default' };
    }

    switch (subscription.status) {
      case 'active':
        return { status: 'active', label: 'Ativo', color: 'success' };
      case 'past_due':
        return { status: 'past_due', label: 'Pendente', color: 'warning' };
      case 'canceled':
        return { status: 'canceled', label: 'Cancelado', color: 'destructive' };
      case 'incomplete':
        return { status: 'incomplete', label: 'Incompleto', color: 'warning' };
      default:
        return { status: 'inactive', label: 'Inativo', color: 'secondary' };
    }
  }, [subscription]);

  const StatusIcon = planDisplay.icon;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon className={cn("h-4 w-4", planDisplay.color)} />
        <span className="text-sm font-medium">{planDisplay.name}</span>
        <Badge variant={subscriptionStatus.color as any}>
          {subscriptionStatus.label}
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      <Card className={cn("border-2", planDisplay.borderColor, planDisplay.bgColor)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", planDisplay.color)} />
              <span>Plano {planDisplay.name}</span>
            </div>
            <Badge variant={subscriptionStatus.color as any}>
              {subscriptionStatus.label}
            </Badge>
          </CardTitle>
          {subscription?.current_period_end && (
            <CardDescription>
              Renovação em {formatDate(subscription.current_period_end)}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status da assinatura */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
            <div className="flex items-center gap-2">
              {isActiveSubscription ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : subscription?.status === 'past_due' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isActiveSubscription ? 'Assinatura ativa' : 'Assinatura inativa'}
              </span>
            </div>
            {!isActiveSubscription && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = '/subscription'}
              >
                Ativar
              </Button>
            )}
          </div>

          {/* Estatísticas de uso */}
          {showUsageStats && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Limites do plano</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Obras</span>
                  <span className="font-mono">
                    {planConfig.maxObras === -1 ? 'Ilimitadas' : `0/${planConfig.maxObras}`}
                  </span>
                </div>
                {planConfig.maxObras !== -1 && (
                  <Progress value={0} className="h-2" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fornecedores</span>
                  <span className="font-mono">
                    {planConfig.maxFornecedores === -1 ? 'Ilimitados' : `0/${planConfig.maxFornecedores}`}
                  </span>
                </div>
                {planConfig.maxFornecedores !== -1 && (
                  <Progress value={0} className="h-2" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Armazenamento</span>
                  <span className="font-mono">
                    0GB/{planConfig.storage}GB
                  </span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          )}

          {/* Funcionalidades do plano */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Funcionalidades</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {planConfig.aiFeatures ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span>IA Avançada</span>
              </div>
              <div className="flex items-center gap-2">
                {planConfig.advancedAnalytics ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span>Análises</span>
              </div>
              <div className="flex items-center gap-2">
                {planConfig.prioritySupport ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span>Suporte Prioritário</span>
              </div>
              <div className="flex items-center gap-2">
                {planConfig.apiAccess ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span>API Access</span>
              </div>
            </div>
          </div>

          {/* Botão de gerenciamento */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/subscription'}
            >
              {isPremiumOrHigher ? 'Gerenciar Assinatura' : 'Fazer Upgrade'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};