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
            const colorClasses = {
              "text-purple-500": {
                bg: "bg-purple-50 dark:bg-purple-900/20",
                border: "border-purple-200 dark:border-purple-700",
                iconBg: "bg-purple-500/10 dark:bg-purple-400/10",
                iconColor: "text-purple-500 dark:text-purple-400"
              },
              "text-blue-500": {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-200 dark:border-blue-700",
                iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
                iconColor: "text-blue-500 dark:text-blue-400"
              },
              "text-yellow-500": {
                bg: "bg-amber-50 dark:bg-amber-900/20",
                border: "border-amber-200 dark:border-amber-700",
                iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
                iconColor: "text-amber-500 dark:text-amber-400"
              }
            };
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className={`${colors.border} ${colors.bg} backdrop-blur-sm h-full hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{feature.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
          <Card className="border-indigo-200/50 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <span className="text-indigo-700 dark:text-indigo-300">Como usar o Chat IA</span>
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
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
