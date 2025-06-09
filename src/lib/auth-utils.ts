/**
 * 🔐 Utilitários de Autenticação - Auth Utils
 * 
 * Funções auxiliares para gerenciar estado de autenticação,
 * limpeza de tokens corrompidos e debugging de problemas de auth.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from './secure-logger';

/**
 * Limpa todos os dados de autenticação corrompidos do localStorage
 * e força uma nova inicialização da sessão
 */
const logger = secureLogger;

export const clearCorruptedAuthData = async (): Promise<void> => {
  try {
    logger.info('Iniciando limpeza de dados de autenticação corrompidos');
    
    // 1. Fazer signOut silencioso para limpar tokens no servidor
    await supabase.auth.signOut({ scope: 'local' });
    
    // 2. Limpar itens específicos do Supabase no localStorage
    const keysToRemove = [
      'supabase.auth.token',
      'sb-' + (import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'supabase') + '-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // 3. Limpar todos os itens que começam com 'sb-'
    const allKeys = Object.keys(localStorage);
    const removedCount = allKeys.filter(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    }).length;
    
    logger.info('Dados de autenticação limpos com sucesso', { removedKeysCount: removedCount });
    
  } catch (error) {
    logger.error('Erro ao limpar dados de autenticação', error);
  }
};

/**
 * Verifica se há tokens de refresh corrompidos e os limpa
 */
export const checkAndCleanRefreshToken = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.info('Token de refresh corrompido detectado - iniciando limpeza');
      await clearCorruptedAuthData();
      return false;
    }
    
    return !!session;
  } catch (error) {
    logger.error('Erro ao verificar token de refresh - iniciando limpeza', error);
    await clearCorruptedAuthData();
    return false;
  }
};

/**
 * Debug da sessão de autenticação atual (modo seguro)
 */
export const debugAuthSession = async (): Promise<void> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.startsWith('sb-'));
    
    const debugInfo = {
      hasError: !!error,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      hasUserEmail: !!session?.user?.email,
      hasAccessToken: !!session?.access_token,
      hasRefreshToken: !!session?.refresh_token,
      hasExpiresAt: !!session?.expires_at,
      authKeysCount: authKeys.length
    };
    
    logger.info('Debug de sessão de autenticação', debugInfo);
    
  } catch (error) {
    logger.error('Erro no debug de autenticação', error);
  }
};

/**
 * Inicializa verificação de integridade da autenticação
 */
export const initAuthIntegrityCheck = (): void => {
  // Verificar integridade na inicialização
  setTimeout(() => {
    checkAndCleanRefreshToken();
  }, 1000);
  
  // Verificar periodicamente (a cada 5 minutos)
  setInterval(() => {
    checkAndCleanRefreshToken();
  }, 5 * 60 * 1000);
};