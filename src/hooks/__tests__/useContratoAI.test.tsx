import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useContratoAI } from '../useContratoAI';

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock do contexto de autenticação
vi.mock('@/contexts/auth', () => ({
  useAuth: () => ({ user: { id: 'user-123', email: 'test@example.com' } })
}));

// Mock do cliente Supabase
const mockInvoke = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({
    order: vi.fn(() => ({
      limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    eq: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: null }))
  }))
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: mockInvoke },
    from: mockFrom
  }
}));

// Mocks de resposta da IA
const mockSuccessResponse = {
  resposta: 'Esta é uma sugestão para o contrato de construção. Recomendo incluir as seguintes cláusulas...',
  sugestoes: [
    {
      tipo: 'clausula' as const,
      conteudo: 'Cláusula de garantia de 5 anos para defeitos estruturais',
      justificativa: 'Protege o contratante contra problemas estruturais futuros',
      aplicado: false
    },
    {
      tipo: 'descricao' as const,
      conteudo: 'Serviços de construção residencial incluindo fundação, estrutura e acabamentos',
      justificativa: 'Descrição completa dos serviços a serem executados',
      aplicado: false
    }
  ],
  confianca: 0.92,
  fontes_referencia: ['NBR 6118', 'Código Civil Brasileiro'],
  tempo_resposta_ms: 1500
};

