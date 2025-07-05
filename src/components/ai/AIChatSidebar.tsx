import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Send, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type WidgetConfig } from '@/config/aiWidgetConfig';
import { useSystemChatbot } from '@/hooks/useSystemChatbot';

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
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  config,
  onToggleMinimize,
  isMinimized = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading, fetchSystemContext } = useSystemChatbot();

  // Mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0 && config.showWelcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `🤖 ${config.welcomeMessage}\n\nPosso ajudar você com:\n• 📊 Informações sobre obras e projetos\n• 💰 Controle de despesas\n• 📋 Orçamentos com IA\n• 🏢 Fornecedores e construtoras\n• 📄 Contratos\n• 🔧 Tabela SINAPI\n\nO que você gostaria de saber?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Buscar contexto inicial do sistema
      fetchSystemContext();
    }
  }, [isOpen, config.showWelcomeMessage, config.welcomeMessage]);

  // Auto scroll para última mensagem
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

    try {
      const response = await sendMessage(inputValue);
      
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
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Sugestões de perguntas rápidas
  const quickQuestions = [
    "Quantas obras estão em andamento?",
    "Qual o total de despesas este mês?",
    "Como criar um orçamento com IA?",
    "Mostrar fornecedores cadastrados",
    "Status dos contratos ativos"
  ];

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
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Assistente IA ObrasAI</h3>
                  <p className="text-sm opacity-90">
                    Seu assistente inteligente
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <span className="sr-only">Fechar</span>
                  ✕
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                    
                    <div className={`flex-1 ${message.isUser ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                        message.isUser 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Perguntas rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(question);
                        handleSendMessage();
                      }}
                      className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-3 py-1 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={config.placeholder}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};