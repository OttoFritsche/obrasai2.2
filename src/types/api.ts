// Tipos para respostas de API
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// Tipos para Supabase
export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para CNPJ API
export interface CNPJApiResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone?: string;
    email?: string;
  };
  atividade_principal: {
    codigo: string;
    descricao: string;
  };
  data_abertura: string;
  capital_social?: number;
  porte: string;
}

// Tipos para CEP API
export interface CEPApiResponse {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia?: string;
  ddd: string;
  siafi: string;
}

// Tipos para SINAPI API
export interface SinapiItem {
  codigo: string;
  descricao: string;
  unidade: string;
  preco_unitario: number;
  origem: string;
  classe: string;
  tipo: 'composicao' | 'insumo' | 'servico';
  data_referencia: string;
  estado?: string;
}

export interface SinapiSearchParams {
  termo?: string;
  codigo?: string;
  classe?: string;
  tipo?: 'composicao' | 'insumo' | 'servico';
  estado?: string;
  limit?: number;
  offset?: number;
}

export interface SinapiSearchResponse {
  items: SinapiItem[];
  total: number;
  hasMore: boolean;
}

// Tipos para IA APIs
export interface AIAnalysisRequest {
  content: string;
  context?: string;
  type: 'planta' | 'orcamento' | 'contrato' | 'despesa' | 'chat';
  metadata?: Record<string, unknown>;
}

export interface AIAnalysisResponse {
  analysis: string;
  confidence: number;
  suggestions?: string[];
  data?: Record<string, unknown>;
  processing_time?: number;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    obra_id?: string;
    context_type?: string;
    confidence?: number;
  };
}

export interface AIChatResponse {
  message: string;
  suggestions?: string[];
  context?: string;
  actions?: Array<{
    type: string;
    label: string;
    data: Record<string, unknown>;
  }>;
}

// Tipos para Edge Functions
export interface EdgeFunctionRequest<T = Record<string, unknown>> {
  body: T;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface EdgeFunctionResponse<T = unknown> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

// Tipos para Webhooks
export interface WebhookPayload<T = Record<string, unknown>> {
  event: string;
  data: T;
  timestamp: string;
  source: string;
  version: string;
}

export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
  type: string;
}

// Tipos para upload de arquivos
export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}

export interface FileUploadResponse {
  path: string;
  fullPath: string;
  publicUrl?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path: string;
  url?: string;
}

// Tipos para busca e filtros
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not_in';
  value: unknown;
}

// Tipos para relatórios
export interface ReportParams {
  type: 'obras' | 'despesas' | 'contratos' | 'fornecedores';
  filters?: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'json';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ReportResponse {
  fileUrl: string;
  fileName: string;
  generatedAt: string;
  metadata: {
    totalRecords: number;
    filters: Record<string, unknown>;
  };
}

// Tipos para conversão de orçamento para despesas
export interface ConversaoOrcamentoDespesa {
  id: string;
  orcamento_id: string;
  obra_id: string;
  usuario_id: string;
  tenant_id: string;
  status: 'PROCESSANDO' | 'CONCLUIDA' | 'ERRO';
  configuracao_mapeamento: Record<string, unknown>;
  valor_total_orcamento: number;
  total_itens_orcamento?: number;
  total_despesas_criadas?: number;
  valor_total_despesas?: number;
  erros_processamento?: Array<{
    item_id: string;
    erro: string;
    item_descricao: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ConversaoOrcamentoDespesaResult {
  conversao_id: string;
  despesas_criadas: number;
  total_itens: number;
  valor_total: number;
  erros: Array<{
    item_id: string;
    erro: string;
    item_descricao: string;
  }>;
}

// Tipos para templates de contrato
export interface Template {
  id: string;
  nome: string;
  descricao?: string;
  escopo: 'contrato' | 'documento';
  tags?: string[];
}

// Tipos para orçamentos
export interface Orcamento {
  id: string;
  nome: string;
  obra_id: string;
  valor_total: number;
  status: 'em_elaboracao' | 'aprovado' | 'reprovado';
  data_criacao: string;
}