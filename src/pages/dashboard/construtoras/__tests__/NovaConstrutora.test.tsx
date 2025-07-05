import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NovaConstrutora from '../NovaConstrutora';

// Mocks para dependências
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
}));

vi.mock('@/hooks/useConstrutoraCNPJ', () => ({
  useConstrutoraCNPJ: () => ({
    cnpjData: null,
    isLoadingCNPJ: false,
    handleManualCNPJLookup: vi.fn(),
  }),
}));

// Mock do contexto de autenticação com um tenant válido
vi.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { tenant_id: 'tenant-123' },
  }),
}));

vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://api.supabase.com',
    VITE_SUPABASE_ANON_KEY: 'test_anon_key',
  },
});

const queryClient = new QueryClient();

describe('NovaConstrutora Page - Integration Test', () => {
  const user = userEvent.setup();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NovaConstrutora />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve criar uma construtora PJ com sucesso', async () => {
    renderComponent();

    // A aba PJ já vem selecionada por padrão.
    const cnpjInput = screen.getByLabelText('CNPJ');
    const razaoSocialInput = screen.getByLabelText('Razão Social');
    const submitButton = screen.getByRole('button', { name: 'Criar Construtora' });
    
    // Preenche o formulário
    await user.type(cnpjInput, '33.041.260/0652-90'); // CNPJ válido
    await user.type(razaoSocialInput, 'Minha Construtora de Teste');
    
    // Envia o formulário
    await user.click(submitButton);
    
    // Verifica os resultados
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Construtora criada com sucesso!');
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/construtoras');
  });
}); 