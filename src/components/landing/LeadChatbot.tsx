import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import logoImageDark from '@/assets/logo/logo_image_dark.png';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface LeadData {
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  interesse?: string;
}

interface LeadChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadChatbot: React.FC<LeadChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Olá! Eu sou a IA do ObrasAI. Vou te ajudar a conhecer nossa plataforma! Qual é o seu nome?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [currentStep, setCurrentStep] = useState('nome');
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log('🚀 Estado atual do chatbot:', {
    currentStep,
    isLeadCaptured,
    leadData,
    messagesCount: messages.length
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Função para simular efeito de digitação
  const typeMessage = async (message: string, delay: number = 50) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      setTypingMessage('');
      
      let currentIndex = 0;
      const timer = setInterval(() => {
        if (currentIndex <= message.length) {
          setTypingMessage(message.slice(0, currentIndex));
          currentIndex++;
          
          // Auto-scroll durante a digitação
          setTimeout(() => scrollToBottom(), 50);
        } else {
          clearInterval(timer);
          setIsTyping(false);
          setTypingMessage('');
          
          // Adicionar mensagem completa às mensagens
          const botMessage: Message = {
            id: Date.now().toString(),
            content: message,
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          resolve();
        }
      }, delay);
    });
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

  // Fluxo de captura de leads - CORRIGIDO: cada step tem sua própria pergunta
  const leadFlow = {
    nome: {
      nextStep: 'email',
      question: '', // pergunta inicial já foi feita
      validation: (value: string) => value.length >= 2
    },
    email: {
      nextStep: 'telefone', 
      question: 'Perfeito! Agora me diga qual é o seu email para contato?',
      validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    telefone: {
      nextStep: 'empresa',
      question: 'Ótimo! Qual é o seu telefone? (opcional)',
      validation: () => true // telefone é opcional
    },
    empresa: {
      nextStep: 'cargo',
      question: 'Qual é o nome da sua empresa ou você é profissional autônomo?',
      validation: (value: string) => value.length >= 2
    },
    cargo: {
      nextStep: 'interesse',
      question: 'Qual é o seu cargo/função?',
      validation: (value: string) => value.length >= 2
    },
    interesse: {
      nextStep: 'completed',
      question: 'Por último, qual é o seu principal interesse no ObrasAI? (ex: controlar custos, organizar obras, etc.)',
      validation: (value: string) => value.length >= 2
    }
  };

  const sendLeadToWebhook = async (leadData: LeadData) => {
    try {
      console.log('🔄 Iniciando envio de lead para n8n...', leadData);
      
      const webhookData = {
        nome: leadData.nome,
        email: leadData.email,
        telefone: leadData.telefone || 'Não informado',
        empresa: leadData.empresa,
        cargo: leadData.cargo,
        interesse: leadData.interesse,
        origem: 'chatbot_landing_page',
        timestamp: new Date().toISOString(),
        plataforma: 'ObrasAI'
      };

      console.log('📤 Dados sendo enviados para webhook:', webhookData);

      const response = await fetch('https://ottodevsystem.app.n8n.cloud/webhook-test/obrasai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      console.log('📡 Resposta do webhook:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Lead enviado com sucesso para webhook n8n');
        return true;
      } else {
        console.error('❌ Erro ao enviar lead para webhook:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar lead para webhook:', error);
      return false;
    }
  };

  const sendAIMessage = async (userMessage: string) => {
    try {
      // Usar Edge Function do Supabase para segurança da API key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-landing-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage,
          visitor_id: `visitor_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          return 'Você atingiu o limite de mensagens. Aguarde alguns minutos para continuar conversando! 😊';
        }
        throw new Error(errorData.error || 'Erro na API da IA');
      }

      const data = await response.json();
      return data.response || 'Desculpe, não consegui processar sua pergunta.';
    } catch (error) {
      console.error('Erro na IA:', error);
      return 'Desculpe, estou com dificuldades técnicas no momento. Mas posso te dizer que o ObrasAI oferece gestão completa de obras, orçamento inteligente com IA, sistema SINAPI integrado e muito mais!';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log('📥 INICIANDO handleSendMessage com input:', inputValue.trim());
    console.log('📊 Estado atual:', { currentStep, isLeadCaptured, leadData });

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      if (!isLeadCaptured) {
        console.log(`🔄 Processando step: ${currentStep}, input: ${currentInput}`);
        
        // Processo de captura de leads
        const currentStepData = leadFlow[currentStep as keyof typeof leadFlow];
        console.log('📋 Dados do step atual:', currentStepData);
        
        if (currentStepData && currentStepData.validation && !currentStepData.validation(currentInput)) {
          console.log('❌ Validação falhou para input:', currentInput);
          let errorMessage = 'Por favor, verifique a informação digitada.';
          if (currentStep === 'email') {
            errorMessage = 'Por favor, digite um email válido.';
          } else if (currentStep === 'nome') {
            errorMessage = 'Por favor, digite seu nome completo.';
          }
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: errorMessage,
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsLoading(false);
          return;
        }

        console.log('✅ Validação passou!');

        // Atualizar dados do lead
        const updatedLeadData = { ...leadData, [currentStep]: currentInput };
        setLeadData(updatedLeadData);
        
        console.log('📝 Dados do lead atualizados:', updatedLeadData);

        // VERIFICAÇÃO EXPLÍCITA SE É O ÚLTIMO STEP
        if (currentStep === 'interesse') {
          console.log('🎯 CONFIRMADO: ÚLTIMO STEP - INTERESSE!');
          console.log('🚀 EXECUTANDO WEBHOOK AUTOMÁTICO...');
          
          // Finalizar captura de leads
          const webhookSuccess = await sendLeadToWebhook(updatedLeadData);
          
          console.log('📡 Resultado do webhook:', webhookSuccess ? 'SUCESSO' : 'FALHA');
          
          const completionMessage = webhookSuccess 
            ? `🎉 Perfeito! Suas informações foram enviadas para nossa equipe comercial.\n\nNossa equipe entrará em contato em breve para apresentar como o ObrasAI pode transformar sua gestão de obras!\n\nEnquanto isso, posso responder suas dúvidas sobre nossa plataforma. O que você gostaria de saber?`
            : `✅ Obrigado pelas informações! Agora posso responder suas dúvidas sobre o ObrasAI. O que você gostaria de saber?`;

          // Usar efeito de digitação para a mensagem final
          await typeMessage(completionMessage, 30); // 30ms delay entre caracteres
          
          setIsLeadCaptured(true);
          
          if (webhookSuccess) {
            toast({
              title: "Dados Enviados!",
              description: "Informações enviadas para nossa equipe comercial!",
              variant: "default",
            });
          }
        } else {
          // Próxima pergunta do fluxo
          const nextStep = currentStepData?.nextStep || 'completed';
          
          console.log(`➡️ MUDANDO DE: ${currentStep} PARA: ${nextStep}`);
          
          setCurrentStep(nextStep);
          
          const nextQuestion = leadFlow[nextStep as keyof typeof leadFlow]?.question;
          
          if (nextQuestion) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: nextQuestion,
              isBot: true,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
          }
        }
      } else {
        console.log('💬 Conversa com IA (lead já capturado)');
        // Conversa com IA após captura de leads - USAR PRD CONTEXT
        const aiResponse = await sendAIMessage(currentInput);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('💥 ERRO em handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro. Mas posso te contar que o ObrasAI é a plataforma mais completa para gestão de obras do Brasil!',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('🏁 Finalizando handleSendMessage');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      id: '1',
      content: '👋 Olá! Eu sou a IA do ObrasAI. Vou te ajudar a conhecer nossa plataforma! Qual é o seu nome?',
      isBot: true,
      timestamp: new Date()
    }]);
    setLeadData({});
    setCurrentStep('nome');
    setIsLeadCaptured(false);
    setInputValue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 border-0">
        {/* Elementos de acessibilidade ocultos visualmente */}
        <DialogTitle className="sr-only">
          Chat com Assistente IA do ObrasAI
        </DialogTitle>
        <DialogDescription className="sr-only">
          Converse com nossa IA especializada em construção civil para esclarecer dúvidas sobre o ObrasAI e suas funcionalidades
        </DialogDescription>
        
        <Card className="h-[550px] flex flex-col shadow-2xl border-0 bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center p-1">
                <img 
                  src={logoImageDark} 
                  alt="ObrasAI" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">IA do ObrasAI</h3>
                <p className="text-xs text-slate-300">
                  {!isLeadCaptured ? 'Especialista em Construção Civil' : 'Especialista em Construção Civil'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLeadCaptured && (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
              
              {/* Botão de reset para debug */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔄 RESETANDO CHAT');
                  resetChat();
                }}
                className="text-white hover:bg-slate-600 h-6 w-6 p-0"
                title="Reset Chat"
              >
                🔄
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-slate-600 h-6 w-6 p-0"
                aria-label="Fechar chat"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-800">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center p-1">
                      <img 
                        src={logoImageDark} 
                        alt="Bot" 
                        className="h-4 w-4 object-contain"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  message.isBot 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="text-xs mt-1 text-slate-300">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {!message.isBot && (
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 justify-start"
              >
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center p-1">
                    <img 
                      src={logoImageDark} 
                      alt="Bot" 
                      className="h-4 w-4 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
                    <span className="text-sm text-slate-300">
                      {!isLeadCaptured ? 'Processando...' : 'Pensando...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Efeito de digitação */}
            {isTyping && typingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 justify-start"
              >
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center p-1">
                    <img 
                      src={logoImageDark} 
                      alt="Bot" 
                      className="h-4 w-4 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-slate-700 text-white rounded-lg p-3 max-w-[85%]">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {typingMessage}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sugestões de perguntas após captura de leads */}
            {isLeadCaptured && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs text-yellow-400">💡</span>
                  <span className="text-xs text-slate-300">Perguntas sugeridas:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Como funciona o orçamento com IA?",
                    "Quais funcionalidades vocês têm?",
                    "Como a IA ajuda na construção civil?",
                    "Quanto custa o sistema?",
                    "Integração com SINAPI?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(suggestion);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-600 bg-slate-800">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    !isLeadCaptured 
                      ? "Digite sua resposta..." 
                      : "Digite sua pergunta..."
                  }
                  disabled={isLoading}
                  className="text-sm h-9 bg-slate-700 text-white placeholder-slate-400 border-slate-600 focus:border-orange-500"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shrink-0 h-9 w-9 p-0 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-slate-400">
                {isLeadCaptured 
                  ? "Chat com IA • Perguntas sobre ObrasAI • Powered by DeepSeek"
                  : "Informações para nossa equipe comercial entrar em contato"
                }
              </p>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LeadChatbot; 