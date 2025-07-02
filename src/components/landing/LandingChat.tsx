import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import logoImageLight from "@/assets/logo/logo_image_dark.png";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface LandingChatProps {
  className?: string;
}

const LandingChat: React.FC<LandingChatProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🏗️ Olá! Sou a IA do ObrasAI, uma plataforma inovadora para gestão de obras na construção civil. Como posso ajudar você a conhecer nossa plataforma? Posso explicar sobre orçamento paramétrico com IA, gestão completa de obras, sistema SINAPI integrado e muito mais!',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const [visitorId] = useState(() => `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openLandingChat', handleOpenChat);
    
    return () => {
      window.removeEventListener('openLandingChat', handleOpenChat);
    };
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setRateLimitMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-landing-chat', {
        body: {
          message: userMessage.content,
          visitor_id: visitorId
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        if (data.type === 'rate_limit') {
          setRateLimitMessage(data.error);
          return;
        }
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '🔧 Ops! Ocorreu um erro temporário. Mas posso te dizer que o ObrasAI tem gestão completa de obras, orçamento paramétrico com IA, sistema SINAPI integrado, gestão de fornecedores e muito mais! Entre em contato conosco para saber mais sobre todas as funcionalidades.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Como funciona o orçamento com IA?",
    "Quais funcionalidades vocês têm?",
    "Como a IA ajuda na construção civil?",
    "Quanto custa o sistema?",
    "Integração com SINAPI?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleInputClick = () => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4"
            style={{ zIndex: 9999 }}
          >
            <Card className="w-96 h-[600px] flex flex-col shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-800 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={logoImageLight} 
                    alt="ObrasAI" 
                    className="h-12 w-auto"
                  />
                  <div>
                    <h3 className="font-semibold">IA do ObrasAI</h3>
                    <p className="text-xs opacity-90">Especialista em Construção Civil</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {message.isBot && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot 
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-1 ${
                        message.isBot ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                      }`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {!message.isBot && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center">
                          <User className="h-4 w-4 text-white dark:text-slate-900" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Pensando...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {rateLimitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3"
                  >
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{rateLimitMessage}</p>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 bg-slate-50 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">💡 Perguntas sugeridas:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-xs px-2 py-1 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-md transition-colors border border-orange-200 dark:border-orange-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative z-10">
                <div className="flex gap-2 relative">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                      }}
                      onKeyDown={handleKeyPress}
                      onClick={handleInputClick}
                      placeholder="Digite sua pergunta..."
                      disabled={isLoading}
                      className="w-full h-10 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-black dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      maxLength={500}
                      autoComplete="off"
                      style={{ 
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shrink-0 relative z-10"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  5 mensagens grátis por visita • Powered by IA DeepSeek
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full h-14 w-14 p-0 bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Pulse effect quando fechado */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-orange-500 -z-10"
          />
        )}
      </motion.div>
    </div>
  );
};

export default LandingChat; 