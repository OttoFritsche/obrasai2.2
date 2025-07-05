import { useCallback, useReducer, useRef } from 'react';

import { useToast } from './use-toast';

// Tipos para chat IA
interface ChatRequest {
  pergunta: string;
  obra_id?: string;
  usuario_id?: string;
  contexto_adicional?: string;
  incluir_sinapi?: boolean;
  incluir_orcamento?: boolean;
  incluir_despesas?: boolean;
  max_tokens?: number;
  temperatura?: number;
}

interface ContextoItem {
  tipo: 'obra' | 'orcamento' | 'despesa' | 'sinapi' | 'conhecimento';
  conteudo: string;
  relevancia: number;
  fonte: string;
  metadata?: Record<string, unknown>;
}

interface ChatResponse {
  success: boolean;
  resposta: string;
  contexto_usado: ContextoItem[];
  tokens_usados: number;
  tempo_processamento_ms: number;
  similarity_score?: number;
  sugestoes_followup?: string[];
  error?: string;
}

interface Conversa {
  id: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
  tokens_usados: number;
  tempo_resposta_ms: number;
  contexto_usado: ContextoItem[];
}

// Estado do hook
interface ChatState {
  loading: boolean;
  currentResponse: string;
  conversationHistory: Conversa[];
  contextUsed: ContextoItem[];
  followupSuggestions: string[];
  totalTokensUsed: number;
  averageResponseTime: number;
  totalConversations: number;
  error: string | null;
}

// Actions para o reducer
type ChatAction =
  | { type: 'START_CHAT' }
  | { type: 'CHAT_SUCCESS'; payload: { response: string; conversation: Conversa; context: ContextoItem[]; suggestions: string[]; tokens: number; responseTime: number } }
  | { type: 'CHAT_ERROR'; payload: string }
  | { type: 'CLEAR_CONVERSATION' }
  | { type: 'CANCEL_CHAT' };

// Reducer para chat IA
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'START_CHAT':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'CHAT_SUCCESS':
      return {
        ...state,
        loading: false,
        currentResponse: action.payload.response,
        conversationHistory: [...state.conversationHistory, action.payload.conversation],
        contextUsed: action.payload.context,
        followupSuggestions: action.payload.suggestions,
        totalTokensUsed: state.totalTokensUsed + action.payload.tokens,
        totalConversations: state.totalConversations + 1,
        averageResponseTime: state.totalConversations > 0
          ? (state.averageResponseTime * state.totalConversations + action.payload.responseTime) / (state.totalConversations + 1)
          : action.payload.responseTime,
        error: null,
      };
    
    case 'CHAT_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversationHistory: [],
        currentResponse: '',
        contextUsed: [],
        followupSuggestions: [],
        error: null,
      };
    
    case 'CANCEL_CHAT':
      return {
        ...state,
        loading: false,
      };
    
    default:
      return state;
  }
};

// Configuração da API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useAIChat() {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const initialState: ChatState = {
    loading: false,
    currentResponse: '',
    conversationHistory: [],
    contextUsed: [],
    followupSuggestions: [],
    totalTokensUsed: 0,
    averageResponseTime: 0,
    totalConversations: 0,
    error: null
  };
  
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Função auxiliar para fazer chamadas para Edge Functions
  const callEdgeFunction = useCallback(async (
    functionName: string, 
    payload: Record<string, unknown>,
    signal?: AbortSignal
  ) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  // Chat IA Contextual
  const askAI = useCallback(async (chatParams: ChatRequest): Promise<string> => {
    // Cancelar chat anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    dispatch({ type: 'START_CHAT' });

    try {
      console.log('🤖 Enviando pergunta para IA:', chatParams.pergunta);

      const response: ChatResponse = await callEdgeFunction(
        'ai-chat-contextual',
        chatParams,
        abortControllerRef.current.signal
      );

      if (response.success) {
        const novaConversa: Conversa = {
          id: Date.now().toString(),
          pergunta: chatParams.pergunta,
          resposta: response.resposta,
          timestamp: new Date().toISOString(),
          tokens_usados: response.tokens_usados,
          tempo_resposta_ms: response.tempo_processamento_ms,
          contexto_usado: response.contexto_usado
        };

        dispatch({
          type: 'CHAT_SUCCESS',
          payload: {
            response: response.resposta,
            conversation: novaConversa,
            context: response.contexto_usado,
            suggestions: response.sugestoes_followup || [],
            tokens: response.tokens_usados,
            responseTime: response.tempo_processamento_ms,
          },
        });

        toast({
          title: "🤖 Resposta gerada",
          description: `Resposta em ${response.tempo_processamento_ms}ms usando ${response.tokens_usados} tokens`,
        });

        return response.resposta;
      } else {
        throw new Error(response.error || 'Erro no chat IA');
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 Chat cancelado pelo usuário');
        return '';
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro no chat IA:', error);
      
      dispatch({ type: 'CHAT_ERROR', payload: errorMessage });

      toast({
        title: "❌ Erro no chat IA",
        description: errorMessage,
        variant: "destructive"
      });

      return '';
    }
  }, [callEdgeFunction, toast]);

  // Pergunta rápida com contexto mínimo
  const quickAsk = useCallback(async (pergunta: string, incluirSinapi = true): Promise<string> => {
    return askAI({
      pergunta,
      incluir_sinapi: incluirSinapi,
      incluir_orcamento: false,
      incluir_despesas: false,
      max_tokens: 500,
      temperatura: 0.7
    });
  }, [askAI]);

  // Pergunta com contexto de obra
  const askWithObraContext = useCallback(async (
    pergunta: string, 
    obraId: string, 
    usuarioId?: string
  ): Promise<string> => {
    return askAI({
      pergunta,
      obra_id: obraId,
      usuario_id: usuarioId,
      incluir_sinapi: true,
      incluir_orcamento: true,
      incluir_despesas: true,
      max_tokens: 1000,
      temperatura: 0.7
    });
  }, [askAI]);

  // Cancelar chat atual
  const cancelChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch({ type: 'CANCEL_CHAT' });
      
      toast({
        title: "🚫 Chat cancelado",
        description: "O chat foi cancelado pelo usuário",
      });
    }
  }, [toast]);

  // Limpar histórico de conversas
  const clearConversation = useCallback(() => {
    dispatch({ type: 'CLEAR_CONVERSATION' });

    toast({
      title: "🧹 Histórico limpo",
      description: "Histórico de conversas foi limpo",
    });
  }, [toast]);

  // Obter estatísticas de uso
  const getStats = useCallback(() => {
    return {
      totalConversations: state.totalConversations,
      totalTokensUsed: state.totalTokensUsed,
      averageResponseTime: Math.round(state.averageResponseTime),
      hasActiveChat: state.loading
    };
  }, [state]);

  return {
    // Estado
    loading: state.loading,
    currentResponse: state.currentResponse,
    conversationHistory: state.conversationHistory,
    contextUsed: state.contextUsed,
    followupSuggestions: state.followupSuggestions,
    totalTokensUsed: state.totalTokensUsed,
    error: state.error,
    
    // Funções principais
    askAI,
    quickAsk,
    askWithObraContext,
    
    // Controle
    cancelChat,
    clearConversation,
    
    // Utilitários
    getStats,
    
    // Estados computados
    hasConversation: state.conversationHistory.length > 0,
    hasError: !!state.error,
    isEmpty: state.conversationHistory.length === 0 && !state.loading && !state.error,
  };
}