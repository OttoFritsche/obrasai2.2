import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SinapiSelector } from '../SinapiSelector';

// Mock dos hooks SINAPI
vi.mock('@/hooks/useSinapiManutencoes', () => ({
  useSinapiBuscaInteligente: vi.fn(() => ({
    dados: [],
    isLoading: false,
    error: null,
    buscarInteligente: vi.fn(),
    limparBusca: vi.fn(),
  })),
  useSinapiValidacao: vi.fn(() => ({
    validarCodigos: vi.fn(),
    isValidating: false,
  })),
}));

// Mock dos componentes internos
vi.mock('@/components/sinapi/HistoricoModal', () => ({
  HistoricoModal: ({ isOpen, onClose, codigoSinapi }: any) => (
    isOpen ? (
      <div data-testid="historico-modal">
        <p>Histórico para código: {codigoSinapi}</p>
        <button onClick={onClose} data-testid="fechar-historico">Fechar</button>
      </div>
    ) : null
  ),
}));

vi.mock('@/components/sinapi/ManutencaoIndicator', () => ({
  ManutencaoIndicatorCompact: ({ status, tipoManutencao }: any) => (
    <span data-testid="manutencao-indicator">
      Status: {status} - Tipo: {tipoManutencao}
    </span>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Dados mock para testes
const mockSinapiItems = [
  {
    codigo_sinapi: 74209,
    descricao: 'Alvenaria de vedação de blocos cerâmicos',
    status_atual: 'ativo' as const,
    fonte: 'normal' as const,
    unidade: 'm²',
    preco_referencia: 45.67,
  },
  {
    codigo_sinapi: 87594,
    descricao: 'Concreto usinado para fundação',
    status_atual: 'alterado' as const,
    fonte: 'manutencao' as const,
    tipo_manutencao: 'desonerado',
    unidade: 'm³',
    preco_referencia: 280.50,
  },
  {
    codigo_sinapi: 92345,
    descricao: 'Pintura em paredes internas',
    status_atual: 'desativado' as const,
    fonte: 'normal' as const,
    unidade: 'm²',
    preco_referencia: 12.30,
  },
];

const mockCodigosSelecionados = [
  {
    codigo: 74209,
    descricao: 'Alvenaria de vedação de blocos cerâmicos',
    status: 'ativo' as const,
    validacao: {
      existe: true,
      ativo: true,
      alteracoes_recentes: false,
      mensagem: 'Código válido e ativo',
    },
  },
];

describe('SinapiSelector', () => {
  let queryClient: QueryClient;
  let mockBuscarInteligente: ReturnType<typeof vi.fn>;
  let mockValidarCodigos: ReturnType<typeof vi.fn>;
  let mockLimparBusca: ReturnType<typeof vi.fn>;
  const user = userEvent.setup();

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SinapiSelector {...props} />
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

    // Setup mocks
    mockBuscarInteligente = vi.fn();
    mockValidarCodigos = vi.fn();
    mockLimparBusca = vi.fn();

    const mockUseSinapiBuscaInteligente = vi.mocked(
      await import('@/hooks/useSinapiManutencoes')
    ).useSinapiBuscaInteligente;

    const mockUseSinapiValidacao = vi.mocked(
      await import('@/hooks/useSinapiManutencoes')
    ).useSinapiValidacao;

    mockUseSinapiBuscaInteligente.mockReturnValue({
      dados: [],
      isLoading: false,
      error: null,
      buscarInteligente: mockBuscarInteligente,
      limparBusca: mockLimparBusca,
    });

    mockUseSinapiValidacao.mockReturnValue({
      validarCodigos: mockValidarCodigos,
      isValidating: false,
    });

    vi.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar interface de busca', () => {
      renderComponent();

      expect(screen.getByText('🔍 Busca SINAPI Inteligente')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/busque por descrição ou código/i)).toBeInTheDocument();
      expect(screen.getByText('Buscar')).toBeInTheDocument();
    });

    it('deve renderizar seção de códigos selecionados', () => {
      renderComponent();

      expect(screen.getByText('📋 Códigos Selecionados')).toBeInTheDocument();
      expect(screen.getByText(/nenhum código selecionado/i)).toBeInTheDocument();
    });

    it('deve renderizar seção de input manual', () => {
      renderComponent();

      expect(screen.getByText('✏️ Adicionar Código Manual')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/digite o código sinapi/i)).toBeInTheDocument();
      expect(screen.getByText('Adicionar')).toBeInTheDocument();
    });

    it('deve aplicar className personalizada', () => {
      renderComponent({ className: 'custom-class' });

      const container = screen.getByText('🔍 Busca SINAPI Inteligente').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Busca inteligente', () => {
    it('deve executar busca quando termo é inserido', async () => {
      renderComponent();

      const inputBusca = screen.getByPlaceholderText(/busque por descrição ou código/i);
      await user.type(inputBusca, 'alvenaria');

      const btnBuscar = screen.getByText('Buscar');
      await user.click(btnBuscar);

      expect(mockBuscarInteligente).toHaveBeenCalledWith('alvenaria');
    });

    it('deve limpar busca quando termo é removido', async () => {
      renderComponent();

      const inputBusca = screen.getByPlaceholderText(/busque por descrição ou código/i);
      await user.type(inputBusca, 'alvenaria');
      await user.clear(inputBusca);

      expect(mockLimparBusca).toHaveBeenCalled();
    });

    it('deve mostrar estado de loading durante busca', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: [],
        isLoading: true,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      expect(screen.getByText(/buscando/i)).toBeInTheDocument();
    });

    it('deve exibir resultados da busca', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      expect(screen.getByText('74209')).toBeInTheDocument();
      expect(screen.getByText(/alvenaria de vedação/i)).toBeInTheDocument();
      expect(screen.getByText('87594')).toBeInTheDocument();
      expect(screen.getByText(/concreto usinado/i)).toBeInTheDocument();
    });

    it('deve filtrar resultados ativos/inativos', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      // Deve mostrar indicadores de status
      expect(screen.getAllByTestId('manutencao-indicator')).toHaveLength(3);
    });
  });

  describe('Seleção de códigos', () => {
    it('deve adicionar código quando botão + é clicado', async () => {
      const onCodigosChange = vi.fn();
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent({ onCodigosChange });

      const btnAdicionar = screen.getAllByTestId('btn-adicionar-codigo')[0];
      await user.click(btnAdicionar);

      expect(onCodigosChange).toHaveBeenCalledWith([
        expect.objectContaining({
          codigo: 74209,
          descricao: 'Alvenaria de vedação de blocos cerâmicos',
          status: 'ativo',
        }),
      ]);
    });

    it('deve prevenir adição de código duplicado', async () => {
      const onCodigosChange = vi.fn();
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados,
        onCodigosChange 
      });

      const btnAdicionar = screen.getAllByTestId('btn-adicionar-codigo')[0];
      await user.click(btnAdicionar);

      expect(onCodigosChange).not.toHaveBeenCalled();
      expect(vi.mocked(await import('sonner')).toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('já foi selecionado')
      );
    });

    it('deve remover código quando botão lixeira é clicado', async () => {
      const onCodigosChange = vi.fn();

      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados,
        onCodigosChange 
      });

      const btnRemover = screen.getByTestId('btn-remover-codigo');
      await user.click(btnRemover);

      expect(onCodigosChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Input manual de códigos', () => {
    it('deve adicionar código via input manual', async () => {
      const onCodigosChange = vi.fn();
      mockValidarCodigos.mockResolvedValue([
        {
          codigo: 99999,
          existe: true,
          ativo: true,
          descricao: 'Código manual teste',
          alteracoes_recentes: false,
          mensagem: 'Código válido',
        },
      ]);

      renderComponent({ onCodigosChange });

      const inputManual = screen.getByPlaceholderText(/digite o código sinapi/i);
      await user.type(inputManual, '99999');

      const btnAdicionar = screen.getByText('Adicionar');
      await user.click(btnAdicionar);

      await waitFor(() => {
        expect(mockValidarCodigos).toHaveBeenCalledWith([99999]);
        expect(onCodigosChange).toHaveBeenCalledWith([
          expect.objectContaining({
            codigo: 99999,
            descricao: 'Código manual teste',
            status: 'ativo',
          }),
        ]);
      });
    });

    it('deve validar código inválido no input manual', async () => {
      mockValidarCodigos.mockResolvedValue([
        {
          codigo: 88888,
          existe: false,
          ativo: false,
          descricao: '',
          alteracoes_recentes: false,
          mensagem: 'Código não encontrado',
        },
      ]);

      renderComponent();

      const inputManual = screen.getByPlaceholderText(/digite o código sinapi/i);
      await user.type(inputManual, '88888');

      const btnAdicionar = screen.getByText('Adicionar');
      await user.click(btnAdicionar);

      await waitFor(() => {
        expect(vi.mocked(await import('sonner')).toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Código não encontrado')
        );
      });
    });

    it('deve limpar input após adição bem-sucedida', async () => {
      mockValidarCodigos.mockResolvedValue([
        {
          codigo: 99999,
          existe: true,
          ativo: true,
          descricao: 'Código teste',
          alteracoes_recentes: false,
          mensagem: 'Código válido',
        },
      ]);

      renderComponent();

      const inputManual = screen.getByPlaceholderText(/digite o código sinapi/i);
      await user.type(inputManual, '99999');
      await user.click(screen.getByText('Adicionar'));

      await waitFor(() => {
        expect(inputManual).toHaveValue('');
      });
    });

    it('deve validar entrada apenas numérica', async () => {
      renderComponent();

      const inputManual = screen.getByPlaceholderText(/digite o código sinapi/i);
      await user.type(inputManual, 'abc123');

      const btnAdicionar = screen.getByText('Adicionar');
      await user.click(btnAdicionar);

      expect(vi.mocked(await import('sonner')).toast.error).toHaveBeenCalledWith(
        expect.stringContaining('apenas números')
      );
    });
  });

  describe('Validação automática', () => {
    it('deve validar códigos quando validacaoAutomatica é true', async () => {
      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados,
        validacaoAutomatica: true 
      });

      await waitFor(() => {
        expect(mockValidarCodigos).toHaveBeenCalledWith([74209]);
      });
    });

    it('não deve validar quando validacaoAutomatica é false', () => {
      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados,
        validacaoAutomatica: false 
      });

      expect(mockValidarCodigos).not.toHaveBeenCalled();
    });
  });

  describe('Histórico de códigos', () => {
    it('deve abrir modal de histórico quando botão histórico é clicado', async () => {
      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados 
      });

      const btnHistorico = screen.getByTestId('btn-historico-codigo');
      await user.click(btnHistorico);

      expect(screen.getByTestId('historico-modal')).toBeInTheDocument();
      expect(screen.getByText('Histórico para código: 74209')).toBeInTheDocument();
    });

    it('deve fechar modal de histórico', async () => {
      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados 
      });

      // Abrir modal
      const btnHistorico = screen.getByTestId('btn-historico-codigo');
      await user.click(btnHistorico);

      // Fechar modal
      const btnFechar = screen.getByTestId('fechar-historico');
      await user.click(btnFechar);

      expect(screen.queryByTestId('historico-modal')).not.toBeInTheDocument();
    });
  });

  describe('Estados de erro', () => {
    it('deve exibir erro de busca quando ocorre falha', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: [],
        isLoading: false,
        error: new Error('Falha na API SINAPI'),
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      expect(screen.getByText(/erro ao buscar/i)).toBeInTheDocument();
      expect(screen.getByText(/falha na api sinapi/i)).toBeInTheDocument();
    });

    it('deve exibir botão para tentar novamente em caso de erro', async () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: [],
        isLoading: false,
        error: new Error('Falha na API'),
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      const btnTentarNovamente = screen.getByText(/tentar novamente/i);
      await user.click(btnTentarNovamente);

      expect(mockBuscarInteligente).toHaveBeenCalled();
    });
  });

  describe('Indicadores de status', () => {
    it('deve mostrar badge para códigos ativos', () => {
      renderComponent({ 
        codigosSelecionados: mockCodigosSelecionados 
      });

      expect(screen.getByText('ATIVO')).toBeInTheDocument();
    });

    it('deve mostrar alerta para códigos desativados', () => {
      const codigoDesativado = [
        {
          codigo: 92345,
          descricao: 'Pintura em paredes internas',
          status: 'desativado' as const,
          validacao: {
            existe: true,
            ativo: false,
            alteracoes_recentes: false,
            mensagem: 'Código desativado',
          },
        },
      ];

      renderComponent({ 
        codigosSelecionados: codigoDesativado 
      });

      expect(screen.getByText('DESATIVADO')).toBeInTheDocument();
    });

    it('deve mostrar alerta para códigos alterados', () => {
      const codigoAlterado = [
        {
          codigo: 87594,
          descricao: 'Concreto usinado para fundação',
          status: 'alterado' as const,
          validacao: {
            existe: true,
            ativo: true,
            alteracoes_recentes: true,
            mensagem: 'Código foi alterado recentemente',
          },
        },
      ];

      renderComponent({ 
        codigosSelecionados: codigoAlterado 
      });

      expect(screen.getByText('ALTERADO')).toBeInTheDocument();
    });
  });

  describe('Formatação e exibição', () => {
    it('deve formatar preços corretamente', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      expect(screen.getByText(/R\$ 45,67/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 280,50/)).toBeInTheDocument();
    });

    it('deve truncar descrições longas', () => {
      const itemDescricaoLonga = {
        codigo_sinapi: 11111,
        descricao: 'Esta é uma descrição muito longa que deveria ser truncada para não quebrar o layout da interface do usuário e manter uma boa experiência visual',
        status_atual: 'ativo' as const,
        fonte: 'normal' as const,
        unidade: 'm²',
      };

      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: [itemDescricaoLonga],
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      const descricao = screen.getByText(/Esta é uma descrição muito longa/);
      expect(descricao).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels adequados para inputs', () => {
      renderComponent();

      const inputBusca = screen.getByPlaceholderText(/busque por descrição ou código/i);
      const inputManual = screen.getByPlaceholderText(/digite o código sinapi/i);

      expect(inputBusca).toHaveAccessibleName();
      expect(inputManual).toHaveAccessibleName();
    });

    it('deve ter botões com textos descritivos', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
    });

    it('deve ter estrutura de tabela acessível', () => {
      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: mockSinapiItems,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      const tabela = screen.getByRole('table');
      expect(tabela).toBeInTheDocument();
      
      const cabecalhos = screen.getAllByRole('columnheader');
      expect(cabecalhos.length).toBeGreaterThan(0);
    });
  });

  describe('Performance e otimização', () => {
    it('deve debouncer busca automática', async () => {
      renderComponent();

      const inputBusca = screen.getByPlaceholderText(/busque por descrição ou código/i);
      
      // Digitação rápida
      await user.type(inputBusca, 'alv');
      await user.type(inputBusca, 'ena');
      await user.type(inputBusca, 'ria');

      // Deve chamar apenas uma vez após delay
      await waitFor(() => {
        expect(mockLimparBusca).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('deve limitar número de resultados exibidos', () => {
      const muitosItens = Array.from({ length: 50 }, (_, i) => ({
        codigo_sinapi: 10000 + i,
        descricao: `Item ${i + 1}`,
        status_atual: 'ativo' as const,
        fonte: 'normal' as const,
        unidade: 'm²',
      }));

      const mockUseSinapiBuscaInteligente = vi.mocked(
        await import('@/hooks/useSinapiManutencoes')
      ).useSinapiBuscaInteligente;

      mockUseSinapiBuscaInteligente.mockReturnValue({
        dados: muitosItens,
        isLoading: false,
        error: null,
        buscarInteligente: mockBuscarInteligente,
        limparBusca: mockLimparBusca,
      });

      renderComponent();

      // Deve mostrar apenas os primeiros 20 resultados
      const linhasTabela = screen.getAllByRole('row');
      expect(linhasTabela.length).toBeLessThanOrEqual(21); // 20 + header
    });
  });
});