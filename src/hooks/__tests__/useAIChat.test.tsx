import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAIChat } from '../useAIChat';

// Mock do toast
const mockToast = vi.fn();
vi.mock('../use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock das variáveis de ambiente
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  },
  writable: true
});

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock responses para diferentes cenários
const mockSuccessResponse = {
  success: true,
  resposta: 'Esta é uma resposta da IA sobre construção civil.',
  contexto_usado: [
    {
      tipo: 'obra' as const,
      conteudo: 'Informações da obra residencial',
      relevancia: 0.95,
      fonte: 'banco_dados',
      metadata: { obra_id: 'obra-123' }
    },
    {
      tipo: 'sinapi' as const,
      conteudo: 'Código SINAPI 74209 - Alvenaria',
      relevancia: 0.85,
      fonte: 'sinapi_api',
      metadata: { codigo: 74209 }
    }
  ],
  tokens_usados: 156,
  tempo_processamento_ms: 1250,
  similarity_score: 0.92,
  sugestoes_followup: [
    'Como calcular o custo por m²?',
    'Quais materiais são necessários?',
    'Qual o prazo estimado?'
  ]
};

const mockErrorResponse = {
  success: false,
  error: 'Falha na comunicação com a API de IA'
};

const mockNetworkError = new Error('Network request failed');

