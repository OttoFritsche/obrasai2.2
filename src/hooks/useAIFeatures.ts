import { useAIChat } from './useAIChat';
import { useSemanticSearch } from './useSemanticSearch';

/**
 * 🤖 Hook: useAIFeatures (Refatorado)
 * 
 * Hook composto que combina funcionalidades de busca semântica e chat IA.
 * Agora usa hooks especializados para melhor separação de responsabilidades.
 * 
 * @author ObrasAI Team
 */

export function useAIFeatures() {
  // Usar hooks especializados
  const search = useSemanticSearch();
  const chat = useAIChat();

  // Cancelar todas as operações
  const cancelCurrentOperation = () => {
    search.cancelSearch();
    chat.cancelChat();
  };

  // Obter estatísticas combinadas
  const getUsageStats = () => {
    const searchStats = search.getStats();
    const chatStats = chat.getStats();
    
    return {
      totalSearches: searchStats.totalSearches,
      totalConversations: chatStats.totalConversations,
      totalTokensUsed: chatStats.totalTokensUsed,
      averageResponseTime: Math.round((searchStats.averageResponseTime + chatStats.averageResponseTime) / 2),
      lastSearchResultsCount: searchStats.lastResultsCount,
      hasActiveOperation: searchStats.hasActiveSearch || chatStats.hasActiveChat
    };
  };

  // Explicar resultado SINAPI usando chat
  const explainSinapiResult = (result: { codigo_sinapi: string; descricao: string; unidade: string; preco_referencia?: number; categoria?: string }) => {
    const pergunta = `Explique este item SINAPI: ${result.codigo_sinapi} - ${result.descricao}. Qual sua aplicação típica em obras?`;
    
    return chat.askAI({
      pergunta,
      contexto_adicional: `Item SINAPI: ${result.codigo_sinapi} - ${result.descricao}. Unidade: ${result.unidade}. Preço: R$ ${result.preco_referencia || 'N/A'}. Categoria: ${result.categoria || 'N/A'}.`,
      incluir_sinapi: true,
      incluir_orcamento: false,
      incluir_despesas: false,
      max_tokens: 600,
      temperatura: 0.5
    });
  };

  return {
    // Busca semântica (delegado)
    searchLoading: search.loading,
    searchResults: search.results,
    lastSearchQuery: search.lastQuery,
    searchSuggestions: search.suggestions,
    searchSinapi: search.searchSinapi,
    searchBySuggestion: search.searchBySuggestion,
    searchByCode: search.searchByCode,
    clearSearchResults: search.clearResults,
    
    // Chat IA (delegado)
    chatLoading: chat.loading,
    currentResponse: chat.currentResponse,
    conversationHistory: chat.conversationHistory,
    contextUsed: chat.contextUsed,
    followupSuggestions: chat.followupSuggestions,
    totalTokensUsed: chat.totalTokensUsed,
    askAI: chat.askAI,
    quickAsk: chat.quickAsk,
    askWithObraContext: chat.askWithObraContext,
    clearConversationHistory: chat.clearConversation,
    
    // Funcionalidades combinadas
    explainSinapiResult,
    cancelCurrentOperation,
    getUsageStats,
    
    // Estados computados combinados
    isLoading: search.loading || chat.loading,
    hasResults: search.hasResults || chat.hasConversation,
    lastError: search.error || chat.error,
    hasError: search.hasError || chat.hasError,
    
    // Acesso direto aos hooks especializados (se necessário)
    search,
    chat,
  };
}