import { supabase } from "@/integrations/supabase/client";
import { UserWithProfile } from "./types";

// Cache simples para dados de perfil - usando unknown ao invés de any
const profileCache = new Map<string, unknown>();

// Função para limpar cache quando necessário
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
};

// Fetch user profile data with RLS recursion handling
export const fetchUserProfile = async (userId: string, currentUser: UserWithProfile | null) => {
  // Verificar cache primeiro
  if (profileCache.has(userId)) {
    const cachedProfile = profileCache.get(userId);
    return { ...currentUser, profile: cachedProfile };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  if (data) {
    // ✅ Garantir que tenant_id seja sempre uma string válida ou null
    const cleanProfile = {
      ...data,
      tenant_id: validateTenantId(data.tenant_id)
    };

    // Cache do perfil limpo
    profileCache.set(userId, cleanProfile);
    
    return { 
      ...currentUser, 
      profile: cleanProfile 
    };
  }

  return currentUser;
};

// Função auxiliar para validar tenant_id - usando unknown ao invés de any
export const validateTenantId = (tenantId: unknown): string | null => {
  // Se for null ou undefined, retorna null
  if (!tenantId) return null;
  
  // Se for string válida, retorna limpa
  if (typeof tenantId === 'string' && tenantId.trim().length > 0) {
    return tenantId.trim();
  }
  
  // Se for objeto, tenta converter para string se tiver propriedades válidas
  if (typeof tenantId === 'object' && tenantId !== null) {
    // Se for um objeto com id, usa o id
    if (tenantId.id && typeof tenantId.id === 'string') {
      return tenantId.id.trim();
    }
    
    // Se for um objeto que pode ser serializado para UUID
    const str = tenantId.toString();
    if (str !== '[object Object]' && str.length > 0) {
      return str.trim();
    }
  }
  
  // Se for qualquer outro tipo, tenta converter para string
  if (tenantId.toString && typeof tenantId.toString === 'function') {
    const str = tenantId.toString();
    if (str !== '[object Object]' && str.length > 0) {
      return str.trim();
    }
  }
  
  // Se nada funcionar, retorna null
  console.warn('❌ tenant_id inválido:', tenantId);
  return null;
};

// Fetch user subscription data
export const fetchUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (error) {
      // Se a tabela não existir ou não tiver políticas RLS configuradas
      if (error.code === 'PGRST301' || error.code === '42P01') {
        return null;
      }
      
      throw error;
    }

    // Retornar o primeiro item se existir
    const subscription = data?.[0] || null;
    
    return subscription;
  } catch (error) {
    return null;
  }
};

