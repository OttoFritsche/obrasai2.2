import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChatContextual } from '@/hooks/useAIChatContextual';
import { type WidgetConfig } from '@/config/aiWidgetConfig';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  config 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useAIChatContextual();

  // Mensagem de boas-vindas baseada no contexto
  const getWelcomeMessage = (context: string): string => {
    const messages = {
      contratos: 'Olá! Sou seu assistente IA para o módulo de Contratos. Posso te ajudar com dúvidas sobre criação, edição, assinatura e gerenciamento de contratos. O que você gostaria de saber?',
      obras: 'Olá! Sou seu assistente IA para o módulo de Obras. Posso te ajudar com dúvidas sobre cadastro, acompanhamento, status e gerenciamento de obras. Como posso ajudar?',
      despesas: 'Olá! Sou seu assistente IA para o módulo de Despesas. Posso te ajudar com dúvidas sobre lançamento, categorização e controle de despesas. O que você precisa saber?',
      orcamentos: 'Olá! Sou seu assistente IA para o módulo de Orçamentos. Posso te ajudar com dúvidas sobre criação paramétrica, análise de custos e composições. Como posso auxiliar?'
    };
    return messages[context as keyof typeof messages] || 'Olá! Como posso ajudar você hoje?';
  };

  // Inicializar com mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: config.welcomeMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, config.welcomeMessage]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(inputValue, config.pageContext);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Assistente IA</h3>
                  <p className="text-sm opacity-90">
                    {config.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`
                        max-w-[80%] p-3 rounded-lg text-sm
                        ${message.isUser 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }
                      `}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 opacity-70`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    {message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    className="flex gap-3 justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pressione Enter para enviar
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};