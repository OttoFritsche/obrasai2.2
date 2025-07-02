/**
 * Arquivo de exportação central para todos os tipos do projeto
 * Facilita importações e mantém organização
 */

// Tipos de formulários
export type * from './forms';

// Tipos de API
export type * from './api';

// Tipos de alertas
export type * from './alerts';

// Tipos do Supabase
export type * from './supabase';

// Convenções de tipos no projeto:
// 1. Use 'interface' para definições de objetos e props de componentes
// 2. Use 'type' para union types, aliases, e transformações de tipos
// 3. Use 'interface' quando precisar de extensibilidade (declaração merging)
// 4. Use 'type' para tipos mais complexos e computados

// Tipos utilitários globais
export type Status = 'pending' | 'completed' | 'error' | 'loading';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ActionType = 'create' | 'read' | 'update' | 'delete';

export type Theme = 'light' | 'dark' | 'system';

// Type guards utilitários
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

// Utility types para padronização
export type WithId<T> = T & { id: string };

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

export type WithUser<T> = T & {
  usuario_id: string;
  tenant_id: string;
};

export type DatabaseEntity<T> = WithId<WithTimestamps<WithUser<T>>>;

export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'usuario_id' | 'tenant_id'>>;

// Tipos para operações assíncronas
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Tipos para configurações
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    aiEnabled: boolean;
    notificationsEnabled: boolean;
    analyticsEnabled: boolean;
  };
  ui: {
    theme: Theme;
    language: string;
    timezone: string;
  };
}

// Tipos para navegação
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  permission?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Tipos para notificações
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// Tipos para métricas e analytics
export interface MetricData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Tipos para filtros genéricos
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface StatusFilter {
  status?: string[];
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para permissões
export type Permission = 
  | 'admin'
  | 'manager'
  | 'user'
  | 'readonly'
  | 'obras:read'
  | 'obras:write'
  | 'obras:delete'
  | 'contratos:read'
  | 'contratos:write'
  | 'despesas:read'
  | 'despesas:write'
  | 'fornecedores:read'
  | 'fornecedores:write'
  | 'alertas:read'
  | 'alertas:configure'
  | 'orcamentos:read'
  | 'orcamentos:write'
  | 'sinapi:read'
  | 'ai:use';

export interface UserPermissions {
  userId: string;
  tenantId: string;
  permissions: Permission[];
  role: 'admin' | 'manager' | 'user' | 'readonly';
}