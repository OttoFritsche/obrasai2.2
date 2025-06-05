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

/**
 * Limpa todos os dados de autenticação corrompidos do localStorage
 * e força uma nova inicialização da sessão
 */
export const clearCorruptedAuthData = async (): Promise<void> => {
  try {
    console.log('🧹 Limpando dados de autenticação corrompidos...');
    
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
    allKeys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Dados de autenticação limpos com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados de autenticação:', error);
  }
};

/**
 * Verifica se há tokens de refresh corrompidos e os limpa
 */
export const checkAndCleanRefreshToken = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('🔍 Token de refresh corrompido detectado:', error.message);
      await clearCorruptedAuthData();
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error('❌ Erro ao verificar token de refresh:', error);
    await clearCorruptedAuthData();
    return false;
  }
};

/**
 * Debug da sessão de autenticação atual
 */
export const debugAuthSession = async (): Promise<void> => {
  try {
    console.group('🔍 Debug de Autenticação');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('Session Error:', error);
    console.log('Session Data:', session);
    console.log('User:', session?.user);
    console.log('Access Token:', session?.access_token ? 'Presente' : 'Ausente');
    console.log('Refresh Token:', session?.refresh_token ? 'Presente' : 'Ausente');
    console.log('Expires At:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
    
    // Verificar localStorage
    const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.startsWith('sb-'));
    console.log('Auth Keys no localStorage:', authKeys);
    
    console.groupEnd();
  } catch (error) {
    console.error('❌ Erro no debug de autenticação:', error);
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