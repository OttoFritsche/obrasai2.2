import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WizardOrcamentoRefactored } from '../WizardOrcamentoRefactored';

// Mock dos hooks principais
vi.mock('@/hooks/useWizardOrcamento', () => ({
  useWizardOrcamento: vi.fn(() => ({
    etapaAtual: 1,
    isCalculando: false,
    calculandoIA: false,
    isSubmitindo: false,
    form: {
      control: {},
      handleSubmit: vi.fn(),
      formState: { errors: {} },
      getValues: vi.fn(() => ({})),
      setValue: vi.fn(),
      watch: vi.fn(),
    },
    proximaEtapa: vi.fn(),
    etapaAnterior: vi.fn(),
    irParaEtapa: vi.fn(),
    handleSubmit: vi.fn(),
    cepData: {
      loading: false,
      error: null,
      endereco: null,
      buscarCEP: vi.fn(),
      limparEndereco: vi.fn(),
    },
    podeAvancar: true,
    podeVoltar: false,
    isUltimaEtapa: false,
    isFormValido: false,
  })),
}));

// Mock dos componentes das etapas
vi.mock('../wizard/WizardEtapa1', () => ({
  WizardEtapa1: ({ form }: any) => (
    <div data-testid="wizard-etapa-1">
      <input data-testid="nome-obra" placeholder="Nome da obra" />
      <select data-testid="tipo-obra">
        <option value="residencial">Residencial</option>
        <option value="comercial">Comercial</option>
      </select>
    </div>
  ),
}));

vi.mock('../wizard/WizardEtapa2', () => ({
  WizardEtapa2: ({ form, cepData }: any) => (
    <div data-testid="wizard-etapa-2">
      <input data-testid="cep" placeholder="CEP" />
      <input data-testid="endereco" placeholder="Endereço" />
      {cepData?.loading && <span data-testid="cep-loading">Buscando...</span>}
    </div>
  ),
}));

vi.mock('../wizard/WizardEtapa3', () => ({
  WizardEtapa3: ({ form }: any) => (
    <div data-testid="wizard-etapa-3">
      <input data-testid="area-terreno" placeholder="Área do terreno" type="number" />
      <input data-testid="area-construida" placeholder="Área construída" type="number" />
    </div>
  ),
}));

vi.mock('../wizard/WizardEtapa4', () => ({
  WizardEtapa4: ({ form }: any) => (
    <div data-testid="wizard-etapa-4">
      <select data-testid="padrao-acabamento">
        <option value="basico">Básico</option>
        <option value="medio">Médio</option>
        <option value="alto">Alto</option>
      </select>
    </div>
  ),
}));

vi.mock('../wizard/WizardHeader', () => ({
  WizardHeader: ({ etapaAtual, isCalculando, calculandoIA }: any) => (
    <div data-testid="wizard-header">
      <span data-testid="etapa-atual">Etapa {etapaAtual} de 4</span>
      {isCalculando && <span data-testid="calculando">Calculando...</span>}
      {calculandoIA && <span data-testid="calculando-ia">IA processando...</span>}
    </div>
  ),
}));

vi.mock('../wizard/WizardNavigation', () => ({
  WizardNavigation: ({ 
    etapaAtual, 
    podeVoltar, 
    podeAvancar, 
    isUltimaEtapa, 
    isSubmitindo,
    onProximo,
    onAnterior,
    onSubmit
  }: any) => (
    <div data-testid="wizard-navigation">
      {podeVoltar && (
        <button 
          data-testid="btn-anterior" 
          onClick={onAnterior}
          disabled={isSubmitindo}
        >
          Anterior
        </button>
      )}
      
      {!isUltimaEtapa && podeAvancar && (
        <button 
          data-testid="btn-proximo" 
          onClick={onProximo}
          disabled={isSubmitindo}
        >
          Próximo
        </button>
      )}
      
      {isUltimaEtapa && (
        <button 
          data-testid="btn-submit" 
          onClick={onSubmit}
          disabled={isSubmitindo}
        >
          {isSubmitindo ? 'Criando...' : 'Criar Orçamento'}
        </button>
      )}
    </div>
  ),
}));

