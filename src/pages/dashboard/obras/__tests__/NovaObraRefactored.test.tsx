import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NovaObraRefactored from '../NovaObraRefactored';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useCEP', () => ({
  useCEP: () => ({
    buscarCEP: vi.fn(),
    formatarCEP: (cep: string) => cep,
    isLoading: false,
    error: null,
  }),
}));

vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://api.supabase.com',
    VITE_SUPABASE_ANON_KEY: 'test_anon_key',
  },
});

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

describe('NovaObraRefactored Page - Integration Test', () => {
  const user = userEvent.setup();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NovaObraRefactored />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve criar uma nova obra com sucesso', async () => {
    renderComponent();
    
    // Aguarda o select de construtoras ser populado
    const construtoraSelect = await screen.findByRole('combobox', { name: /construtora/i });
    expect(construtoraSelect).toBeInTheDocument();

    // Preenche os campos do formulário
    await user.type(screen.getByLabelText(/nome da obra/i), 'Edifício Sol Nascente');
    await user.type(screen.getByLabelText(/cep/i), '12345-678');
    await user.type(screen.getByLabelText(/endereço/i), 'Rua dos Testes, 123');
    await user.type(screen.getByLabelText(/cidade/i), 'Testópolis');
    await user.selectOptions(screen.getByRole('combobox', { name: /estado/i }), 'SP');
    await user.type(screen.getByLabelText(/orçamento/i), '1500000');
    
    // Seleciona uma construtora
    await user.click(construtoraSelect);
    await user.click(await screen.findByText(/Construtora Teste 1/i));

    // Envia o formulário
    const submitButton = screen.getByRole('button', { name: /salvar obra/i });
    await user.click(submitButton);

    // Verifica os resultados
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Obra criada com sucesso!');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/obras');
  });
}); 