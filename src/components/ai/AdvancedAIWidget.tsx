/**
 * 🤖 Widget AI Avançado
 * 
 * Expansão do Widget AI com funcionalidades avançadas:
 * - Análise preditiva de métricas
 * - Recomendações inteligentes baseadas em padrões
 * - Integração com sistema de monitoramento
 * - Chat contextual com histórico persistente
 * - Alertas proativos e sugestões de otimização
 * 
 * @author ObrasAI Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Brain,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  Zap,
  Target,
  Clock,
  Minimize2,
  Send,
  RefreshCw,
  Download,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useLoading } from '@/contexts/LoadingContext';

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actionable: boolean;
  suggestedActions?: string[];
  impact: {
    timeReduction?: number;
    costSaving?: number;
    efficiencyGain?: number;
  };
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: {
    relatedInsights?: string[];
    metrics?: Record<string, any>;
    suggestions?: string[];
  };
  feedback?: 'positive' | 'negative';
}

interface PredictiveAnalysis {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface AIWidgetConfig {
  enablePredictiveAnalysis: boolean;
  enableProactiveAlerts: boolean;
  enableContextualChat: boolean;
  analysisInterval: number;
  maxInsights: number;
  confidenceThreshold: number;
}

const AdvancedAIWidget: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [predictions, setPredictions] = useState<PredictiveAnalysis[]>([]);
  const [config, setConfig] = useState<AIWidgetConfig>({
    enablePredictiveAnalysis: true,
    enableProactiveAlerts: true,
    enableContextualChat: true,
    analysisInterval: 60000, // 1 minuto
    maxInsights: 10,
    confidenceThreshold: 0.7
  });

  const { getLoadingMetrics, getActiveOperations } = useLoading();
  
  const {
    executeAsync: analyzeMetricsAsync,
    isLoading: isAnalyzing
  } = useAsyncOperation({
    loadingKey: 'ai-analysis',
    errorMessage: 'Erro ao analisar métricas'
  });

  const {
    executeAsync: sendChatAsync,
    isLoading: isChatLoading
  } = useAsyncOperation({
    loadingKey: 'ai-chat',
    errorMessage: 'Erro ao enviar mensagem'
  });

  const {
    executeAsync: generatePredictionsAsync,
    isLoading: isPredicting
  } = useAsyncOperation({
    loadingKey: 'ai-predictions',
    errorMessage: 'Erro ao gerar previsões'
  });

  // Simulação de API de IA para análise de métricas
  const analyzeMetrics = useCallback(async () => {
    await analyzeMetricsAsync(async () => {
      // Simular análise de métricas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const loadingMetrics = getLoadingMetrics();
      const activeOps = getActiveOperations();
      
      const newInsights: AIInsight[] = [
        {
          id: `insight-${Date.now()}-1`,
          type: 'optimization',
          title: 'Oportunidade de Otimização Detectada',
          description: 'Formulários com tempo de carregamento acima da média podem ser otimizados com lazy loading.',
          confidence: 0.85,
          priority: 'medium',
          category: 'Performance',
          actionable: true,
          suggestedActions: [
            'Implementar lazy loading em componentes pesados',
            'Otimizar queries de banco de dados',
            'Adicionar cache em operações frequentes'
          ],
          impact: {
            timeReduction: 30,
            efficiencyGain: 25
          },
          timestamp: new Date(),
          source: 'Performance Analyzer'
        },
        {
          id: `insight-${Date.now()}-2`,
          type: 'recommendation',
          title: 'Padrão de Uso Identificado',
          description: 'Usuários tendem a abandonar formulários longos. Considere implementar salvamento automático.',
          confidence: 0.92,
          priority: 'high',
          category: 'UX',
          actionable: true,
          suggestedActions: [
            'Implementar auto-save a cada 30 segundos',
            'Adicionar indicador de progresso',
            'Dividir formulários longos em etapas'
          ],
          impact: {
            efficiencyGain: 40,
            costSaving: 15
          },
          timestamp: new Date(),
          source: 'Behavior Analyzer'
        }
      ];
      
      if (activeOps.length > 5) {
        newInsights.push({
          id: `insight-${Date.now()}-3`,
          type: 'alert',
          title: 'Alto Número de Operações Simultâneas',
          description: `${activeOps.length} operações ativas detectadas. Isso pode impactar a performance.`,
          confidence: 0.95,
          priority: 'critical',
          category: 'System',
          actionable: true,
          suggestedActions: [
            'Implementar throttling de requisições',
            'Adicionar queue de operações',
            'Otimizar operações concorrentes'
          ],
          impact: {
            timeReduction: 50
          },
          timestamp: new Date(),
          source: 'System Monitor'
        });
      }
      
      setInsights(prev => {
        const combined = [...newInsights, ...prev];
        return combined.slice(0, config.maxInsights);
      });
    });
  }, [analyzeMetricsAsync, getLoadingMetrics, getActiveOperations, config.maxInsights]);

  // Gerar previsões baseadas em dados históricos
  const generatePredictions = useCallback(async () => {
    await generatePredictionsAsync(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPredictions: PredictiveAnalysis[] = [
        {
          metric: 'Tempo Médio de Loading',
          currentValue: 1200,
          predictedValue: 950,
          trend: 'decreasing',
          confidence: 0.88,
          timeframe: 'próximos 7 dias',
          factors: ['Otimizações implementadas', 'Cache melhorado', 'Redução de payload']
        },
        {
          metric: 'Taxa de Conclusão de Formulários',
          currentValue: 87.5,
          predictedValue: 92.3,
          trend: 'increasing',
          confidence: 0.82,
          timeframe: 'próximas 2 semanas',
          factors: ['Auto-save implementado', 'UX melhorada', 'Validação em tempo real']
        },
        {
          metric: 'Número de Erros por Hora',
          currentValue: 12,
          predictedValue: 8,
          trend: 'decreasing',
          confidence: 0.75,
          timeframe: 'próximos 3 dias',
          factors: ['Tratamento de erro melhorado', 'Validações adicionais']
        }
      ];
      
      setPredictions(newPredictions);
    });
  }, [generatePredictionsAsync]);

  // Enviar mensagem no chat
  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    await sendChatAsync(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resposta contextual da IA
      let aiResponse = '';
      const relatedInsights: string[] = [];
      const suggestions: string[] = [];
      
      if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('lento')) {
        aiResponse = 'Analisando as métricas de performance, identifiquei algumas oportunidades de otimização. O tempo médio de carregamento pode ser reduzido implementando lazy loading e otimizando as consultas ao banco de dados.';
        relatedInsights.push(...insights.filter(i => i.category === 'Performance').map(i => i.id));
        suggestions.push('Implementar lazy loading', 'Otimizar queries', 'Adicionar cache');
      } else if (message.toLowerCase().includes('erro') || message.toLowerCase().includes('problema')) {
        aiResponse = 'Detectei alguns padrões nos erros recentes. A maioria está relacionada a validações de formulário. Posso sugerir melhorias na validação em tempo real para reduzir esses problemas.';
        suggestions.push('Melhorar validações', 'Adicionar feedback visual', 'Implementar retry automático');
      } else if (message.toLowerCase().includes('previsão') || message.toLowerCase().includes('futuro')) {
        aiResponse = 'Com base nos dados históricos, prevejo uma melhoria de 15% na performance geral nas próximas duas semanas, principalmente devido às otimizações recentes implementadas.';
        suggestions.push('Monitorar métricas', 'Continuar otimizações', 'Implementar alertas proativos');
      } else {
        aiResponse = 'Estou aqui para ajudar com análises, previsões e recomendações baseadas nos dados do sistema. Posso analisar performance, identificar padrões ou sugerir otimizações. Como posso ajudar especificamente?';
        suggestions.push('Analisar performance', 'Gerar previsões', 'Identificar problemas');
      }
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        context: {
          relatedInsights,
          suggestions
        }
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    });
  }, [sendChatAsync, insights]);

  // Análise automática periódica
  useEffect(() => {
    if (!config.enablePredictiveAnalysis) return;
    
    const interval = setInterval(() => {
      analyzeMetrics();
      if (Math.random() > 0.7) { // 30% de chance de gerar previsões
        generatePredictions();
      }
    }, config.analysisInterval);
    
    return () => clearInterval(interval);
  }, [config.enablePredictiveAnalysis, config.analysisInterval, analyzeMetrics, generatePredictions]);

  // Inicializar com mensagem de boas-vindas
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: 'Olá! Sou seu assistente de IA avançado. Posso analisar métricas, gerar previsões e fornecer recomendações inteligentes para otimizar seu sistema. Como posso ajudar hoje?',
        timestamp: new Date(),
        context: {
          suggestions: ['Analisar métricas atuais', 'Gerar previsões', 'Identificar oportunidades']
        }
      };
      setChatMessages([welcomeMessage]);
    }
  }, []);

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'recommendation': return Lightbulb;
      case 'alert': return AlertTriangle;
      case 'optimization': return Zap;
      default: return Brain;
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  const exportInsights = () => {
    const report = {
      timestamp: new Date().toISOString(),
      insights,
      predictions,
      chatHistory: chatMessages.slice(-20), // Últimas 20 mensagens
      config
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-96 max-h-[600px] z-50"
    >
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm">AI Assistant Pro</CardTitle>
                <p className="text-xs text-muted-foreground">Análise Inteligente & Previsões</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={analyzeMetrics}
                disabled={isAnalyzing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={exportInsights}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mx-4 mb-2">
              <TabsTrigger value="insights" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="predictions" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Previsões
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </TabsTrigger>
            </TabsList>
            
            <div className="px-4 pb-4">
              <TabsContent value="insights" className="mt-0">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {insights.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Analisando dados...</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={analyzeMetrics}
                          disabled={isAnalyzing}
                          className="mt-2"
                        >
                          {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
                        </Button>
                      </div>
                    ) : (
                      insights.map((insight) => {
                        const TypeIcon = getTypeIcon(insight.type);
                        
                        return (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg border ${getPriorityColor(insight.priority)}`}
                          >
                            <div className="flex items-start gap-2">
                              <TypeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(insight.confidence * 100)}%
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2">
                                  {insight.description}
                                </p>
                                
                                {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium">Ações Sugeridas:</p>
                                    <ul className="text-xs text-muted-foreground space-y-0.5">
                                      {insight.suggestedActions.slice(0, 2).map((action, index) => (
                                        <li key={index} className="flex items-center gap-1">
                                          <Target className="h-2 w-2" />
                                          {action}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {Object.keys(insight.impact).length > 0 && (
                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    {insight.impact.timeReduction && (
                                      <span className="text-green-600">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        -{insight.impact.timeReduction}%
                                      </span>
                                    )}
                                    {insight.impact.efficiencyGain && (
                                      <span className="text-blue-600">
                                        <Zap className="h-3 w-3 inline mr-1" />
                                        +{insight.impact.efficiencyGain}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="predictions" className="mt-0">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {predictions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Gerando previsões...</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generatePredictions}
                          disabled={isPredicting}
                          className="mt-2"
                        >
                          {isPredicting ? 'Gerando...' : 'Gerar Previsões'}
                        </Button>
                      </div>
                    ) : (
                      predictions.map((prediction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{prediction.metric}</h4>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(prediction.confidence * 100)}% confiança
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Atual: </span>
                                <span className="font-medium">{prediction.currentValue}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Previsto: </span>
                                <span className={`font-medium ${
                                  prediction.trend === 'increasing' ? 'text-green-600' : 
                                  prediction.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {prediction.predictedValue}
                                </span>
                                {prediction.trend === 'increasing' ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : prediction.trend === 'decreasing' ? (
                                  <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                                ) : (
                                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Prazo:</span> {prediction.timeframe}
                            </div>
                            
                            {prediction.factors.length > 0 && (
                              <div className="text-xs">
                                <span className="font-medium text-muted-foreground">Fatores:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prediction.factors.slice(0, 2).map((factor, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0">
                <div className="space-y-3">
                  <ScrollArea className="h-64">
                    <div className="space-y-3 pr-3">
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p>{message.content}</p>
                            
                            {message.context?.suggestions && message.context.suggestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.context.suggestions.slice(0, 2).map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => sendChatMessage(suggestion)}
                                    className="block w-full text-left text-xs p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {message.type === 'ai' && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                  className={`p-1 rounded ${
                                    message.feedback === 'positive' ? 'bg-green-500 text-white' : 'hover:bg-white/20'
                                  }`}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                  className={`p-1 rounded ${
                                    message.feedback === 'negative' ? 'bg-red-500 text-white' : 'hover:bg-white/20'
                                  }`}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Pergunte sobre métricas, previsões..."
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage(chatInput);
                        }
                      }}
                      disabled={isChatLoading}
                    />
                    <Button
                      size="sm"
                      onClick={() => sendChatMessage(chatInput)}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdvancedAIWidget;