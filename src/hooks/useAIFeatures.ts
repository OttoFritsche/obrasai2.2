import { useState, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { analytics } from '@/services/analyticsApi';

/**
 * 🤖 Hook: useAIFeatures
 * 
 * Hook React para integração com as funcionalidades de IA do sistema,
 * incluindo busca semântica SINAPI e chat contextual.
 * 
 * @author Pharma.AI Team
 */

// Tipos para busca semântica
interface SearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  tipo_busca?: 'insumos' | 'composicoes' | 'ambos';
  estado?: string;
  categoria?: string;
}

interface SearchResult {
  id: number;
  codigo_sinapi: string;
  descricao: string;
  unidade: string;
  categoria?: string;
  preco_referencia?: number;
  similarity_score: number;
  tipo: 'insumo' | 'composicao';
  metadata?: Record<string, unknown>;
}

interface SearchResponse {
  success: boolean;
  resultados: SearchResult[];
  query_embedding?: number[];
  total_encontrados: number;
  tempo_processamento_ms: number;
  sugestoes_relacionadas?: string[];
  error?: string;
}

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

// Tipos para histórico de conversas
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
interface AIState {
  // Busca semântica
  searchLoading: boolean;
  searchResults: SearchResult[];
  lastSearchQuery: string;
  searchSuggestions: string[];
  
  // Chat IA
  chatLoading: boolean;
  currentResponse: string;
  conversationHistory: Conversa[];
  contextUsed: ContextoItem[];
  followupSuggestions: string[];
  
  // Métricas
  totalTokensUsed: number;
  averageResponseTime: number;
  
  // Erros
  lastError: string | null;
}

