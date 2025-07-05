// Arquivo de setup para o Vitest.
// Configurações globais para testes
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";
import { setupTestHelpers } from "./test-utils";

// Adiciona os matchers do jest-axe ao expect
expect.extend(toHaveNoViolations);

// Setup dos nossos helpers customizados
setupTestHelpers();

// =================================================================
// MSW SERVER SETUP
// =================================================================
// Este trecho substitui o mock manual do cliente Supabase,
// permitindo que os testes façam chamadas de rede reais que são
// interceptadas pelo Mock Service Worker.

import { server } from "../mocks/server";

// Inicia o servidor antes de todos os testes
beforeAll(() => server.listen());

// Reseta qualquer handler que possamos adicionar durante os testes,
// para que eles não afetem outros testes.
afterEach(() => server.resetHandlers());

// Limpa após a conclusão dos testes.
afterAll(() => server.close());

// Mock global do Supabase (REMOVIDO)
// vi.mock('@/integrations/supabase/client', () => ({ ... }))
// O código acima foi removido para permitir o funcionamento do MSW.

// Mock global dos contextos de autenticação
vi.mock("@/contexts/auth/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: "user-123",
      email: "test@example.com",
      profile: {
        tenant_id: "tenant-123",
        nome: "Usuario Teste",
      },
    },
    isLoading: false,
    signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do TenantContext
vi.mock("@/contexts/TenantContext", () => ({
  useTenant: vi.fn(() => ({
    tenantId: "tenant-123",
    isLoading: false,
  })),
  TenantProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do React Router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({})),
    useLocation: vi.fn(() => ({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
    })),
  };
});

// Configurações globais do teste
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
