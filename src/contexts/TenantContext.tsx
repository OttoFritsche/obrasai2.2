import type { ReactNode } from 'react';
import { createContext, useContext, useEffect,useState } from 'react';

import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
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

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { user, session } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar tenants do usuário
  const fetchTenants = async () => {
    if (!user?.profile?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
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
      console.error('Erro ao buscar tenants:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Alternar tenant
  const switchTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      
      // Salvar preferência do usuário (opcional)
      try {
        localStorage.setItem('selected-tenant-id', tenantId);
      } catch (err) {
        console.warn('Não foi possível salvar preferência de tenant:', err);
      }
    }
  };

  // Recarregar tenants
  const refetchTenants = async () => {
    setLoading(true);
    await fetchTenants();
  };

  // Efeito para carregar tenants quando o usuário muda
  useEffect(() => {
    if (user?.profile?.tenant_id) {
      fetchTenants();
    } else {
      setCurrentTenant(null);
      setTenants([]);
      setLoading(false);
    }
  }, [user?.profile?.tenant_id]);

  // Efeito para restaurar tenant selecionado do localStorage
  useEffect(() => {
    if (tenants.length > 0 && !currentTenant) {
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
        console.warn('Erro ao restaurar tenant salvo:', err);
      }
      
      // Fallback: selecionar primeiro tenant
      setCurrentTenant(tenants[0]);
    }
  }, [tenants]);

  const value: TenantContextType = {
    currentTenant,
    tenants,
    switchTenant,
    loading,
    error,
    refetchTenants,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
};

export default TenantContext;