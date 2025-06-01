import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import InterfaceChat from "@/components/ai/InterfaceChat";
import { Sparkles, MessageCircle, Brain, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ChatAIPage = () => {
  const features = [
    {
      icon: Brain,
      title: "Análise Inteligente",
      description: "Obtenha insights baseados em IA sobre suas obras",
      color: "text-purple-500"
    },
    {
      icon: MessageCircle,
      title: "Conversação Natural",
      description: "Converse naturalmente sobre seus projetos",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Respostas Rápidas",
      description: "Receba sugestões instantâneas para seus problemas",
      color: "text-yellow-500"
    }
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Chat com{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                ObrasAI
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Seu assistente inteligente para construção civil
            </p>
          </div>
        </motion.div>
        
        {/* Cards de recursos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Descrição expandida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Como usar o Chat IA
              </CardTitle>
              <CardDescription>
                Faça perguntas sobre construção civil, orçamentos, materiais, cronogramas,
                ou qualquer aspecto relacionado às suas obras. Nossa IA está pronta para ajudar!
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        
        {/* Interface do Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InterfaceChat />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ChatAIPage;
