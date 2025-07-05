/**
 * 🚀 Hook de Subscription - Verificação de Planos Premium
 * 
 * Hook centralizado para verificar planos, limites e funcionalidades premium
 * Integrado com o sistema de autenticação e Stripe
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth/hooks';

// ✅ Tipos de planos disponíveis
export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

// ✅ Funcionalidades premium por plano
interface PlanFeatures {
  // Limites de uso
  maxObras: number;
  maxFornecedores: number;
  maxDespesas: number;
  maxArmazenamento: number; // em GB
  
  // Funcionalidades avançadas
  aiFeatures: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
}

// ✅ Configuração dos planos
const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxObras: 1,
    maxFornecedores: 5,
    maxDespesas: 10,
    maxArmazenamento: 1,
    aiFeatures: false,
    advancedAnalytics: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
  },
  basic: {
    maxObras: 3,
    maxFornecedores: 20,
    maxDespesas: 100,
    maxArmazenamento: 5,
    aiFeatures: false,
    advancedAnalytics: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
  },
  pro: {
    maxObras: 15,
    maxFornecedores: 100,
    maxDespesas: 500,
    maxArmazenamento: 20,
    aiFeatures: true,
    advancedAnalytics: true,
    customReports: true,
    apiAccess: false,
    prioritySupport: true,
    whiteLabel: false,
  },
  enterprise: {
    maxObras: -1, // Ilimitado
    maxFornecedores: -1,
    maxDespesas: -1,
    maxArmazenamento: 100,
    aiFeatures: true,
    advancedAnalytics: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true,
    whiteLabel: true,
  },
};

// ✅ Mensagens de upgrade contextuais
const UPGRADE_MESSAGES = {
  aiFeatures: "🤖 Funcionalidade Premium! Upgrade para PRO ou ENTERPRISE para usar IA Avançada.",
  advancedAnalytics: "📊 Análises avançadas disponíveis apenas nos planos PRO e ENTERPRISE.",
  customReports: "📑 Relatórios personalizados são exclusivos dos planos PRO e ENTERPRISE.",
  apiAccess: "🔗 Acesso à API disponível apenas no plano ENTERPRISE.",
  prioritySupport: "🆘 Suporte prioritário disponível nos planos PRO e ENTERPRISE.",
  whiteLabel: "🏷️ White Label disponível apenas no plano ENTERPRISE.",
};

export function useSubscription() {
  const { user } = useAuth();
  
  // ✅ Determinar plano atual (mock por enquanto, depois integrar com Stripe)
  const currentPlan: PlanType = useMemo(() => {
    // TODO: Integrar com dados reais do Stripe/Supabase
    // Por enquanto, retorna 'pro' para demonstração
    if (!user) return 'free';
    
    // Verificar dados da subscription no profile do usuário
    const subscription = user.subscription;
    
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    
    // Mapear stripe_product_id para plano
    switch (subscription.stripe_product_id) {
      case 'prod_basic':
        return 'basic';
      case 'prod_pro':
        return 'pro';
      case 'prod_enterprise':
        return 'enterprise';
      default:
        return 'free';
    }
  }, [user]);

  // ✅ Features do plano atual
  const planFeatures = PLAN_FEATURES[currentPlan];
  
  // ✅ Verificações de status
  const isActiveSubscription = user?.subscription?.status === 'active';
  const isPremiumOrHigher = ['pro', 'enterprise'].includes(currentPlan);
  const isEnterprise = currentPlan === 'enterprise';
  
  // ✅ Verificação de funcionalidades
  const canUseFeature = useMemo(() => ({
    aiFeatures: planFeatures.aiFeatures,
    advancedAnalytics: planFeatures.advancedAnalytics,
    customReports: planFeatures.customReports,
    apiAccess: planFeatures.apiAccess,
    prioritySupport: planFeatures.prioritySupport,
    whiteLabel: planFeatures.whiteLabel,
  }), [planFeatures]);
  
  // ✅ Verificação de limites de uso
  const checkUsageLimit = useMemo(() => ({
    canAddObra: (currentCount: number) => 
      planFeatures.maxObras === -1 || currentCount < planFeatures.maxObras,
    
    canAddFornecedor: (currentCount: number) => 
      planFeatures.maxFornecedores === -1 || currentCount < planFeatures.maxFornecedores,
    
    canAddDespesa: (currentCount: number) => 
      planFeatures.maxDespesas === -1 || currentCount < planFeatures.maxDespesas,
    
    hasStorageSpace: (currentUsage: number) => 
      currentUsage < planFeatures.maxArmazenamento,
      
    // Calcular uso restante
    remainingObras: (currentCount: number) => 
      planFeatures.maxObras === -1 ? -1 : Math.max(0, planFeatures.maxObras - currentCount),
    
    remainingFornecedores: (currentCount: number) => 
      planFeatures.maxFornecedores === -1 ? -1 : Math.max(0, planFeatures.maxFornecedores - currentCount),
    
    remainingDespesas: (currentCount: number) => 
      planFeatures.maxDespesas === -1 ? -1 : Math.max(0, planFeatures.maxDespesas - currentCount),
  }), [planFeatures]);
  
  // ✅ Mensagens de upgrade contextuais
  const getUpgradeMessage = (feature: keyof typeof UPGRADE_MESSAGES) => {
    return UPGRADE_MESSAGES[feature] || "Upgrade necessário para esta funcionalidade.";
  };
  
  // ✅ Informações do plano para exibição
  const planInfo = useMemo(() => ({
    name: currentPlan.toUpperCase(),
    displayName: {
      free: 'Gratuito',
      basic: 'Básico',
      pro: 'Profissional',
      enterprise: 'Empresarial',
    }[currentPlan],
    color: {
      free: 'gray',
      basic: 'blue', 
      pro: 'purple',
      enterprise: 'gold',
    }[currentPlan],
    features: planFeatures,
  }), [currentPlan, planFeatures]);

  return {
    // Status geral
    currentPlan,
    planInfo,
    isActiveSubscription,
    isPremiumOrHigher,
    isEnterprise,
    
    // Verificações de funcionalidades
    canUseFeature,
    checkUsageLimit,
    
    // Utilitários
    getUpgradeMessage,
    
    // Dados brutos para casos específicos
    planFeatures,
    user,
  };
}