// Configuração da API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useAIFeatures() {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Estado do hook
  const [state, setState] = useState<AIState>({
    searchLoading: false,
    searchResults: [],
    lastSearchQuery: '',
    searchSuggestions: [],
    chatLoading: false,
    currentResponse: '',
    conversationHistory: [],
    contextUsed: [],
    followupSuggestions: [],
    totalTokensUsed: 0,
    averageResponseTime: 0,
    lastError: null
  });

  /**
   * Função auxiliar para fazer chamadas para Edge Functions
   */
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

  /**
   * 🔍 Busca Semântica SINAPI
   * 
   * Realiza busca semântica nos dados SINAPI usando embeddings
   */
  const searchSinapi = useCallback(async (searchParams: SearchRequest) => {
    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      searchLoading: true,
      lastError: null
    }));

    try {
      console.log('🔍 Iniciando busca semântica SINAPI:', searchParams.query);

      const response: SearchResponse = await callEdgeFunction(
        'sinapi-semantic-search',
        searchParams,
        abortControllerRef.current.signal
      );

      if (response.success) {
        setState(prev => ({
          ...prev,
          searchLoading: false,
          searchResults: response.resultados,
          lastSearchQuery: searchParams.query,
          searchSuggestions: response.sugestoes_relacionadas || [],
          averageResponseTime: (prev.averageResponseTime + response.tempo_processamento_ms) / 2
        }));

        // 📊 Track busca SINAPI
        await analytics.trackAIUsage('sinapi', {
          query: searchParams.query,
          resultados_encontrados: response.total_encontrados,
          tempo_processamento_ms: response.tempo_processamento_ms,
          tipo_busca: searchParams.tipo_busca,
          estado: searchParams.estado,
          threshold: searchParams.threshold
        });

        toast({
          title: "✅ Busca concluída",
          description: `${response.total_encontrados} resultados encontrados em ${response.tempo_processamento_ms}ms`,
        });

        return response.resultados;
      } else {
        throw new Error(response.error || 'Erro na busca semântica');
      }

    } catch (error: Error & { name?: string }) {
      if (error.name === 'AbortError') {
        console.log('🚫 Busca cancelada pelo usuário');
        return [];
      }

      console.error('❌ Erro na busca semântica:', error);
      
      setState(prev => ({
        ...prev,
        searchLoading: false,
        lastError: error.message
      }));

      toast({
        title: "❌ Erro na busca",
        description: error.message,
        variant: "destructive"
      });

      return [];
    }
  }, [callEdgeFunction, toast]);

  /**
   * 🤖 Chat IA Contextual
   * 
   * Envia pergunta para o chat IA com contexto da obra
   */
  const askAI = useCallback(async (chatParams: ChatRequest) => {
    // Cancelar chat anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      chatLoading: true,
      lastError: null
    }));

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

        setState(prev => ({
          ...prev,
          chatLoading: false,
          currentResponse: response.resposta,
          conversationHistory: [...prev.conversationHistory, novaConversa],
          contextUsed: response.contexto_usado,
          followupSuggestions: response.sugestoes_followup || [],
          totalTokensUsed: prev.totalTokensUsed + response.tokens_usados,
          averageResponseTime: (prev.averageResponseTime + response.tempo_processamento_ms) / 2
        }));

        toast({
          title: "🤖 Resposta gerada",
          description: `Resposta em ${response.tempo_processamento_ms}ms usando ${response.tokens_usados} tokens`,
        });

        return response.resposta;
      } else {
        throw new Error(response.error || 'Erro no chat IA');
      }

    } catch (error: Error & { name?: string }) {
      if (error.name === 'AbortError') {
        console.log('🚫 Chat cancelado pelo usuário');
        return '';
      }

      console.error('❌ Erro no chat IA:', error);
      
      setState(prev => ({
        ...prev,
        chatLoading: false,
        lastError: error.message
      }));

      toast({
        title: "❌ Erro no chat IA",
        description: error.message,
        variant: "destructive"
      });

      return '';
    }
  }, [callEdgeFunction, toast]);

  /**
   * 🔄 Busca rápida por sugestão
   * 
   * Executa busca baseada em uma sugestão
   */
  const searchBySuggestion = useCallback(async (suggestion: string, estado: string = 'SP') => {
    return searchSinapi({
      query: suggestion,
      limit: 10,
      threshold: 0.6,
      tipo_busca: 'ambos',
      estado
    });
  }, [searchSinapi]);

  /**
   * 💬 Pergunta rápida com contexto mínimo
   * 
   * Faz pergunta simples sem contexto específico de obra
   */
  const quickAsk = useCallback(async (pergunta: string, incluirSinapi: boolean = true) => {
    return askAI({
      pergunta,
      incluir_sinapi: incluirSinapi,
      incluir_orcamento: false,
      incluir_despesas: false,
      max_tokens: 500,
      temperatura: 0.7
    });
  }, [askAI]);

  /**
   * 🏗️ Pergunta com contexto de obra
   * 
   * Faz pergunta incluindo contexto completo da obra
   */
  const askWithObraContext = useCallback(async (
    pergunta: string, 
    obraId: string, 
    usuarioId?: string
  ) => {
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

  /**
   * 🚫 Cancelar operação atual
   */
  const cancelCurrentOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        searchLoading: false,
        chatLoading: false
      }));
      
      toast({
        title: "🚫 Operação cancelada",
        description: "A operação foi cancelada pelo usuário",
      });
    }
  }, [toast]);

  /**
   * 🧹 Limpar histórico de conversas
   */
  const clearConversationHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      currentResponse: '',
      contextUsed: [],
      followupSuggestions: []
    }));

    toast({
      title: "🧹 Histórico limpo",
      description: "Histórico de conversas foi limpo",
    });
  }, [toast]);

  /**
   * 🔄 Limpar resultados de busca
   */
  const clearSearchResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchResults: [],
      lastSearchQuery: '',
      searchSuggestions: []
    }));
  }, []);

  /**
   * 📊 Obter estatísticas de uso
   */
  const getUsageStats = useCallback(() => {
    return {
      totalConversations: state.conversationHistory.length,
      totalTokensUsed: state.totalTokensUsed,
      averageResponseTime: Math.round(state.averageResponseTime),
      lastSearchResultsCount: state.searchResults.length,
      hasActiveOperation: state.searchLoading || state.chatLoading
    };
  }, [state]);

  /**
   * 🎯 Buscar insumo específico por código
   */
  const searchByCode = useCallback(async (codigo: string, estado: string = 'SP') => {
    return searchSinapi({
      query: `código ${codigo}`,
      limit: 5,
      threshold: 0.8,
      tipo_busca: 'ambos',
      estado
    });
  }, [searchSinapi]);

  /**
   * 📝 Explicar resultado SINAPI
   */
  const explainSinapiResult = useCallback(async (result: SearchResult) => {
    const pergunta = `Explique este item SINAPI: ${result.codigo_sinapi} - ${result.descricao}. Qual sua aplicação típica em obras?`;
    
    return askAI({
      pergunta,
      contexto_adicional: `Item SINAPI: ${result.codigo_sinapi} - ${result.descricao}. Unidade: ${result.unidade}. Preço: R$ ${result.preco_referencia || 'N/A'}. Categoria: ${result.categoria || 'N/A'}.`,
      incluir_sinapi: true,
      incluir_orcamento: false,
      incluir_despesas: false,
      max_tokens: 600,
      temperatura: 0.5
    });
  }, [askAI]);

  return {
    // Estado
    ...state,
    
    // Funções principais
    searchSinapi,
    askAI,
    
    // Funções de conveniência
    searchBySuggestion,
    quickAsk,
    askWithObraContext,
    searchByCode,
    explainSinapiResult,
    
    // Controle
    cancelCurrentOperation,
    clearConversationHistory,
    clearSearchResults,
    
    // Utilitários
    getUsageStats,
    
    // Estados computados
    isLoading: state.searchLoading || state.chatLoading,
    hasResults: state.searchResults.length > 0 || state.conversationHistory.length > 0,
    hasError: !!state.lastError
  };
}