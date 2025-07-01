import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useObras } from './useObras';
import { useAuth } from '@/contexts/auth/AuthContext';
import { obrasApi } from '@/services/api';

// Mock das dependências externas do hook
vi.mock('@/contexts/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  obrasApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Cast dos mocks para ter acesso aos métodos do Vitest (mockReturnValue, etc.)
const useAuthMock = useAuth as vi.Mock;
const obrasApiGetAllMock = obrasApi.getAll as vi.Mock;

// Cria um cliente de query para os testes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Desabilita retentativas para os testes serem mais rápidos
    },
  },
});

// Componente wrapper para fornecer o QueryClient ao hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useObras', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should not fetch obras when tenantId is missing', () => {
    // Simula useAuth retornando um usuário sem tenantId
    useAuthMock.mockReturnValue({ user: { profile: { tenant_id: null } } });

    const { result } = renderHook(() => useObras(), { wrapper });

    expect(result.current.obras).toBeUndefined();
    expect(result.current.isLoading).toBe(false); // Não deve estar carregando pois a query está desabilitada
    expect(obrasApi.getAll).not.toHaveBeenCalled();
  });

  it('should return loading state initially and then the list of obras', async () => {
    const mockTenantId = 'tenant-123';
    const mockObras = [{ id: 'obra-1', nome: 'Obra Teste' }];

    // Simula useAuth retornando um usuário com tenantId
    useAuthMock.mockReturnValue({ user: { profile: { tenant_id: mockTenantId } } });
    // Simula a API retornando a lista de obras
    obrasApiGetAllMock.mockResolvedValue(mockObras);

    const { result } = renderHook(() => useObras(), { wrapper });

    // Estado inicial de carregamento
    expect(result.current.isLoading).toBe(true);

    // Espera a query ser resolvida
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.obras).toEqual(mockObras);
      expect(obrasApi.getAll).toHaveBeenCalledWith(mockTenantId);
    });
  });

  it('should handle errors when fetching obras', async () => {
    const mockTenantId = 'tenant-123';
    const mockError = new Error('Falha na API');

    // Simula useAuth retornando um usuário com tenantId
    useAuthMock.mockReturnValue({ user: { profile: { tenant_id: mockTenantId } } });
    // Simula a API retornando um erro
    obrasApiGetAllMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => useObras(), { wrapper });

    // Estado inicial de carregamento
    expect(result.current.isLoading).toBe(true);

    // Espera a query falhar
    await waitFor(() => {
      // A melhor prática é esperar a condição de "fim" ser atingida.
      // Neste caso, é o aparecimento do objeto de erro.
      expect(result.current.error).not.toBeNull();
    }, { timeout: 2000 }); // Aumenta o timeout para acomodar a lógica de retry do hook

    // Agora que a query terminou, verificamos o estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.obras).toBeUndefined();
  });
}); 