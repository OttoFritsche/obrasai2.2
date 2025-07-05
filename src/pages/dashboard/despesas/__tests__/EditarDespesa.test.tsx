import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthProvider } from '@/contexts/auth/AuthContext';

import EditarDespesa from '../EditarDespesa';

// Mock dos módulos externos
vi.mock('@/services/api', () => ({
  despesasApi: {
    getById: vi.fn(),
    update: vi.fn(),
  },
  obrasApi: {
    getAll: vi.fn(),
  },
  fornecedoresPJApi: {
    getAll: vi.fn(),
  },
  fornecedoresPFApi: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/hooks/useDespesas', () => ({
  useDespesas: () => ({
    useDespesa: vi.fn().mockReturnValue({
      data: {
        id: '123',
        obra_id: 'obra-1',
        descricao: 'Teste Despesa',
        data_despesa: '2024-01-15',
        quantidade: 2,
        valor_unitario: 100.50,
        pago: false,
        categoria: 'MATERIAL_CONSTRUCAO',
        etapa: 'FUNDACAO',
        insumo_customizado: 'Cimento CP-II',
        unidade: 'sc',
        observacoes: 'Material de boa qualidade',
      },
      isLoading: false,
      error: null,
    }),
    updateDespesa: {
      mutate: vi.fn(),
      isPending: false,
    },
  }),
}));

vi.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      profile: {
        tenant_id: 'tenant-1',
      },
    },
  }),
}));

// Mock do componente de layout
vi.mock('@/components/layouts/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock dos componentes de UI
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ date, onSelect }: { date: Date; onSelect: (date: Date) => void }) => (
    <input
      type="date"
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) => onSelect(new Date(e.target.value))}
      data-testid="date-picker"
    />
  ),
}));

// Mock do Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement, { route = '/dashboard/despesas/123/editar' } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/dashboard/despesas/:id/editar" element={component} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('EditarDespesa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de edição com dados carregados', async () => {
    renderWithProviders(<EditarDespesa />);

    // Verificar se o título está presente
    expect(screen.getByText('Editar Despesa')).toBeInTheDocument();
    
    // Verificar se os campos estão presentes
    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
    });
  });

  it('deve preencher o formulário com os dados da despesa', async () => {
    renderWithProviders(<EditarDespesa />);

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      // Verificar campos preenchidos
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Cimento CP-II')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100.5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('sc')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Material de boa qualidade')).toBeInTheDocument();
    });
  });

  it('deve mostrar calculadora de valor total', async () => {
    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      // Verificar se a calculadora está mostrando o valor correto (2 * 100.50 = 201.00)
      expect(screen.getByText('R$ 201.00')).toBeInTheDocument();
    });
  });

  it('deve permitir alterar os valores do formulário', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
    });

    // Alterar a descrição
    const descricaoInput = screen.getByDisplayValue('Teste Despesa');
    await user.clear(descricaoInput);
    await user.type(descricaoInput, 'Nova Descrição');

    expect(screen.getByDisplayValue('Nova Descrição')).toBeInTheDocument();
  });

  it('deve mostrar seção de pagamento quando marcado como pago', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
    });

    // Marcar como pago
    const pagoCheckbox = screen.getByLabelText('Marcar como pago');
    await user.click(pagoCheckbox);

    // Verificar se os campos de pagamento aparecem
    await waitFor(() => {
      expect(screen.getByLabelText('Data do Pagamento')).toBeInTheDocument();
      expect(screen.getByLabelText('Forma de Pagamento')).toBeInTheDocument();
    });
  });

  it('deve navegar de volta quando clicar em voltar', async () => {
    const user = userEvent.setup();
    
    // Mock do navigate
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
    });

    // Clicar no botão voltar
    const voltarButton = screen.getByText('Voltar');
    await user.click(voltarButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/despesas');
  });

  it('deve validar campos obrigatórios ao submeter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste Despesa')).toBeInTheDocument();
    });

    // Limpar campo obrigatório
    const descricaoInput = screen.getByDisplayValue('Teste Despesa');
    await user.clear(descricaoInput);

    // Tentar submeter
    const salvarButton = screen.getByText('Salvar Alterações');
    await user.click(salvarButton);

    // Verificar se mostra erro de validação
    await waitFor(() => {
      expect(screen.getByText(/pelo menos 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve atualizar valor total quando quantidade ou preço mudam', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDespesa />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    });

    // Alterar quantidade de 2 para 3
    const quantidadeInput = screen.getByDisplayValue('2');
    await user.clear(quantidadeInput);
    await user.type(quantidadeInput, '3');

    // Verificar se o valor total atualizou (3 * 100.50 = 301.50)
    await waitFor(() => {
      expect(screen.getByText('R$ 301.50')).toBeInTheDocument();
    });
  });
});