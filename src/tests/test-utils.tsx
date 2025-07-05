import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';

// Mock providers para testes
const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  profile: {
    tenant_id: 'tenant-123',
    nome: 'Usuario Teste'
  }
};

// AuthContext mock
const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

// TenantContext mock  
const MockTenantProvider = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="mock-tenant-provider">
      {children}
    </div>
  );
};

// Cria um cliente de query otimizado para testes
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Desabilita cache entre testes
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Wrapper principal para testes
const AllTheProviders = ({ children, queryClient }: { 
  children: ReactNode;
  queryClient?: QueryClient;
}) => {
  const testQueryClient = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <MockAuthProvider>
          <MockTenantProvider>
            {children}
          </MockTenantProvider>
        </MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render que inclui todos os providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock factories para dados consistentes
export const mockFactories = {
  obra: (overrides = {}) => ({
    id: 'obra-123',
    nome: 'Obra Teste',
    descricao: 'Descrição da obra teste',
    status: 'ativa' as const,
    tenant_id: 'tenant-123',
    usuario_id: 'user-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  contrato: (overrides = {}) => ({
    id: 'contrato-123',
    titulo: 'Contrato Teste',
    obra_id: 'obra-123',
    status: 'rascunho' as const,
    tenant_id: 'tenant-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  contratoFormData: (overrides = {}) => ({
    titulo: 'Contrato de Construção Residencial',
    obra_id: 'obra-123',
    template_id: 'template-123',
    
    // Contratante
    contratante_nome: 'João Silva Santos',
    contratante_documento: '123.456.789-00',
    contratante_email: 'joao.silva@email.com',
    contratante_telefone: '(11) 99999-9999',
    contratante_endereco: 'Rua das Flores, 123',
    contratante_cidade: 'São Paulo',
    contratante_uf: 'SP',
    contratante_cep: '01234-567',
    
    // Contratado
    contratado_nome: 'Construtora ABC Ltda',
    contratado_documento: '12.345.678/0001-90',
    contratado_email: 'contato@construtorabc.com',
    contratado_telefone: '(11) 8888-8888',
    contratado_endereco: 'Av. Construção, 456',
    contratado_cidade: 'São Paulo',
    contratado_uf: 'SP',
    contratado_cep: '01234-890',
    contratado_responsavel: 'Maria Santos',
    contratado_crea: '12345-SP',
    
    // Financeiro
    valor_total: 250000.00,
    valor_sinal: 25000.00,
    forma_pagamento: 'parcelado',
    numero_parcelas: 10,
    valor_parcela: 22500.00,
    
    // Prazo e cronograma
    prazo_dias: 180,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Garantias e seguros
    garantia_meses: 12,
    seguro_obra: true,
    seguro_responsabilidade: true,
    
    // Observações
    observacoes: 'Contrato para construção de casa residencial conforme projeto arquitetônico anexo.',
    clausulas_especiais: 'Material de primeira qualidade, mão de obra especializada.',
    
    // Metadados
    tenant_id: 'tenant-123',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  template: (overrides = {}) => ({
    id: 'template-123',
    nome: 'Contrato Residencial Padrão',
    tipo: 'residencial',
    descricao: 'Template padrão para contratos de construção residencial',
    conteudo: 'Conteúdo do template com cláusulas padrão...',
    clausulas_obrigatorias: [
      'Prazo de execução',
      'Garantia de 5 anos',
      'Seguro da obra',
      'Responsabilidade civil'
    ],
    ativo: true,
    categoria: 'construcao',
    tenant_id: 'tenant-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  user: (overrides = {}) => ({
    ...mockAuthUser,
    ...overrides
  }),

  despesa: (overrides = {}) => ({
    id: 'despesa-123',
    descricao: 'Despesa Teste',
    valor: 1000.00,
    obra_id: 'obra-123',
    tenant_id: 'tenant-123',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  orcamento: (overrides = {}) => ({
    id: 'orcamento-123',
    nomeObra: 'Casa Residencial',
    tipoObra: 'residencial',
    areaTerreno: 300,
    areaConstruida: 150,
    numeroAndares: 1,
    numeroQuartos: 3,
    numeroBanheiros: 2,
    cep: '01310-100',
    endereco: 'Avenida Paulista, 1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    padraoAcabamento: 'medio',
    custoTotal: 375000,
    custoM2: 2500,
    obra_id: 'obra-123',
    tenant_id: 'tenant-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  wizardFormData: (overrides = {}) => ({
    // Etapa 1 - Dados básicos
    nomeObra: 'Casa Teste',
    tipoObra: 'residencial' as const,
    numeroAndares: 1,
    numeroQuartos: 3,
    numeroBanheiros: 2,
    numeroVagasGaragem: 2,
    
    // Etapa 2 - Localização
    cep: '01310-100',
    endereco: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 101',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    
    // Etapa 3 - Áreas
    areaTerreno: 300,
    areaConstruida: 150,
    areaComum: 50,
    areaPrivativa: 100,
    
    // Etapa 4 - Especificações
    padraoAcabamento: 'medio' as const,
    temPiscina: false,
    temElevador: false,
    temGourmet: true,
    observacoes: 'Observações do projeto',
    
    // Metadados
    obra_id: 'obra-123',
    tenant_id: 'tenant-123',
    ...overrides
  }),

  calculoIA: (overrides = {}) => ({
    custoTotal: 375000,
    custoM2: 2500,
    detalhes: {
      fundacao: 75000,
      estrutura: 150000,
      cobertura: 45000,
      paredes: 60000,
      acabamento: 45000,
    },
    prazoEstimado: 180, // dias
    confiabilidade: 0.85,
    fatoresConsiderados: [
      'Padrão de acabamento médio',
      'Área construída de 150m²',
      'Localização: São Paulo/SP',
      'Tipo residencial'
    ],
    ...overrides
  }),

  enderecoViaCEP: (overrides = {}) => ({
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: '',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    gia: '1004',
    ddd: '11',
    siafi: '7107',
    erro: false,
    ...overrides
  }),
};

// Helpers para simulação de APIs
export const apiMockHelpers = {
  // Simula delay de rede
  withDelay: <T>(data: T, delay = 100): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay)),

  // Simula erro de rede
  withNetworkError: (message = 'Network Error'): Promise<never> =>
    Promise.reject(new Error(message)),

  // Simula erro de API com status
  withApiError: (status: number, message: string): Promise<never> => {
    const error = new Error(message) as any;
    error.status = status;
    return Promise.reject(error);
  },

  // Simula sucesso com probabilidade
  withRandomSuccess: <T>(data: T, successRate = 0.8): Promise<T> =>
    Math.random() < successRate 
      ? Promise.resolve(data)
      : Promise.reject(new Error('Random API failure')),
};

// Helpers para testes de hook
export const hookTestHelpers = {
  // Simula tenant_id presente
  withTenant: (tenant_id = 'tenant-123') => ({
    user: { profile: { tenant_id } }
  }),

  // Simula usuário sem tenant
  withoutTenant: () => ({
    user: { profile: { tenant_id: null } }
  }),

  // Simula usuário não autenticado
  unauthenticated: () => ({
    user: null
  }),
};

// Matchers customizados para testes
export const customMatchers = {
  // Verifica se componente está em loading
  toBeLoading: (received: HTMLElement) => {
    const loadingElements = [
      received.querySelector('[data-testid="loading"]'),
      received.querySelector('.animate-spin'),
      received.textContent?.includes('Carregando'),
    ];
    
    const isLoading = loadingElements.some(Boolean);
    
    return {
      pass: isLoading,
      message: () => isLoading 
        ? 'Expected element not to be in loading state'
        : 'Expected element to be in loading state'
    };
  },

  // Verifica se formulário está válido
  toBeValidForm: (received: HTMLFormElement) => {
    const isValid = received.checkValidity();
    
    return {
      pass: isValid,
      message: () => isValid
        ? 'Expected form to be invalid'
        : 'Expected form to be valid'
    };
  },
};

// Extend expect com matchers customizados
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeLoading(): any;
      toBeValidForm(): any;
    }
  }
}

// Setup para ser importado em setup.ts
export const setupTestHelpers = () => {
  // Extend expect com nossos matchers
  expect.extend(customMatchers);
  
  // Mock console errors para testes mais limpos
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
  });
};

// Re-export tudo que é necessário
export * from '@testing-library/react';
export { renderWithProviders as render };