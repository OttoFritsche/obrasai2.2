import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Loader2, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  MessageCircle,
  Zap,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi, ChatMessage } from "@/services/aiApi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const InterfaceChat = ({ obraId }: { obraId?: string }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Carregar histórico de mensagens
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat_messages", obraId],
    queryFn: () => aiApi.getMessages(obraId),
  });

  // Enviar mensagem
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: () => aiApi.sendMessage(message, obraId),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat_messages", obraId] });
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
                  Como posso ajudar com suas dúvidas sobre construção civil, gerenciamento de obras 
                  e análise de projetos?
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
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-xl p-4 shadow-sm",
                      msg.resposta_bot === null
                        ? "ml-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {msg.resposta_bot !== null ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            Assistente ObrasAI
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDateTime(msg.created_at)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-6 w-6 ml-auto">
                            <AvatarFallback className="bg-blue-500 text-white text-xs font-bold">
                              <UserIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-blue-100 font-medium">Você</span>
                          <span className="text-xs text-blue-100/70">
                            {formatDateTime(msg.created_at)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm leading-relaxed break-words",
                      msg.resposta_bot === null ? "text-white" : ""
                    )}>
                      {msg.resposta_bot || msg.mensagem}
                    </p>
                  </motion.div>
                ))}
                
                {/* Indicador de digitação */}
                {isPending && <TypingIndicator />}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t border-border/50 p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <div className="relative flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isPending}
              className={cn(
                "pr-12 bg-background/50 focus:bg-background transition-colors",
                "border-border/50 focus:border-purple-500/50",
                "placeholder:text-muted-foreground/70"
              )}
            />
            <motion.div
              animate={message.length > 0 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
          
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !message.trim()}
            className={cn(
              "h-10 w-10 rounded-lg",
              "bg-gradient-to-r from-purple-500 to-purple-600",
              "hover:from-purple-600 hover:to-purple-700",
              "text-white shadow-lg transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:from-purple-500 disabled:hover:to-purple-600"
            )}
          >
            <AnimatePresence mode="wait">
              {isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default InterfaceChat;
