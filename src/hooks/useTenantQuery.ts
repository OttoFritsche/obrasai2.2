import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useTenantValidation } from './useTenantValidation';

/**
 * Hook genérico para queries que dependem de tenantId
 * Elimina duplicação de lógica de validação de tenant em queries
 */

export interface UseTenantQueryOptions<TData, TError = Error> 
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'enabled'> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: (tenantId: string) => Promise<TData>;
  enabled?: boolean;
}

export function useTenantQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  enabled = true,
  ...options
}: UseTenantQueryOptions<TData, TError>) {
  const { validTenantId } = useTenantValidation();

  return useQuery({
    queryKey: [...queryKey, validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return queryFn(validTenantId);
    },
    enabled: enabled && !!validTenantId,
    ...options,
  });
}

/**
 * Hook específico para queries de listagem com tenant
 */
export function useTenantListQuery<TData, TError = Error>({
  resource,
  queryFn,
  enabled = true,
  ...options
}: {
  resource: string;
  queryFn: (tenantId: string) => Promise<TData>;
  enabled?: boolean;
} & Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'enabled'>) {
  return useTenantQuery({
    queryKey: [resource],
    queryFn,
    enabled,
    ...options,
  });
}

/**
 * Hook específico para queries de detalhes com tenant
 */
export function useTenantDetailQuery<TData, TError = Error>({
  resource,
  id,
  queryFn,
  enabled = true,
  ...options
}: {
  resource: string;
  id: string | number | null | undefined;
  queryFn: (id: string | number, tenantId: string) => Promise<TData>;
  enabled?: boolean;
} & Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'enabled'>) {
  const { validTenantId } = useTenantValidation();

  return useQuery({
    queryKey: [resource, id, validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      if (!id) {
        throw new Error('ID não fornecido');
      }
      return queryFn(id, validTenantId);
    },
    enabled: enabled && !!validTenantId && !!id,
    ...options,
  });
}