describe('useContratoAI', () => {
  let queryClient: QueryClient;

  const renderWithQueryClient = (hook: () => any) => {
    return renderHook(hook, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('deve inicializar com mensagem de boas-vindas', () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      expect(result.current.chatLoading).toBe(false);
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        role: 'assistant',
        content: expect.stringContaining('Olá! Sou seu assistente especializado')
      });
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.currentResponse).toBe('');
      expect(result.current.lastError).toBeNull();
      expect(result.current.totalInteractions).toBe(0);
    });

    it('deve fornecer sugestões rápidas', () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      expect(result.current.quickSuggestions).toHaveLength(5);
      expect(result.current.quickSuggestions[0]).toContain('pintura externa');
      expect(result.current.quickSuggestions[1]).toContain('cláusulas essenciais');
    });

    it('deve calcular estados computados corretamente', () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasMessages).toBe(true); // Tem mensagem inicial
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('deve fornecer estatísticas iniciais', () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      expect(result.current.stats).toEqual({
        totalInteractions: 0,
        averageResponseTime: 0,
        totalHistoricalInteractions: 0
      });
    });
  });

  describe('sendMessage - Envio de mensagens', () => {
    it('deve enviar mensagem com sucesso', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage(
          'Como estruturar um contrato de construção?',
          {
            tipo_servico: 'residencial',
            valor_total: 250000,
            prazo_execucao: 180
          },
          'contrato-123'
        );
      });

      // Verificar que função da IA foi chamada
      expect(mockInvoke).toHaveBeenCalledWith(
        'contrato-ai-assistant',
        expect.objectContaining({
          body: expect.objectContaining({
            pergunta_usuario: 'Como estruturar um contrato de construção?',
            contexto_contrato: {
              tipo_servico: 'residencial',
              valor_total: 250000,
              prazo_execucao: 180
            },
            contrato_id: 'contrato-123',
            historico_conversa: expect.arrayContaining([
              expect.objectContaining({
                role: 'user',
                content: 'Como estruturar um contrato de construção?'
              })
            ])
          })
        })
      );

      // Verificar estado atualizado
      expect(result.current.chatLoading).toBe(false);
      expect(result.current.messages).toHaveLength(3); // inicial + user + assistant
      expect(result.current.currentResponse).toBe(mockSuccessResponse.resposta);
      expect(result.current.suggestions).toEqual(mockSuccessResponse.sugestoes);
      expect(result.current.totalInteractions).toBe(1);
      expect(result.current.lastError).toBeNull();
    });

    it('deve mostrar loading durante envio', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockInvoke.mockReturnValueOnce(pendingPromise);

      const { result } = renderWithQueryClient(() => useContratoAI());

      // Iniciar envio
      act(() => {
        result.current.sendMessage('Pergunta teste', {});
      });

      // Verificar loading ativo
      expect(result.current.chatLoading).toBe(true);
      expect(result.current.isLoading).toBe(true);

      // Resolver promise
      await act(async () => {
        resolvePromise!({ data: mockSuccessResponse, error: null });
      });

      expect(result.current.chatLoading).toBe(false);
    });

    it('deve lidar com erro de IA', async () => {
      const mockError = new Error('Falha na comunicação com a IA de contratos');
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Pergunta com erro', {});
      });

      expect(result.current.chatLoading).toBe(false);
      expect(result.current.lastError).toBe(mockError.message);
      expect(result.current.messages).toHaveLength(2); // inicial + user (sem assistant)
    });

    it('não deve enviar mensagem vazia', async () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('   ', {}); // String vazia/espaços
      });

      expect(mockInvoke).not.toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(1); // Apenas mensagem inicial
    });

    it('deve limitar histórico a 5 mensagens', async () => {
      mockInvoke.mockResolvedValue({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      // Enviar 6 mensagens para testar limite
      for (let i = 1; i <= 6; i++) {
        await act(async () => {
          await result.current.sendMessage(`Pergunta ${i}`, {});
        });
      }

      // Verificar última chamada da IA - deve ter no máximo 5 mensagens no histórico
      const lastCall = mockInvoke.mock.calls[mockInvoke.mock.calls.length - 1];
      expect(lastCall[1].body.historico_conversa.length).toBeLessThanOrEqual(5);
    });
  });

  describe('applySuggestion - Aplicar sugestões', () => {
    it('deve aplicar sugestão corretamente', async () => {
      // Primeiro, obter sugestões através de uma mensagem
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Preciso de sugestões', {});
      });

      expect(result.current.suggestions).toHaveLength(2);
      expect(result.current.suggestions[0].aplicado).toBe(false);

      // Aplicar primeira sugestão
      await act(async () => {
        result.current.applySuggestion(result.current.suggestions[0], 'clausulas_especiais');
      });

      expect(result.current.suggestions[0].aplicado).toBe(true);
      expect(result.current.suggestions[1].aplicado).toBe(false);
    });
  });

  describe('rateResponse - Avaliar resposta', () => {
    it('deve avaliar resposta com sucesso', async () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.rateResponse('interacao-123', 5);
      });

      expect(mockFrom).toHaveBeenCalledWith('ia_contratos_interacoes');
    });

    it('deve lidar com erro na avaliação', async () => {
      mockFrom.mockImplementationOnce(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: new Error('Erro no banco') }))
        }))
      }));

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.rateResponse('interacao-123', 3);
      });

      expect(mockFrom).toHaveBeenCalledWith('ia_contratos_interacoes');
    });
  });

  describe('Controle de conversa', () => {
    it('deve limpar conversa', async () => {
      // Primeiro, adicionar algumas mensagens
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Teste', {});
      });

      expect(result.current.messages).toHaveLength(3); // inicial + user + assistant

      // Limpar conversa
      act(() => {
        result.current.clearConversation();
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('assistant');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.currentResponse).toBe('');
      expect(result.current.lastError).toBeNull();
    });

    it('deve cancelar operação atual', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockInvoke.mockReturnValueOnce(pendingPromise);

      const { result } = renderWithQueryClient(() => useContratoAI());

      // Iniciar operação
      act(() => {
        result.current.sendMessage('Pergunta para cancelar', {});
      });

      expect(result.current.chatLoading).toBe(true);

      // Cancelar operação
      act(() => {
        result.current.cancelCurrentOperation();
      });

      expect(result.current.chatLoading).toBe(false);
    });
  });

  describe('Estados computados e estatísticas', () => {
    it('deve calcular hasMessages corretamente', () => {
      const { result } = renderWithQueryClient(() => useContratoAI());

      // Inicialmente já tem uma mensagem (boas-vindas)
      expect(result.current.hasMessages).toBe(true);

      // Limpar conversa - ainda terá uma mensagem
      act(() => {
        result.current.clearConversation();
      });

      expect(result.current.hasMessages).toBe(true); // Mensagem de boas-vindas permanece
    });

    it('deve calcular hasSuggestions corretamente', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      expect(result.current.hasSuggestions).toBe(false);

      await act(async () => {
        await result.current.sendMessage('Preciso de sugestões', {});
      });

      expect(result.current.hasSuggestions).toBe(true);
    });

    it('deve calcular média de tempo de resposta', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          data: { ...mockSuccessResponse, tempo_resposta_ms: 1000 },
          error: null
        })
        .mockResolvedValueOnce({
          data: { ...mockSuccessResponse, tempo_resposta_ms: 2000 },
          error: null
        });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Primeira pergunta', {});
      });

      expect(result.current.stats.averageResponseTime).toBe(1000);

      await act(async () => {
        await result.current.sendMessage('Segunda pergunta', {});
      });

      expect(result.current.stats.averageResponseTime).toBe(1500); // (1000 + 2000) / 2
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com resposta sem sugestões', async () => {
      const responseWithoutSuggestions = {
        ...mockSuccessResponse,
        sugestoes: []
      };

      mockInvoke.mockResolvedValueOnce({
        data: responseWithoutSuggestions,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Pergunta sem sugestões', {});
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('deve lidar com contexto vazio', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Pergunta', {}); // contexto vazio
      });

      expect(mockInvoke).toHaveBeenCalledWith(
        'contrato-ai-assistant',
        expect.objectContaining({
          body: expect.objectContaining({
            contexto_contrato: {}
          })
        })
      );
    });

    it('deve funcionar sem contrato_id', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null
      });

      const { result } = renderWithQueryClient(() => useContratoAI());

      await act(async () => {
        await result.current.sendMessage('Pergunta', {}, undefined); // sem contrato_id
      });

      expect(mockInvoke).toHaveBeenCalledWith(
        'contrato-ai-assistant',
        expect.objectContaining({
          body: expect.objectContaining({
            contrato_id: undefined
          })
        })
      );
    });
  });
});