// 🤖 Widget Flutuante de IA - Insights de Métricas + Chat Interativo
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Minimize2, 
  Maximize2,
  RefreshCw,
  Sparkles,
  MessageCircle,
  Send,
  User,
  BarChart3
} from 'lucide-react'
import { aiInsights, type AIInsight, type MetricsData } from '@/services/aiInsightsApi'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AIInsightsWidgetProps {
  metrics: MetricsData | null
  isVisible: boolean
  onToggle: () => void
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  metrics,
  isVisible,
  onToggle
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights')
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 🔄 Analisar métricas quando mudarem
  useEffect(() => {
    if (metrics && isVisible) {
      analyzeMetrics()
    }
  }, [metrics, isVisible])

  // 👋 Mensagem de boas-vindas automática
  useEffect(() => {
    if (isVisible && chatMessages.length === 0 && metrics) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Olá! 👋 Sou sua assistente de IA para análise de métricas.\n\nVejo que você tem:\n• ${metrics.leads.total} leads totais\n• ${metrics.users.total} usuários\n• R$ ${metrics.revenue.mrr.toLocaleString()} de MRR\n\nPergunte-me sobre conversões, churn, LTV/CAC ou qualquer métrica!`,
        timestamp: new Date()
      }
      setChatMessages([welcomeMessage])
    }
  }, [isVisible, metrics])

  // 🔄 Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const analyzeMetrics = async () => {
    if (!metrics) return

    setLoading(true)
    try {
      const newInsights = await aiInsights.analyzeMetrics(metrics)
      setInsights(newInsights)
      setLastAnalysis(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Erro ao analisar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  // 💬 Enviar mensagem no chat
  const sendChatMessage = async () => {
    if (!currentMessage.trim() || !metrics) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setChatLoading(true)

    try {
      // Gerar resposta da IA
      const aiResponse = await aiInsights.chatWithMetrics(currentMessage.trim(), metrics)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Erro no chat:', error)
      
      // Resposta de fallback
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente ou verifique se a OpenAI API está configurada.',
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, fallbackMessage])
    } finally {
      setChatLoading(false)
    }
  }

  // ⌨️ Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  // 🎨 Ícones por tipo de insight
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  // 🎨 Cores por prioridade
  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  if (!isVisible) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full h-14 w-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className={`w-96 shadow-2xl border-2 border-purple-200 dark:border-purple-800 ${
          isMinimized ? 'h-auto' : 'h-[500px]'
        }`}>
          {/* 🎯 Header */}
          <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">IA Insights</CardTitle>
                  <CardDescription className="text-xs">
                    Análise inteligente das métricas
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={analyzeMetrics}
                  disabled={loading || !metrics}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 📊 Abas */}
            {!isMinimized && (
              <div className="flex items-center gap-1 mt-3">
                <Button
                  variant={activeTab === 'insights' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('insights')}
                  className="h-7 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Insights
                </Button>
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="h-7 text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
              </div>
            )}

            {lastAnalysis && activeTab === 'insights' && (
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-muted-foreground">
                  Última análise: {lastAnalysis}
                </span>
              </div>
            )}
          </CardHeader>

          {/* 📊 Conteúdo */}
          {!isMinimized && (
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-muted-foreground">Analisando métricas...</p>
                  </div>
                </div>
              ) : (
                <div className="h-[400px]">
                  {/* 📊 ABA INSIGHTS */}
                  {activeTab === 'insights' && (
                    <ScrollArea className="h-full p-4">
                      {insights.length === 0 ? (
                        <div className="text-center py-8">
                          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum insight disponível
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={analyzeMetrics}
                            className="mt-2"
                            disabled={!metrics}
                          >
                            Analisar Métricas
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {insights.map((insight, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border rounded-lg p-3 bg-card"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {getInsightIcon(insight.type)}
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">{insight.title}</h4>
                                    <Badge 
                                      variant={getPriorityColor(insight.priority)}
                                      className="text-xs"
                                    >
                                      {insight.priority}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground">
                                    {insight.message}
                                  </p>
                                  
                                  <Separator className="my-2" />
                                  
                                  <div className="bg-muted/50 rounded p-2">
                                    <p className="text-xs font-medium text-foreground">
                                      💡 Recomendação:
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {insight.recommendation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  )}

                  {/* 💬 ABA CHAT */}
                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                      {/* Mensagens */}
                      <ScrollArea className="flex-1 p-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Converse com a IA sobre suas métricas
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pergunte sobre conversões, churn, LTV/CAC, etc.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((message) => (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                  message.type === 'user' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-muted text-foreground'
                                }`}>
                                  <div className="flex items-start gap-2">
                                    {message.type === 'ai' && (
                                      <Bot className="h-4 w-4 mt-0.5 text-purple-600" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                      </p>
                                      <p className={`text-xs mt-1 ${
                                        message.type === 'user' 
                                          ? 'text-purple-200' 
                                          : 'text-muted-foreground'
                                      }`}>
                                        {message.timestamp.toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            {chatLoading && (
                              <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-purple-600" />
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>

                      {/* Input de mensagem */}
                      <div className="p-4 border-t border-purple-200 dark:border-purple-800">
                        <div className="flex items-end gap-2">
                          <Textarea
                            placeholder="Pergunte sobre suas métricas..."
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={chatLoading || !metrics}
                            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                            rows={1}
                          />
                          <Button
                            onClick={sendChatMessage}
                            disabled={!currentMessage.trim() || chatLoading || !metrics}
                            size="sm"
                            className="h-10 w-10 p-0"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 