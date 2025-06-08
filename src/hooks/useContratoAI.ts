import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

// Tipos para IA de Contratos
interface ContratoAIRequest {
  pergunta_usuario: string;
  contexto_contrato: {
    tipo_servico?: string;
    valor_total?: number;
    prazo_execucao?: number;
    titulo?: string;
    descricao_servicos?: string;
    clausulas_especiais?: string;
    observacoes?: string;
    template_id?: string;
  };
  historico_conversa: ChatMessage[];
  contrato_id?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  suggestions?: AISuggestion[];
}

interface AISuggestion {
  tipo: "descricao" | "clausula" | "observacao";
  conteudo: string;
  justificativa: string;
  aplicado: boolean;
}

interface ContratoAIResponse {
  resposta: string;
  sugestoes: AISuggestion[];
  confianca: number;
  fontes_referencia: string[];
  tempo_resposta_ms: number;
}

interface InteracaoIA {
  id: string;
  user_id: string;
  contrato_id?: string;
  pergunta: string;
  resposta: string;
  contexto_contrato: any;
  sugestoes_geradas: AISuggestion[];
  qualidade_resposta?: number;
  feedback_usuario?: number;
  tempo_resposta_ms: number;
  modelo_ia: string;
  created_at: string;
}

// Estado do hook
interface ContratoAIState {
  chatLoading: boolean;
  messages: ChatMessage[];
  suggestions: AISuggestion[];
  currentResponse: string;
  lastError: string | null;
  totalInteractions: number;
  averageResponseTime: number;
}

export function useContratoAI() {
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<ContratoAIState>({
    chatLoading: false,
    messages: [
      {
        role: "assistant",
        content: "Olá! Sou seu assistente especializado em contratos de construção civil. Como posso ajudar você a criar um contrato profissional e completo?",
        timestamp: new Date(),
      },
    ],
    suggestions: [],
    currentResponse: "",
    lastError: null,
    totalInteractions: 0,
    averageResponseTime: 0,
  });

  // Mutation para chamar a IA
  const contratoAI = useMutation({
    mutationFn: async (request: ContratoAIRequest): Promise<ContratoAIResponse> => {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      console.log('🤖 Enviando pergunta para IA de contratos:', request.pergunta_usuario);

      const { data, error } = await supabase.functions.invoke('contrato-ai-assistant', {
        body: request,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (error) {
        console.error('Erro na IA de contratos:', error);
        throw error;
      }

      return data as ContratoAIResponse;
    },
    onSuccess: (response, variables) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.resposta,
        timestamp: new Date(),
        suggestions: response.sugestoes,
      };

      setState(prev => ({
        ...prev,
        chatLoading: false,
        messages: [...prev.messages, assistantMessage],
        suggestions: response.sugestoes,
        currentResponse: response.resposta,
        totalInteractions: prev.totalInteractions + 1,
        averageResponseTime: (prev.averageResponseTime + response.tempo_resposta_ms) / 2,
        lastError: null,
      }));

      toast.success(`Resposta gerada em ${response.tempo_resposta_ms}ms com ${response.confianca * 100}% de confiança`);
    },
    onError: (error: any) => {
      if (error.name === 'AbortError') {
        console.log('🚫 Requisição cancelada pelo usuário');
        return;
      }

      console.error('❌ Erro na IA de contratos:', error);
      
      setState(prev => ({
        ...prev,
        chatLoading: false,
        lastError: error.message || 'Erro desconhecido',
      }));

      toast.error(`Erro na IA: ${error.message || 'Erro desconhecido'}`);
    },
  });

  // Função para enviar mensagem
  const sendMessage = useCallback(async (
    message: string,
    contextoContrato: ContratoAIRequest['contexto_contrato'],
    contratoId?: string
  ) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      chatLoading: true,
      messages: [...prev.messages, userMessage],
      lastError: null,
    }));

    await contratoAI.mutateAsync({
      pergunta_usuario: message,
      contexto_contrato: contextoContrato,
      historico_conversa: state.messages.slice(-5), // Últimas 5 mensagens
      contrato_id: contratoId,
    });
  }, [contratoAI, state.messages]);

  // Função para aplicar sugestão
  const applySuggestion = useCallback((suggestion: AISuggestion, field: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s === suggestion ? { ...s, aplicado: true } : s
      ),
    }));

    toast.success(`Sugestão aplicada ao campo ${field}`);
    
    // Aqui você pode adicionar lógica adicional para aplicar a sugestão
    // como callback props ou context para atualizar o formulário
  }, []);

  // Função para avaliar resposta
  const rateResponse = useCallback(async (interacaoId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('ia_contratos_interacoes')
        .update({ feedback_usuario: rating })
        .eq('id', interacaoId);

      if (error) throw error;

      toast.success('Avaliação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao avaliar resposta:', error);
      toast.error('Erro ao registrar avaliação');
    }
  }, []);

  // Query para buscar histórico de interações
  const { data: interacoes, refetch: refetchInteracoes } = useQuery({
    queryKey: ["ia-contratos-interacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ia_contratos_interacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InteracaoIA[];
    },
    enabled: !!user,
  });

  // Função para buscar interações por contrato
  const getInteractionsByContract = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("ia_contratos_interacoes")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error('Erro ao buscar interações do contrato:', error);
      return [];
    }

    return data as InteracaoIA[];
  }, []);

  // Função para limpar conversa
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [
        {
          role: "assistant",
          content: "Olá! Sou seu assistente especializado em contratos de construção civil. Como posso ajudar você a criar um contrato profissional e completo?",
          timestamp: new Date(),
        },
      ],
      suggestions: [],
      currentResponse: "",
      lastError: null,
    }));

    toast.success("Conversa limpa com sucesso!");
  }, []);

  // Função para cancelar operação atual
  const cancelCurrentOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        chatLoading: false,
      }));
      
      toast.info("Operação cancelada");
    }
  }, []);

  // Sugestões rápidas para iniciar conversa
  const quickSuggestions = [
    "Sugira uma descrição detalhada para um contrato de pintura externa",
    "Quais cláusulas são essenciais em contratos de construção civil?",
    "Como devo estruturar as responsabilidades em um contrato de reforma?",
    "Que observações importantes incluir sobre materiais e mão de obra?",
    "Ajude-me a definir prazos realistas para execução da obra",
  ];

  return {
    // Estado
    ...state,
    
    // Dados
    interacoes,
    quickSuggestions,
    
    // Funções principais
    sendMessage,
    applySuggestion,
    rateResponse,
    getInteractionsByContract,
    
    // Controle
    clearConversation,
    cancelCurrentOperation,
    refetchInteracoes,
    
    // Estados computados
    isLoading: state.chatLoading,
    hasMessages: state.messages.length > 1,
    hasSuggestions: state.suggestions.length > 0,
    
    // Estatísticas
    stats: {
      totalInteractions: state.totalInteractions,
      averageResponseTime: Math.round(state.averageResponseTime),
      totalHistoricalInteractions: interacoes?.length || 0,
    },
  };
}

export function useContratoAIForContract(contratoId: string) {
  const hook = useContratoAI();
  
  // Carregar interações específicas do contrato
  const { data: contractInteractions } = useQuery({
    queryKey: ["ia-contratos-interacoes", contratoId],
    queryFn: () => hook.getInteractionsByContract(contratoId),
    enabled: !!contratoId,
  });

  return {
    ...hook,
    contractInteractions,
  };
} 