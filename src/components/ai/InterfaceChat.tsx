import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  MessageCircle,
  Zap,
  Brain,
  Building,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi, ChatMessage } from "@/services/aiApi";
import { obrasApi } from "@/services/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const InterfaceChat = ({ obraId: propObraId }: { obraId?: string }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedObraId, setSelectedObraId] = useState<string | null>(propObraId || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Carregar obras disponíveis
  const { data: obras = [] } = useQuery({
    queryKey: ["obras"],
    queryFn: () => obrasApi.getAll(),
  });
  
  // Carregar histórico de mensagens
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["chat_messages", selectedObraId],
    queryFn: () => aiApi.getMessages(selectedObraId),
    refetchOnWindowFocus: false,
  });

  // Limpar histórico
  const { mutate: clearHistory, isPending: isClearingHistory } = useMutation({
    mutationFn: async () => {
      await aiApi.clearMessages(selectedObraId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_messages", selectedObraId] });
      queryClient.refetchQueries({ queryKey: ["chat_messages", selectedObraId] });
      toast.success("Histórico limpo com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao limpar histórico: " + error.message);
    },
  });

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    
    if (confirm("Tem certeza que deseja apagar todo o histórico desta conversa? Esta ação não pode ser desfeita.")) {
      clearHistory();
    }
  };

  // Enviar mensagem
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: () => aiApi.sendMessage(message, selectedObraId),
    onSuccess: (data) => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat_messages", selectedObraId] });
      queryClient.refetchQueries({ queryKey: ["chat_messages", selectedObraId] });
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  // Rolar para a mensagem mais recente quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Simulação de typing quando está enviando mensagem
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 max-w-[80%] p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <div className="flex space-x-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="w-2 h-2 bg-purple-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-2 h-2 bg-purple-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-2 h-2 bg-purple-500 rounded-full"
          />
        </div>
        <span className="text-sm text-muted-foreground ml-2">Assistente está digitando...</span>
      </div>
    </motion.div>
  );

  return (
    <Card className="flex flex-col h-[70vh] border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Assistente{" "}
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  ObrasAI
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {messages.length > 0 ? `${messages.length} mensagens` : "Inicie uma conversa"}
              </p>
            </div>
          </CardTitle>
          
          {/* Botão de limpar histórico */}
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={isClearingHistory}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              title="Limpar histórico da conversa"
            >
              {isClearingHistory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Seletor de Obra */}
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedObraId || "__NONE__"} onValueChange={(value) => setSelectedObraId(value === "__NONE__" ? null : value)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione uma obra (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">
                  <span className="text-muted-foreground">Conversa geral</span>
                </SelectItem>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollRef} className="h-full p-4">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-full"
            >
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                <p className="text-sm text-muted-foreground">Carregando conversa...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-full"
            >
              <div className="text-center space-y-3">
                <p className="text-sm text-red-500">Erro ao carregar mensagens: {error.message}</p>
                <Button 
                  onClick={() => queryClient.refetchQueries({ queryKey: ["chat_messages", selectedObraId] })}
                  variant="outline"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </div>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center"
                >
                  <Bot className="h-10 w-10 text-purple-500" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Olá! Sou seu assistente{" "}
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                    ObrasAI
                  </span>
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {selectedObraId 
                    ? `Vamos conversar sobre a obra ${obras.find(o => o.id === selectedObraId)?.nome}! Como posso ajudar?`
                    : "Como posso ajudar com suas dúvidas sobre construção civil, gerenciamento de obras e análise de projetos?"
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-lg">
                {[
                  { icon: Brain, text: "Análise de custos", color: "text-blue-500" },
                  { icon: MessageCircle, text: "Dúvidas técnicas", color: "text-green-500" },
                  { icon: Zap, text: "Otimização", color: "text-orange-500" },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center"
                  >
                    <item.icon className={cn("h-5 w-5 mx-auto mb-2", item.color)} />
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    {/* Mensagem do usuário */}
                    <div className="flex justify-end">
                      <div className="flex items-end gap-2 max-w-[80%]">
                        <div className="space-y-1">
                          <div className="bg-muted/70 p-3 rounded-lg rounded-br-none shadow-sm border">
                            <p className="text-sm whitespace-pre-wrap font-medium">{msg.mensagem}</p>
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10">
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Resposta do bot */}
                    {msg.resposta_bot && (
                      <div className="flex justify-start">
                        <div className="flex items-end gap-2 max-w-[80%]">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="bg-muted/70 p-3 rounded-lg rounded-bl-none shadow-sm border">
                              <p className="text-sm whitespace-pre-wrap">{msg.resposta_bot}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Indicador de digitação */}
                {isPending && <TypingIndicator />}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              selectedObraId 
                ? `Pergunte sobre ${obras.find(o => o.id === selectedObraId)?.nome}...`
                : "Digite sua mensagem..."
            }
            disabled={isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isPending || !message.trim()}
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default InterfaceChat;
