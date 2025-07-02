import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorBoundary } from '@/components/error';
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['construtoras']['Row'];

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refetchTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Componente interno do TenantProvider com tratamento de erros integrado
 */
const TenantProviderContent = ({ children }: TenantProviderProps) => {
  const { user, session } = useAuth();
  const { handleApiError, wrapAsync } = useErrorHandler();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar tenants do usuário com tratamento de erro integrado
  const fetchTenants = wrapAsync(async () => {
    if (!user?.profile?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // Buscar todas as construtoras que o usuário tem acesso
      const { data, error: fetchError } = await supabase
        .from('construtoras')
        .select('*')
        .eq('tenant_id', user.profile.tenant_id)
        .order('nome_razao_social');

      if (fetchError) {
        throw fetchError;
      }

      setTenants(data || []);
      
      // Se ainda não tem tenant atual selecionado, selecionar o primeiro
      if (!currentTenant && data && data.length > 0) {
        setCurrentTenant(data[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar construtoras';
      setError(errorMessage);
      
      // Usar o handleApiError para tratamento centralizado
      handleApiError(err, 'fetchTenants');
    } finally {
      setLoading(false);
    }
  }, 'TenantProvider.fetchTenants');

  // Alternar tenant com tratamento de erro
  const switchTenant = wrapAsync(async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) {
      throw new Error(`Construtora com ID ${tenantId} não encontrada`);
    }

    setCurrentTenant(tenant);
    
    // Salvar preferência do usuário com tratamento de erro
    try {
      localStorage.setItem('selected-tenant-id', tenantId);
    } catch (err) {
      // Erro não crítico, apenas log
      console.warn('Não foi possível salvar preferência de construtora:', err);
    }
  }, 'TenantProvider.switchTenant');

  // Recarregar tenants com tratamento de erro
  const refetchTenants = wrapAsync(async () => {
    await fetchTenants();
  }, 'TenantProvider.refetchTenants');

  // Função para restaurar tenant do localStorage com tratamento de erro
  const restoreSavedTenant = wrapAsync(async () => {
    if (tenants.length === 0 || currentTenant) return;

    try {
      const savedTenantId = localStorage.getItem('selected-tenant-id');
      if (savedTenantId) {
        const savedTenant = tenants.find(t => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentTenant(savedTenant);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro ao restaurar construtora salva:', err);
    }
    
    // Fallback: selecionar primeiro tenant
    if (tenants.length > 0) {
      setCurrentTenant(tenants[0]);
    }
  }, 'TenantProvider.restoreSavedTenant');

  // Efeito para carregar tenants quando o usuário muda
  useEffect(() => {
    if (user?.profile?.tenant_id) {
      fetchTenants();
    } else {
      setCurrentTenant(null);
      setTenants([]);
      setLoading(false);
      setError(null);
    }
  }, [user?.profile?.tenant_id]);

  // Efeito para restaurar tenant selecionado do localStorage
  useEffect(() => {
    restoreSavedTenant();
  }, [tenants]);

  const value: TenantContextType = {
    currentTenant,
    tenants,
    switchTenant: switchTenant || (async () => {}),
    loading,
    error,
    refetchTenants: refetchTenants || (async () => {}),
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Provider principal com ErrorBoundary integrado
 */
export const TenantProvider = ({ children }: TenantProviderProps) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log específico para erros do TenantProvider
        console.error('Erro crítico no TenantProvider:', {
          error: error.message,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });
      }}
    >
      <TenantProviderContent>{children}</TenantProviderContent>
    </ErrorBoundary>
  );
};

/**
 * Hook para usar o contexto de tenant com tratamento de erro integrado
 */
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
};

/**
 * Hook seguro que não lança erro se usado fora do provider
 * Útil para componentes que podem ou não estar dentro do TenantProvider
 */
export const useTenantSafe = () => {
  const context = useContext(TenantContext);
  return context || {
    currentTenant: null,
    tenants: [],
    switchTenant: async () => {},
    loading: false,
    error: 'TenantProvider não encontrado',
    refetchTenants: async () => {}
  };
};

export default TenantContext;