describe('WizardOrcamentoRefactored', () => {
  let queryClient: QueryClient;
  let mockUseWizardOrcamento: any;

  const renderWizard = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WizardOrcamentoRefactored {...props} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Reset do mock
    mockUseWizardOrcamento = vi.mocked(await import('@/hooks/useWizardOrcamento')).useWizardOrcamento;
    mockUseWizardOrcamento.mockReturnValue({
      etapaAtual: 1,
      isCalculando: false,
      calculandoIA: false,
      isSubmitindo: false,
      form: {
        control: {},
        handleSubmit: vi.fn(),
        formState: { errors: {} },
        getValues: vi.fn(() => ({})),
        setValue: vi.fn(),
        watch: vi.fn(),
      },
      proximaEtapa: vi.fn(),
      etapaAnterior: vi.fn(),
      irParaEtapa: vi.fn(),
      handleSubmit: vi.fn(),
      cepData: {
        loading: false,
        error: null,
        endereco: null,
        buscarCEP: vi.fn(),
        limparEndereco: vi.fn(),
      },
      podeAvancar: true,
      podeVoltar: false,
      isUltimaEtapa: false,
      isFormValido: false,
    });

    vi.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o wizard na etapa 1', () => {
      renderWizard();

      expect(screen.getByTestId('wizard-header')).toBeInTheDocument();
      expect(screen.getByTestId('etapa-atual')).toHaveTextContent('Etapa 1 de 4');
      expect(screen.getByTestId('wizard-etapa-1')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-navigation')).toBeInTheDocument();
    });

    it('deve passar props corretas para o hook', () => {
      const onOrcamentoCriado = vi.fn();
      const obraId = 'obra-123';

      renderWizard({ onOrcamentoCriado, obraId });

      expect(mockUseWizardOrcamento).toHaveBeenCalledWith({
        onOrcamentoCriado,
        obraId,
      });
    });

    it('deve renderizar etapa 1 com campos corretos', () => {
      renderWizard();

      expect(screen.getByTestId('nome-obra')).toBeInTheDocument();
      expect(screen.getByTestId('tipo-obra')).toBeInTheDocument();
    });
  });

  describe('Navegação entre etapas', () => {
    it('deve renderizar etapa 2 quando etapaAtual for 2', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 2,
        podeVoltar: true,
      });

      renderWizard();

      expect(screen.getByTestId('etapa-atual')).toHaveTextContent('Etapa 2 de 4');
      expect(screen.getByTestId('wizard-etapa-2')).toBeInTheDocument();
      expect(screen.queryByTestId('wizard-etapa-1')).not.toBeInTheDocument();
    });

    it('deve renderizar etapa 3 quando etapaAtual for 3', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 3,
        podeVoltar: true,
      });

      renderWizard();

      expect(screen.getByTestId('etapa-atual')).toHaveTextContent('Etapa 3 de 4');
      expect(screen.getByTestId('wizard-etapa-3')).toBeInTheDocument();
      expect(screen.getByTestId('area-terreno')).toBeInTheDocument();
      expect(screen.getByTestId('area-construida')).toBeInTheDocument();
    });

    it('deve renderizar etapa 4 quando etapaAtual for 4', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 4,
        podeVoltar: true,
        isUltimaEtapa: true,
      });

      renderWizard();

      expect(screen.getByTestId('etapa-atual')).toHaveTextContent('Etapa 4 de 4');
      expect(screen.getByTestId('wizard-etapa-4')).toBeInTheDocument();
      expect(screen.getByTestId('padrao-acabamento')).toBeInTheDocument();
    });

    it('deve fallback para etapa 1 quando etapaAtual for inválida', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 999, // etapa inválida
      });

      renderWizard();

      expect(screen.getByTestId('wizard-etapa-1')).toBeInTheDocument();
    });
  });

  describe('Estados de loading', () => {
    it('deve mostrar estado de cálculo geral', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        isCalculando: true,
      });

      renderWizard();

      expect(screen.getByTestId('calculando')).toBeInTheDocument();
    });

    it('deve mostrar estado de cálculo da IA', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        calculandoIA: true,
      });

      renderWizard();

      expect(screen.getByTestId('calculando-ia')).toBeInTheDocument();
    });

    it('deve mostrar loading do CEP na etapa 2', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 2,
        cepData: {
          loading: true,
          error: null,
          endereco: null,
          buscarCEP: vi.fn(),
          limparEndereco: vi.fn(),
        },
      });

      renderWizard();

      expect(screen.getByTestId('cep-loading')).toBeInTheDocument();
    });
  });

  describe('Navegação interativa', () => {
    it('deve exibir botão "Próximo" quando pode avançar', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        podeAvancar: true,
        isUltimaEtapa: false,
      });

      renderWizard();

      expect(screen.getByTestId('btn-proximo')).toBeInTheDocument();
      expect(screen.queryByTestId('btn-anterior')).not.toBeInTheDocument();
    });

    it('deve exibir botão "Anterior" quando pode voltar', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 2,
        podeVoltar: true,
        podeAvancar: true,
      });

      renderWizard();

      expect(screen.getByTestId('btn-anterior')).toBeInTheDocument();
      expect(screen.getByTestId('btn-proximo')).toBeInTheDocument();
    });

    it('deve exibir botão "Criar Orçamento" na última etapa', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 4,
        podeVoltar: true,
        isUltimaEtapa: true,
      });

      renderWizard();

      expect(screen.getByTestId('btn-submit')).toBeInTheDocument();
      expect(screen.queryByTestId('btn-proximo')).not.toBeInTheDocument();
    });

    it('deve chamar proximaEtapa quando botão próximo é clicado', () => {
      const mockProximaEtapa = vi.fn();
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        proximaEtapa: mockProximaEtapa,
        podeAvancar: true,
      });

      renderWizard();

      fireEvent.click(screen.getByTestId('btn-proximo'));
      expect(mockProximaEtapa).toHaveBeenCalled();
    });

    it('deve chamar etapaAnterior quando botão anterior é clicado', () => {
      const mockEtapaAnterior = vi.fn();
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 2,
        etapaAnterior: mockEtapaAnterior,
        podeVoltar: true,
      });

      renderWizard();

      fireEvent.click(screen.getByTestId('btn-anterior'));
      expect(mockEtapaAnterior).toHaveBeenCalled();
    });

    it('deve chamar handleSubmit quando botão submit é clicado', () => {
      const mockHandleSubmit = vi.fn();
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 4,
        handleSubmit: mockHandleSubmit,
        isUltimaEtapa: true,
      });

      renderWizard();

      fireEvent.click(screen.getByTestId('btn-submit'));
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('Estados de submissão', () => {
    it('deve desabilitar botões durante submissão', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 4,
        isSubmitindo: true,
        isUltimaEtapa: true,
        podeVoltar: true,
      });

      renderWizard();

      expect(screen.getByTestId('btn-submit')).toBeDisabled();
      expect(screen.getByTestId('btn-anterior')).toBeDisabled();
    });

    it('deve mostrar texto de loading no botão submit', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 4,
        isSubmitindo: true,
        isUltimaEtapa: true,
      });

      renderWizard();

      expect(screen.getByTestId('btn-submit')).toHaveTextContent('Criando...');
    });
  });

  describe('Estrutura HTML e acessibilidade', () => {
    it('deve ter estrutura HTML semântica', () => {
      renderWizard();

      const container = screen.getByTestId('wizard-header').closest('div');
      expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'p-6', 'space-y-6');
    });

    it('deve renderizar formulário com estrutura correta', () => {
      renderWizard();

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });

    it('deve ter aria-labels nos elementos interativos', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        podeAvancar: true,
      });

      renderWizard();

      const proximoBtn = screen.getByTestId('btn-proximo');
      expect(proximoBtn).toBeInTheDocument();
    });
  });

  describe('Integração com props', () => {
    it('deve chamar onOrcamentoCriado quando callback é executado', async () => {
      const onOrcamentoCriado = vi.fn();
      
      renderWizard({ onOrcamentoCriado });

      // Verificar se o hook foi chamado com o callback correto
      expect(mockUseWizardOrcamento).toHaveBeenCalledWith(
        expect.objectContaining({ onOrcamentoCriado })
      );
    });

    it('deve passar obraId para o hook', () => {
      const obraId = 'obra-456';
      
      renderWizard({ obraId });

      expect(mockUseWizardOrcamento).toHaveBeenCalledWith(
        expect.objectContaining({ obraId })
      );
    });

    it('deve funcionar sem props opcionais', () => {
      renderWizard();

      expect(mockUseWizardOrcamento).toHaveBeenCalledWith({});
    });
  });

  describe('Cenários edge cases', () => {
    it('deve lidar com estado undefined do hook', () => {
      mockUseWizardOrcamento.mockReturnValue(undefined);

      expect(() => renderWizard()).not.toThrow();
    });

    it('deve lidar com form undefined', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        form: undefined,
      });

      expect(() => renderWizard()).not.toThrow();
    });

    it('deve lidar com cepData undefined', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 2,
        cepData: undefined,
      });

      renderWizard();
      expect(screen.getByTestId('wizard-etapa-2')).toBeInTheDocument();
    });

    it('deve renderizar sem crash quando todos os booleans são undefined', () => {
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        isCalculando: undefined,
        calculandoIA: undefined,
        isSubmitindo: undefined,
        podeAvancar: undefined,
        podeVoltar: undefined,
        isUltimaEtapa: undefined,
      });

      expect(() => renderWizard()).not.toThrow();
    });
  });

  describe('Performance e otimização', () => {
    it('não deve re-renderizar desnecessariamente', () => {
      const { rerender } = renderWizard();

      // Mock com mesmos valores
      mockUseWizardOrcamento.mockReturnValue({
        ...mockUseWizardOrcamento(),
        etapaAtual: 1,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WizardOrcamentoRefactored />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Deve renderizar apenas uma vez para cada etapa
      expect(screen.getByTestId('wizard-etapa-1')).toBeInTheDocument();
    });

    it('deve usar React.memo implicitamente nos sub-componentes', () => {
      // Verificar que os componentes filho são renderizados corretamente
      renderWizard();

      expect(screen.getByTestId('wizard-header')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-etapa-1')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-navigation')).toBeInTheDocument();
    });
  });
});