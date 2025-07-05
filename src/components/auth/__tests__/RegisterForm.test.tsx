import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/contexts/auth/AuthContext';

import { RegisterForm } from '../RegisterForm';

// Mocks para dependências que não queremos testar aqui
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/analyticsApi', () => ({
  useAnalytics: () => ({
    trackConversion: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock simples para i18n
vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
}));

// Mock das variáveis de ambiente que o cliente Supabase precisa
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://api.supabase.com',
    VITE_SUPABASE_ANON_KEY: 'test_anon_key',
  },
});

describe('RegisterForm - Integration Test with MSW', () => {
  const user = userEvent.setup();

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve permitir que um usuário se registre com sucesso', async () => {
    renderComponent();

    // 1. Encontrar os campos do formulário. Usamos os labels que vêm de i18n.
    const firstNameInput = screen.getByLabelText('auth.firstName');
    const lastNameInput = screen.getByLabelText('auth.lastName');
    const emailInput = screen.getByLabelText('auth.email');
    const passwordInput = screen.getByLabelText('auth.password');
    const confirmPasswordInput = screen.getByLabelText('auth.confirmPassword');
    const submitButton = screen.getByRole('button', { name: /auth.createAccount/i });

    // 2. Simular o preenchimento do formulário
    await user.type(firstNameInput, 'João');
    await user.type(lastNameInput, 'Silva');
    await user.type(emailInput, 'joao.silva@example.com');
    await user.type(passwordInput, 'StrongP@ssw0rd!');
    await user.type(confirmPasswordInput, 'StrongP@ssw0rd!');

    // 3. Simular o clique no botão de submit
    await user.click(submitButton);

    // 4. Verificar os resultados na UI
    await waitFor(() => {
      // Verifica se o toast de sucesso foi chamado com a mensagem correta
      expect(toast.success).toHaveBeenCalledWith('Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.');
    });
    
    // Verifica se a navegação ocorreu
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});