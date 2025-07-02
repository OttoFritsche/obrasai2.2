import React, { useRef, useEffect } from 'react';
import { Bot, Send, Copy, Sparkles, Lightbulb } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useContratoAI } from '@/hooks/useContratoAI';

interface ContratoAIChatProps {
  contratoContext: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const ContratoAIChat: React.FC<ContratoAIChatProps> = ({ contratoContext }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = React.useState('');
  
  // Simulando o hook useContratoAI (para não quebrar a estrutura existente)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou a IA especializada em contratos de construção. Como posso ajudá-lo a melhorar este contrato?',
      timestamp: new Date(),
      suggestions: [
        'Revisar cláusulas de pagamento',
        'Sugerir melhorias no escopo',
        'Verificar prazos e multas',
        'Adicionar cláusulas de segurança'
      ]
    }
  ]);
  
  const [isLoading, setIsLoading] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Analisando sua solicitação: "${input}". Com base no contexto do contrato, recomendo revisar as cláusulas de prazo e incluir penalidades por atraso. Isso protegerá melhor os interesses do contratante.`,
        timestamp: new Date(),
        suggestions: [
          'Adicionar cláusula de multa por atraso',
          'Especificar cronograma detalhado',
          'Incluir marcos de entrega'
        ]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          Assistente IA para Contratos
          <Badge variant="outline" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            DeepSeek
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`
                      max-w-[80%] rounded-lg p-3 text-sm
                      ${message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 border'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2 ml-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs h-7"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 border rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    IA analisando...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre o contrato..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            💡 Dica: Pergunte sobre cláusulas, prazos, valores ou solicite revisões específicas
          </div>
        </div>

      </CardContent>
    </Card>
  );
};