describe('useAIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Estado inicial', () => {
    it('deve inicializar com estado vazio', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current.loading).toBe(false);
      expect(result.current.currentResponse).toBe('');
      expect(result.current.conversationHistory).toEqual([]);
      expect(result.current.contextUsed).toEqual([]);
      expect(result.current.followupSuggestions).toEqual([]);
      expect(result.current.totalTokensUsed).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.hasConversation).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });

    it('deve fornecer estatísticas iniciais corretas', () => {
      const { result } = renderHook(() => useAIChat());

      const stats = result.current.getStats();
      expect(stats).toEqual({
        totalConversations: 0,
        totalTokensUsed: 0,
        averageResponseTime: 0,
        hasActiveChat: false
      });
    });
  });

  describe('askAI - Funcionalidade principal', () => {
    it('deve fazer pergunta com sucesso', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      let response: string;
      await act(async () => {
        response = await result.current.askAI({
          pergunta: 'Como calcular o custo de uma alvenaria?',
          obra_id: 'obra-123',
          incluir_sinapi: true,
          incluir_orcamento: true,
          max_tokens: 500,
          temperatura: 0.7
        });
      });

      // Verificar resposta
      expect(response!).toBe(mockSuccessResponse.resposta);

      // Verificar estado atualizado
      expect(result.current.loading).toBe(false);
      expect(result.current.currentResponse).toBe(mockSuccessResponse.resposta);
      expect(result.current.conversationHistory).toHaveLength(1);
      expect(result.current.contextUsed).toEqual(mockSuccessResponse.contexto_usado);
      expect(result.current.followupSuggestions).toEqual(mockSuccessResponse.sugestoes_followup);
      expect(result.current.totalTokensUsed).toBe(156);
      expect(result.current.hasConversation).toBe(true);
      expect(result.current.isEmpty).toBe(false);

      // Verificar toast de sucesso
      expect(mockToast).toHaveBeenCalledWith({
        title: "🤖 Resposta gerada",
        description: "Resposta em 1250ms usando 156 tokens"
      });

      // Verificar que API foi chamada com dados corretos
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/ai-chat-contextual'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          }),
          body: JSON.stringify({
            pergunta: 'Como calcular o custo de uma alvenaria?',
            obra_id: 'obra-123',
            incluir_sinapi: true,
            incluir_orcamento: true,
            max_tokens: 500,
            temperatura: 0.7
          })
        })
      );
    });

    it('deve mostrar loading durante requisição', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useAIChat());

      // Iniciar pergunta
      act(() => {
        result.current.askAI({ pergunta: 'Teste' });
      });

      // Verificar loading ativo
      expect(result.current.loading).toBe(true);
      expect(result.current.getStats().hasActiveChat).toBe(true);

      // Resolver promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse)
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('deve lidar com erro de API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse)
      });

      const { result } = renderHook(() => useAIChat());

      let response: string;
      await act(async () => {
        response = await result.current.askAI({
          pergunta: 'Pergunta que falha'
        });
      });

      expect(response!).toBe('');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Falha na comunicação com a API de IA');
      expect(result.current.hasError).toBe(true);

      expect(mockToast).toHaveBeenCalledWith({
        title: "❌ Erro no chat IA",
        description: "Falha na comunicação com a API de IA",
        variant: "destructive"
      });
    });

    it('deve lidar com erro de rede', async () => {
      mockFetch.mockRejectedValueOnce(mockNetworkError);

      const { result } = renderHook(() => useAIChat());

      let response: string;
      await act(async () => {
        response = await result.current.askAI({
          pergunta: 'Pergunta com erro de rede'
        });
      });

      expect(response!).toBe('');
      expect(result.current.error).toBe('Network request failed');
      expect(result.current.hasError).toBe(true);

      expect(mockToast).toHaveBeenCalledWith({
        title: "❌ Erro no chat IA",
        description: "Network request failed",
        variant: "destructive"
      });
    });

    it('deve lidar com erro HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' })
      });

      const { result } = renderHook(() => useAIChat());

      let response: string;
      await act(async () => {
        response = await result.current.askAI({ pergunta: 'Teste' });
      });

      expect(response!).toBe('');
      expect(result.current.error).toBe('Internal Server Error');
      expect(result.current.hasError).toBe(true);
    });
  });

  describe('quickAsk - Pergunta rápida', () => {
    it('deve fazer pergunta rápida com configuração padrão', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.quickAsk('O que é SINAPI?');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/ai-chat-contextual'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          }),
          body: JSON.stringify({
            pergunta: 'O que é SINAPI?',
            incluir_sinapi: true,
            incluir_orcamento: false,
            incluir_despesas: false,
            max_tokens: 500,
            temperatura: 0.7
          })
        })
      );
    });

    it('deve permitir desabilitar SINAPI', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.quickAsk('Pergunta sem SINAPI', false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/ai-chat-contextual'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          }),
          body: JSON.stringify({
            pergunta: 'Pergunta sem SINAPI',
            incluir_sinapi: false,
            incluir_orcamento: false,
            incluir_despesas: false,
            max_tokens: 500,
            temperatura: 0.7
          })
        })
      );
    });
  });

  describe('askWithObraContext - Pergunta com contexto de obra', () => {
    it('deve incluir contexto completo da obra', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askWithObraContext(
          'Análise da obra residencial',
          'obra-123',
          'user-456'
        );
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/ai-chat-contextual'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          }),
          body: JSON.stringify({
            pergunta: 'Análise da obra residencial',
            obra_id: 'obra-123',
            usuario_id: 'user-456',
            incluir_sinapi: true,
            incluir_orcamento: true,
            incluir_despesas: true,
            max_tokens: 1000,
            temperatura: 0.7
          })
        })
      );
    });

    it('deve funcionar sem usuario_id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askWithObraContext(
          'Análise sem usuário',
          'obra-123'
        );
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/ai-chat-contextual'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          }),
          body: JSON.stringify({
            pergunta: 'Análise sem usuário',
            obra_id: 'obra-123',
            usuario_id: undefined,
            incluir_sinapi: true,
            incluir_orcamento: true,
            incluir_despesas: true,
            max_tokens: 1000,
            temperatura: 0.7
          })
        })
      );
    });
  });

  describe('Controle de chat', () => {
    it('deve cancelar chat em progresso', async () => {
      const abortedPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        }, 100);
      });

      mockFetch.mockReturnValueOnce(abortedPromise);

      const { result } = renderHook(() => useAIChat());

      // Iniciar chat
      act(() => {
        result.current.askAI({ pergunta: 'Pergunta para cancelar' });
      });

      expect(result.current.loading).toBe(true);

      // Cancelar chat
      await act(async () => {
        result.current.cancelChat();
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.loading).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: "🚫 Chat cancelado",
        description: "O chat foi cancelado pelo usuário"
      });
    });

    it('deve cancelar chat anterior quando iniciar novo', async () => {
      // Primeiro chat pendente
      let firstResolve: (value: any) => void;
      const firstPromise = new Promise((resolve) => {
        firstResolve = resolve;
      });

      mockFetch.mockReturnValueOnce(firstPromise);

      const { result } = renderHook(() => useAIChat());

      // Iniciar primeiro chat
      act(() => {
        result.current.askAI({ pergunta: 'Primeiro chat' });
      });

      // Iniciar segundo chat (deve cancelar o primeiro)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Segundo chat' });
      });

      expect(result.current.currentResponse).toBe(mockSuccessResponse.resposta);
      expect(result.current.conversationHistory).toHaveLength(1);
      expect(result.current.conversationHistory[0].pergunta).toBe('Segundo chat');
    });
  });

  describe('Gerenciamento de conversas', () => {
    it('deve limpar histórico de conversas', async () => {
      // Primeiro fazer uma pergunta para ter histórico
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askAI({ pergunta: 'Primeira pergunta' });
      });

      expect(result.current.conversationHistory).toHaveLength(1);
      expect(result.current.hasConversation).toBe(true);

      // Limpar conversa
      act(() => {
        result.current.clearConversation();
      });

      expect(result.current.conversationHistory).toEqual([]);
      expect(result.current.currentResponse).toBe('');
      expect(result.current.contextUsed).toEqual([]);
      expect(result.current.followupSuggestions).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.hasConversation).toBe(false);
      expect(result.current.isEmpty).toBe(true);

      expect(mockToast).toHaveBeenCalledWith({
        title: "🧹 Histórico limpo",
        description: "Histórico de conversas foi limpo"
      });
    });

    it('deve acumular múltiplas conversas', async () => {
      const { result } = renderHook(() => useAIChat());

      // Primeira conversa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          resposta: 'Primeira resposta',
          tokens_usados: 100,
          tempo_processamento_ms: 1000
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Primeira pergunta' });
      });

      // Segunda conversa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          resposta: 'Segunda resposta',
          tokens_usados: 150,
          tempo_processamento_ms: 1500
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Segunda pergunta' });
      });

      expect(result.current.conversationHistory).toHaveLength(2);
      expect(result.current.totalTokensUsed).toBe(250);
      
      const stats = result.current.getStats();
      expect(stats.totalConversations).toBe(2);
      expect(stats.totalTokensUsed).toBe(250);
      expect(stats.averageResponseTime).toBe(1250); // (1000 + 1500) / 2
    });
  });

  describe('Estrutura de dados das conversas', () => {
    it('deve criar estrutura correta da conversa', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      const timestampBefore = Date.now();

      await act(async () => {
        await result.current.askAI({ pergunta: 'Teste de estrutura' });
      });

      const timestampAfter = Date.now();
      const conversa = result.current.conversationHistory[0];

      expect(conversa).toMatchObject({
        pergunta: 'Teste de estrutura',
        resposta: mockSuccessResponse.resposta,
        tokens_usados: mockSuccessResponse.tokens_usados,
        tempo_resposta_ms: mockSuccessResponse.tempo_processamento_ms,
        contexto_usado: mockSuccessResponse.contexto_usado
      });

      expect(conversa.id).toBeDefined();
      expect(new Date(conversa.timestamp).getTime()).toBeGreaterThanOrEqual(timestampBefore);
      expect(new Date(conversa.timestamp).getTime()).toBeLessThanOrEqual(timestampAfter);
    });

    it('deve preservar contexto usado', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askAI({ pergunta: 'Teste contexto' });
      });

      expect(result.current.contextUsed).toEqual(mockSuccessResponse.contexto_usado);
      expect(result.current.contextUsed).toHaveLength(2);
      expect(result.current.contextUsed[0].tipo).toBe('obra');
      expect(result.current.contextUsed[1].tipo).toBe('sinapi');
    });

    it('deve preservar sugestões de follow-up', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askAI({ pergunta: 'Teste sugestões' });
      });

      expect(result.current.followupSuggestions).toEqual(mockSuccessResponse.sugestoes_followup);
      expect(result.current.followupSuggestions).toHaveLength(3);
    });
  });

  describe('Estados computados', () => {
    it('deve calcular isEmpty corretamente', () => {
      const { result } = renderHook(() => useAIChat());

      // Estado inicial - vazio
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.hasConversation).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('deve calcular hasError corretamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askAI({ pergunta: 'Pergunta com erro' });
      });

      expect(result.current.hasError).toBe(true);
      expect(result.current.isEmpty).toBe(false);
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com resposta sem sugestões de follow-up', async () => {
      const responseWithoutSuggestions = {
        ...mockSuccessResponse,
        sugestoes_followup: undefined
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutSuggestions)
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.askAI({ pergunta: 'Pergunta sem sugestões' });
      });

      expect(result.current.followupSuggestions).toEqual([]);
    });

    it('deve lidar com erro de parsing JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const { result } = renderHook(() => useAIChat());

      let response: string;
      await act(async () => {
        response = await result.current.askAI({ pergunta: 'Teste' });
      });

      expect(response!).toBe('');
      expect(result.current.error).toBe('Erro HTTP 500');
      expect(result.current.hasError).toBe(true);
    });

    it('deve lidar com cancelamento quando não há chat ativo', () => {
      const { result } = renderHook(() => useAIChat());

      // Tentar cancelar sem chat ativo - não deve causar erro
      act(() => {
        result.current.cancelChat();
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Performance e otimização', () => {
    it('deve calcular tempo médio de resposta corretamente', async () => {
      const { result } = renderHook(() => useAIChat());

      // Primeira resposta - 1000ms
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          tempo_processamento_ms: 1000
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Primeira' });
      });

      expect(result.current.getStats().averageResponseTime).toBe(1000);

      // Segunda resposta - 2000ms
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          tempo_processamento_ms: 2000
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Segunda' });
      });

      expect(result.current.getStats().averageResponseTime).toBe(1500); // (1000 + 2000) / 2
    });

    it('deve acumular tokens corretamente', async () => {
      const { result } = renderHook(() => useAIChat());

      // Primeira conversa - 100 tokens
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          tokens_usados: 100
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Primeira' });
      });

      expect(result.current.totalTokensUsed).toBe(100);

      // Segunda conversa - 250 tokens
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockSuccessResponse,
          tokens_usados: 250
        })
      });

      await act(async () => {
        await result.current.askAI({ pergunta: 'Segunda' });
      });

      expect(result.current.totalTokensUsed).toBe(350);
      expect(result.current.getStats().totalTokensUsed).toBe(350);
    });
  });
});