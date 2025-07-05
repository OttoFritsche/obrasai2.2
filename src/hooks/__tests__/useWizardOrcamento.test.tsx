import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWizardOrcamento } from '../useWizardOrcamento';

// Mock das dependências
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../useCEP', () => ({
  useCEP: vi.fn(() => ({
    loading: false,
    error: null,
    endereco: null,
    buscarCEP: vi.fn(),
    limparEndereco: vi.fn(),
  })),
}));

vi.mock('@/services/orcamentoApi', () => ({
  orcamentosParametricosApi: {
    criar: vi.fn(),
  },
  calculoOrcamentoApi: {
    calcularComIA: vi.fn(),
  },
}));

describe('useWizardOrcamento', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar com estado padrão', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      expect(result.current.etapaAtual).toBe(1);
      expect(result.current.isCalculando).toBe(false);
      expect(result.current.calculandoIA).toBe(false);
      expect(result.current.isSubmitindo).toBe(false);
      expect(result.current.podeVoltar).toBe(false);
      expect(result.current.isUltimaEtapa).toBe(false);
    });

    it('deve configurar formulário com valores padrão', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      const formValues = result.current.form.getValues();
      
      expect(formValues).toHaveProperty('nomeObra');
      expect(formValues).toHaveProperty('tipoObra');
      expect(formValues).toHaveProperty('cep');
      expect(formValues).toHaveProperty('areaTerreno');
      expect(formValues).toHaveProperty('areaConstruida');
    });

    it('deve inicializar com obraId quando fornecido', () => {
      const obraId = 'obra-123';
      
      const { result } = renderHook(
        () => useWizardOrcamento({ obraId }), 
        { wrapper }
      );

      const formValues = result.current.form.getValues();
      expect(formValues.obraId).toBe(obraId);
    });
  });

  describe('Navegação entre etapas', () => {
    it('deve avançar para próxima etapa', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      act(() => {
        result.current.proximaEtapa();
      });

      expect(result.current.etapaAtual).toBe(2);
      expect(result.current.podeVoltar).toBe(true);
    });

    it('deve voltar para etapa anterior', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Avançar para etapa 2
      act(() => {
        result.current.proximaEtapa();
      });

      // Voltar para etapa 1
      act(() => {
        result.current.etapaAnterior();
      });

      expect(result.current.etapaAtual).toBe(1);
      expect(result.current.podeVoltar).toBe(false);
    });

    it('deve navegar diretamente para etapa específica', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      act(() => {
        result.current.irParaEtapa(3);
      });

      expect(result.current.etapaAtual).toBe(3);
      expect(result.current.podeVoltar).toBe(true);
    });

    it('não deve avançar além da última etapa', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Ir para última etapa
      act(() => {
        result.current.irParaEtapa(4);
      });

      expect(result.current.isUltimaEtapa).toBe(true);

      // Tentar avançar além da última etapa
      act(() => {
        result.current.proximaEtapa();
      });

      expect(result.current.etapaAtual).toBe(4);
    });

    it('não deve voltar além da primeira etapa', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Tentar voltar da primeira etapa
      act(() => {
        result.current.etapaAnterior();
      });

      expect(result.current.etapaAtual).toBe(1);
      expect(result.current.podeVoltar).toBe(false);
    });
  });

  describe('Validação por etapa', () => {
    it('deve permitir avanço quando etapa 1 é válida', async () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Preencher dados válidos da etapa 1
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Residencial');
        result.current.form.setValue('tipoObra', 'residencial');
        result.current.form.setValue('numeroAndares', 1);
        result.current.form.setValue('numeroQuartos', 3);
        result.current.form.setValue('numeroBanheiros', 2);
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(true);
      });
    });

    it('deve bloquear avanço quando etapa tem dados inválidos', async () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Deixar campo obrigatório vazio
      act(() => {
        result.current.form.setValue('nomeObra', '');
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(false);
      });
    });

    it('deve validar CEP na etapa 2', async () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Ir para etapa 2
      act(() => {
        result.current.irParaEtapa(2);
      });

      // Preencher CEP inválido
      act(() => {
        result.current.form.setValue('cep', '12345');
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(false);
      });

      // Preencher CEP válido
      act(() => {
        result.current.form.setValue('cep', '01310-100');
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(true);
      });
    });

    it('deve validar área construída menor que área do terreno', async () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Ir para etapa 3
      act(() => {
        result.current.irParaEtapa(3);
      });

      // Área construída maior que terreno (inválido)
      act(() => {
        result.current.form.setValue('areaTerreno', 100);
        result.current.form.setValue('areaConstruida', 150);
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(false);
      });

      // Corrigir valores
      act(() => {
        result.current.form.setValue('areaConstruida', 80);
      });

      await waitFor(() => {
        expect(result.current.podeAvancar).toBe(true);
      });
    });
  });

  describe('Integração com CEP', () => {
    it('deve buscar endereço automaticamente quando CEP é preenchido', async () => {
      const mockUseCEP = vi.mocked(await import('../useCEP')).useCEP;
      const mockBuscarCEP = vi.fn();
      
      mockUseCEP.mockReturnValue({
        loading: false,
        error: null,
        endereco: {
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
        },
        buscarCEP: mockBuscarCEP,
        limparEndereco: vi.fn(),
      });

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Ir para etapa 2 e preencher CEP
      act(() => {
        result.current.irParaEtapa(2);
        result.current.form.setValue('cep', '01310-100');
      });

      expect(mockBuscarCEP).toHaveBeenCalledWith('01310-100');
    });

    it('deve preencher endereço automaticamente quando CEP é válido', () => {
      const mockUseCEP = vi.mocked(await import('../useCEP')).useCEP;
      
      mockUseCEP.mockReturnValue({
        loading: false,
        error: null,
        endereco: {
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
        },
        buscarCEP: vi.fn(),
        limparEndereco: vi.fn(),
      });

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      const formValues = result.current.form.getValues();
      expect(formValues.endereco).toBe('Avenida Paulista');
      expect(formValues.bairro).toBe('Bela Vista');
      expect(formValues.cidade).toBe('São Paulo');
      expect(formValues.uf).toBe('SP');
    });
  });

  describe('Cálculo com IA', () => {
    it('deve executar cálculo com IA quando formulário é válido', async () => {
      const mockCalculoIA = vi.mocked(await import('@/services/orcamentoApi')).calculoOrcamentoApi.calcularComIA;
      mockCalculoIA.mockResolvedValue({
        custoTotal: 250000,
        custoM2: 2500,
        detalhes: {
          fundacao: 50000,
          estrutura: 100000,
          acabamento: 100000,
        },
      });

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Preencher formulário completo
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Test');
        result.current.form.setValue('tipoObra', 'residencial');
        result.current.form.setValue('areaConstruida', 100);
        result.current.form.setValue('areaTerreno', 200);
        result.current.form.setValue('cep', '01310-100');
        result.current.form.setValue('padraoAcabamento', 'medio');
      });

      // Ir para última etapa
      act(() => {
        result.current.irParaEtapa(4);
      });

      expect(result.current.calculandoIA).toBe(true);

      await waitFor(() => {
        expect(result.current.calculandoIA).toBe(false);
        expect(mockCalculoIA).toHaveBeenCalled();
      });
    });

    it('deve lidar com erro no cálculo de IA sem bloquear o formulário', async () => {
      const mockCalculoIA = vi.mocked(await import('@/services/orcamentoApi')).calculoOrcamentoApi.calcularComIA;
      mockCalculoIA.mockRejectedValue(new Error('IA indisponível'));

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Preencher formulário
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Test');
        result.current.form.setValue('tipoObra', 'residencial');
      });

      // Ir para última etapa
      act(() => {
        result.current.irParaEtapa(4);
      });

      await waitFor(() => {
        expect(result.current.calculandoIA).toBe(false);
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('IA indisponível')
        );
      });

      // Formulário ainda deve permitir submissão
      expect(result.current.podeAvancar).toBe(true);
    });
  });

  describe('Submit do formulário', () => {
    it('deve criar orçamento com dados válidos', async () => {
      const mockCriarOrcamento = vi.mocked(await import('@/services/orcamentoApi')).orcamentosParametricosApi.criar;
      const novoOrcamento = { id: 'orcamento-123', custoTotal: 250000 };
      mockCriarOrcamento.mockResolvedValue(novoOrcamento);

      const onOrcamentoCriado = vi.fn();
      const { result } = renderHook(
        () => useWizardOrcamento({ onOrcamentoCriado }), 
        { wrapper }
      );

      // Preencher formulário completo
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Completa');
        result.current.form.setValue('tipoObra', 'residencial');
        result.current.form.setValue('areaConstruida', 100);
        result.current.form.setValue('areaTerreno', 200);
        result.current.form.setValue('cep', '01310-100');
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockCriarOrcamento).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeObra: 'Casa Completa',
          tipoObra: 'residencial',
          areaConstruida: 100,
          areaTerreno: 200,
        })
      );

      expect(onOrcamentoCriado).toHaveBeenCalledWith(novoOrcamento);
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Orçamento criado com sucesso')
      );
    });

    it('deve lidar com erro na criação do orçamento', async () => {
      const mockCriarOrcamento = vi.mocked(await import('@/services/orcamentoApi')).orcamentosParametricosApi.criar;
      mockCriarOrcamento.mockRejectedValue(new Error('Erro de servidor'));

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Preencher dados mínimos
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Test');
        result.current.form.setValue('tipoObra', 'residencial');
      });

      // Submit com erro
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao criar orçamento')
      );
      expect(result.current.isSubmitindo).toBe(false);
    });

    it('deve prevenir múltiplos submits simultâneos', async () => {
      const mockCriarOrcamento = vi.mocked(await import('@/services/orcamentoApi')).orcamentosParametricosApi.criar;
      
      // Mock com delay para simular request lento
      mockCriarOrcamento.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test' }), 1000))
      );

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Primeiro submit
      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.isSubmitindo).toBe(true);

      // Segundo submit deve ser ignorado
      act(() => {
        result.current.handleSubmit();
      });

      expect(mockCriarOrcamento).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estados computados', () => {
    it('deve calcular podeAvancar corretamente', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Estado inicial - sem dados obrigatórios
      expect(result.current.podeAvancar).toBe(false);

      // Preencher dados mínimos da etapa 1
      act(() => {
        result.current.form.setValue('nomeObra', 'Test');
        result.current.form.setValue('tipoObra', 'residencial');
      });

      expect(result.current.podeAvancar).toBe(true);
    });

    it('deve identificar última etapa corretamente', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      expect(result.current.isUltimaEtapa).toBe(false);

      act(() => {
        result.current.irParaEtapa(4);
      });

      expect(result.current.isUltimaEtapa).toBe(true);
    });

    it('deve validar formulário completo', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      expect(result.current.isFormValido).toBe(false);

      // Preencher todos os campos obrigatórios
      act(() => {
        result.current.form.setValue('nomeObra', 'Casa Completa');
        result.current.form.setValue('tipoObra', 'residencial');
        result.current.form.setValue('areaConstruida', 100);
        result.current.form.setValue('areaTerreno', 200);
        result.current.form.setValue('cep', '01310-100');
        result.current.form.setValue('numeroAndares', 1);
        result.current.form.setValue('numeroQuartos', 3);
        result.current.form.setValue('numeroBanheiros', 2);
      });

      expect(result.current.isFormValido).toBe(true);
    });
  });

  describe('Cenários edge cases', () => {
    it('deve lidar com valores extremos de área', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      // Área muito pequena
      act(() => {
        result.current.form.setValue('areaConstruida', 0.1);
      });

      expect(result.current.form.formState.errors.areaConstruida).toBeDefined();

      // Área muito grande
      act(() => {
        result.current.form.setValue('areaConstruida', 100000);
      });

      expect(result.current.form.formState.errors.areaConstruida).toBeDefined();
    });

    it('deve validar número máximo de andares', () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      act(() => {
        result.current.form.setValue('numeroAndares', 50);
      });

      expect(result.current.form.formState.errors.numeroAndares).toBeDefined();
    });

    it('deve lidar com rede indisponível durante submit', async () => {
      const mockCriarOrcamento = vi.mocked(await import('@/services/orcamentoApi')).orcamentosParametricosApi.criar;
      mockCriarOrcamento.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao criar orçamento')
      );
    });

    it('deve resetar estados de loading após timeout', async () => {
      const { result } = renderHook(() => useWizardOrcamento({}), { wrapper });

      act(() => {
        result.current.irParaEtapa(4);
      });

      // Simular timeout da IA
      await new Promise(resolve => setTimeout(resolve, 6000));

      expect(result.current.calculandoIA).toBe(false);
    }, 10000);
  });
});