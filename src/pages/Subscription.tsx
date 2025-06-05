import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, XIcon, CreditCard, Crown, Zap, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Planos de assinatura
const subscriptionPlans = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Ideal para construtores individuais e pequenas reformas",
    icon: CreditCard,
    color: "from-blue-500 to-cyan-600",
    iconColor: "text-blue-500",
    features: [
      "Até 3 obras simultâneas",
      "Gestão básica de despesas",
      "Armazenamento de 5GB para documentos",
      "Suporte por email"
    ],
    disabled: false,
    highlight: false,
  },
  {
    id: "pro",
    name: "Profissional",
    price: "R$ 249",
    period: "/mês",
    description: "Perfeito para construtoras de médio porte",
    icon: Crown,
    color: "from-purple-500 to-pink-600",
    iconColor: "text-purple-500",
    features: [
      "Até 15 obras simultâneas",
      "Análises de IA para previsão de custos",
      "Gestão completa de fornecedores",
      "Armazenamento de 20GB para documentos",
      "Suporte prioritário"
    ],
    disabled: false,
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: "R$ 499",
    period: "/mês",
    description: "Solução robusta para grandes construtoras",
    icon: Sparkles,
    color: "from-orange-500 to-red-600",
    iconColor: "text-orange-500",
    features: [
      "Obras ilimitadas",
      "IA avançada para otimização de projetos",
      "Integrações personalizadas",
      "Armazenamento de 100GB para documentos",
      "Acesso à API completa",
      "Suporte dedicado 24/7"
    ],
    disabled: false,
    highlight: false,
  }
];

const Subscription = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // ID do plano atual (simulado para demonstração)
  const currentPlanId = subscription?.product_id === "prod_basic" 
    ? "basic" 
    : subscription?.product_id === "prod_enterprise" 
      ? "enterprise" 
      : "pro";
  
  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    
    try {
      // Em uma implementação real, chamaria a função do Edge para criar uma sessão de checkout do Stripe
      // const { data, error } = await supabaseClient.functions.invoke('create-checkout', {
      //   body: { priceId: getPriceIdFromPlanId(planId) }
      // });
      
      // Simulação para demonstração
      console.log(`Iniciando checkout para o plano: ${planId}`);
      
      setTimeout(() => {
        toast({
          title: "Checkout iniciado",
          description: `Você será redirecionado para o checkout do plano ${planId}`,
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast({
        title: "Erro ao iniciar checkout",
        description: "Ocorreu um erro ao tentar iniciar o processo de assinatura.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      // Em uma implementação real, chamaria a função do Edge para criar uma sessão do portal do cliente do Stripe
      // const { data, error } = await supabaseClient.functions.invoke('customer-portal');
      
      // Simulação para demonstração
      console.log("Abrindo portal de gerenciamento de assinatura");
      
      setTimeout(() => {
        toast({
          title: "Portal de gerenciamento",
          description: "Você será redirecionado para o portal de gerenciamento de assinatura.",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao abrir portal:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar abrir o portal de gerenciamento.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
          >
            <CreditCard className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Assinatura</h2>
            <p className="text-muted-foreground">Gerencie seu plano e obtenha mais recursos.</p>
          </div>
        </div>
        
        {/* Status da assinatura atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Seu Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="font-medium">Plano:</p>
                    <p className="font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                      {currentPlanId === "basic" ? "Básico" : 
                       currentPlanId === "pro" ? "Profissional" : 
                       "Empresarial"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="font-medium">Status:</p>
                    <div className="flex items-center">
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`h-2 w-2 rounded-full mr-2 ${subscription.status === "active" ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <p className={subscription.status === "active" ? "text-green-600" : "text-yellow-600"}>
                        {subscription.status === "active" ? "Ativo" : "Pendente"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="font-medium">Renovação:</p>
                    <p className="text-sm font-mono">
                      {subscription.current_period_end ? formatDate(subscription.current_period_end) : "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mx-auto mb-4"
                  >
                    <CreditCard className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-lg text-muted-foreground">Você não possui uma assinatura ativa.</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Escolha um de nossos planos abaixo para começar.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {subscription ? (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isLoading ? "Carregando..." : "Gerenciar Assinatura"}
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubscribe("pro")}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isLoading ? "Carregando..." : "Assinar Agora"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        <div className="mt-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold mb-6 text-center"
          >
            Nossos Planos
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative"
                >
                  <Card className={cn(
                    "relative border-border/50 bg-card/95 backdrop-blur-sm transition-all duration-300",
                    plan.highlight && "border-purple-500/50 shadow-lg shadow-purple-500/20"
                  )}>
                    {plan.highlight && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                      >
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                          Mais Popular
                        </div>
                      </motion.div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-4">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          plan.color
                        )}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className={cn(
                        "text-xl font-bold",
                        plan.highlight && "bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent"
                      )}>
                        {plan.name}
                      </CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <motion.li 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-start"
                          >
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={currentPlanId === plan.id ? "outline" : "default"}
                        className={cn(
                          "w-full transition-all duration-300",
                          plan.highlight && !currentPlanId === plan.id && "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white",
                          currentPlanId === plan.id && "border-2 border-green-500/50 bg-green-500/10 text-green-600"
                        )}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading || plan.disabled || currentPlanId === plan.id}
                      >
                        {currentPlanId === plan.id ? "Plano Atual" : "Selecionar Plano"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* FAQs sobre assinatura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Posso cancelar a qualquer momento?</h4>
                  <p className="text-sm text-muted-foreground">
                    Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Como funciona o período de teste?</h4>
                  <p className="text-sm text-muted-foreground">
                    Oferecemos 14 dias grátis para testar todas as funcionalidades do plano escolhido.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Posso mudar de plano depois?</h4>
                  <p className="text-sm text-muted-foreground">
                    Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Quais formas de pagamento aceitas?</h4>
                  <p className="text-sm text-muted-foreground">
                    Aceitamos cartões de crédito, débito e PIX para sua comodidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Subscription;
