import { useCallback, useReducer, useRef } from 'react';

import { analytics } from '@/services/analyticsApi';

import { useToast } from './use-toast';

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

// Estado do hook
interface SearchState {
  loading: boolean;
  results: SearchResult[];
  lastQuery: string;
  suggestions: string[];
  averageResponseTime: number;
  totalSearches: number;
  error: string | null;
}

// Actions para o reducer
type SearchAction =
  | { type: 'START_SEARCH' }
  | { type: 'SEARCH_SUCCESS'; payload: { results: SearchResult[]; query: string; suggestions: string[]; responseTime: number } }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'CANCEL_SEARCH' };

// Reducer para busca semântica
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'START_SEARCH':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        loading: false,
        results: action.payload.results,
        lastQuery: action.payload.query,
        suggestions: action.payload.suggestions,
        totalSearches: state.totalSearches + 1,
        averageResponseTime: state.totalSearches > 0
          ? (state.averageResponseTime * state.totalSearches + action.payload.responseTime) / (state.totalSearches + 1)
          : action.payload.responseTime,
        error: null,
      };
    
    case 'SEARCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case 'CLEAR_RESULTS':
      return {
        ...state,
        results: [],
        lastQuery: '',
        suggestions: [],
        error: null,
      };
    
    case 'CANCEL_SEARCH':
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

export function useSemanticSearch() {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const initialState: SearchState = {
    loading: false,
    results: [],
    lastQuery: '',
    suggestions: [],
    averageResponseTime: 0,
    totalSearches: 0,
    error: null
  };
  
  const [state, dispatch] = useReducer(searchReducer, initialState);

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

  // Busca semântica SINAPI
  const searchSinapi = useCallback(async (searchParams: SearchRequest): Promise<SearchResult[]> => {
    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    dispatch({ type: 'START_SEARCH' });

    try {
      console.log('🔍 Iniciando busca semântica SINAPI:', searchParams.query);

      const response: SearchResponse = await callEdgeFunction(
        'sinapi-semantic-search',
        searchParams,
        abortControllerRef.current.signal
      );

      if (response.success) {
        dispatch({
          type: 'SEARCH_SUCCESS',
          payload: {
            results: response.resultados,
            query: searchParams.query,
            suggestions: response.sugestoes_relacionadas || [],
            responseTime: response.tempo_processamento_ms,
          },
        });

        // Track busca SINAPI
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

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 Busca cancelada pelo usuário');
        return [];
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na busca semântica:', error);
      
      dispatch({ type: 'SEARCH_ERROR', payload: errorMessage });

      toast({
        title: "❌ Erro na busca",
        description: errorMessage,
        variant: "destructive"
      });

      return [];
    }
  }, [callEdgeFunction, toast]);

  // Busca rápida por sugestão
  const searchBySuggestion = useCallback(async (suggestion: string, estado = 'SP') => {
    return searchSinapi({
      query: suggestion,
      limit: 10,
      threshold: 0.6,
      tipo_busca: 'ambos',
      estado
    });
  }, [searchSinapi]);

  // Buscar insumo específico por código
  const searchByCode = useCallback(async (codigo: string, estado = 'SP') => {
    return searchSinapi({
      query: `código ${codigo}`,
      limit: 5,
      threshold: 0.8,
      tipo_busca: 'ambos',
      estado
    });
  }, [searchSinapi]);

  // Cancelar operação atual
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch({ type: 'CANCEL_SEARCH' });
      
      toast({
        title: "🚫 Busca cancelada",
        description: "A busca foi cancelada pelo usuário",
      });
    }
  }, [toast]);

  // Limpar resultados de busca
  const clearResults = useCallback(() => {
    dispatch({ type: 'CLEAR_RESULTS' });
  }, []);

  // Obter estatísticas de uso
  const getStats = useCallback(() => {
    return {
      totalSearches: state.totalSearches,
      averageResponseTime: Math.round(state.averageResponseTime),
      lastResultsCount: state.results.length,
      hasActiveSearch: state.loading
    };
  }, [state]);

  return {
    // Estado
    loading: state.loading,
    results: state.results,
    lastQuery: state.lastQuery,
    suggestions: state.suggestions,
    error: state.error,
    
    // Funções principais
    searchSinapi,
    searchBySuggestion,
    searchByCode,
    
    // Controle
    cancelSearch,
    clearResults,
    
    // Utilitários
    getStats,
    
    // Estados computados
    hasResults: state.results.length > 0,
    hasError: !!state.error,
    isEmpty: state.results.length === 0 && !state.loading && !state.error,
  };
}