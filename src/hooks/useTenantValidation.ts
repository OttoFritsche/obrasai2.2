import { useAuth } from '@/contexts/auth/hooks';

/**
 * Hook para validação de tenantId
 * Elimina a duplicação da linha: const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
 */
export function useTenantValidation() {
  const { user } = useAuth();
  
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
  
  return {
    tenantId,
    validTenantId,
    isValidTenant: !!validTenantId,
  };
}