import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useEffect, useRef,useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { checkAndCleanRefreshToken, clearCorruptedAuthData, initAuthIntegrityCheck } from "@/lib/auth-utils";
import { secureLogger } from "@/lib/secure-logger";

import type { AuthContextType,Subscription, UserWithProfile } from "./types";
import { clearProfileCache,fetchUserProfile, fetchUserSubscription } from "./utils";

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const loadingRef = useRef(false);

  // ✅ Função para carregar dados do usuário com tratamento de erro e timeout de segurança
  const loadUserData = useCallback(async (userId: string, authUser: User) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    // ✅ Timeout de segurança para garantir que loading seja sempre resolvido
    const safetyTimeout = setTimeout(() => {
      secureLogger.warn('loadUserData timeout - forçando loading = false');
      setLoading(false);
      loadingRef.current = false;
    }, 5000);

    try {
      const userProfile = await fetchUserProfile(userId, authUser);
      setUser(userProfile);
      
      // ✅ Definir loading como false após carregar dados com sucesso
      setLoading(false);
      clearTimeout(safetyTimeout);
    } catch (_error) {
      console.error('Error loading user profile:', error);
      // ✅ Em caso de erro ao carregar o perfil, defina o usuário como nulo e loading como false.
      // A sessão de autenticação do Supabase permanece válida.
      setUser(null);
      setLoading(false);
      clearTimeout(safetyTimeout);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // ✅ Inicializar verificação de integridade na montagem do componente
  useEffect(() => {
    initAuthIntegrityCheck();
  }, []);

  useEffect(() => {
    let isInitialized = false;
    
    // Listen for auth state changes FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // ✅ Log todos os eventos para debug
        secureLogger.debug('onAuthStateChange', { event, hasSession: !!session });
        
        // ✅ Lidar com refresh token inválido/expirado
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          if (import.meta.env.DEV && event === 'TOKEN_REFRESHED' && !session) {
            secureLogger.warn('Token refresh failed');
          }
          
          // ✅ Para SIGNED_OUT, limpar dados e redirecionar
          if (event === 'SIGNED_OUT') {
            secureLogger.info("SIGNED_OUT event detectado - processando logout");
            await clearCorruptedAuthData();
            clearProfileCache();
            setUser(null);
            setSession(null);
            setSubscription(null);
            setLoading(false);
            
            // ✅ Redirecionar imediatamente para login após logout bem-sucedido
            secureLogger.info("Redirecionamento SIGNED_OUT para /login");
            navigate('/login', { replace: true });
          } else {
            // TOKEN_REFRESHED failed
            await clearCorruptedAuthData();
            setUser(null);
            setSession(null);
            setSubscription(null);
            setLoading(false);
          }
          
          return; // Early return for these cases
        }

        setSession(session);

        if (session?.user) {
          // Only load user data if it's a relevant event and initialization has occurred,
          // or if it's the initial load.
          if (((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && isInitialized) || !isInitialized) {
            // Use setTimeout to prevent potential deadlocks with Supabase client
            // setLoading(true) will be handled by loadUserData or initializeAuth
            setTimeout(() => {
              loadUserData(session.user.id, session.user);
            }, 0);
          } else {
            // If initialized and not a specific event, ensure loading is false
            setLoading(false);
          }
        } else {
          // No session/user, ensure loading is false
          setUser(null); // Clear user if no session
          setSubscription(null); // Clear subscription if no session
          setLoading(false);
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        // ✅ Verificar integridade do token antes de tentar obter a sessão
        const hasValidToken = await checkAndCleanRefreshToken();
        
        if (!hasValidToken) {
          setUser(null);
          setSession(null);
          setSubscription(null);
          setLoading(false);
          return;
        }

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Auth session error:', error.message);
          await clearCorruptedAuthData();
          setUser(null);
          setSession(null);
          setSubscription(null);
          setLoading(false);
          isInitialized = true; // Mark as initialized even on error to prevent loops
          return;
        }

        setSession(currentSession);

        if (currentSession?.user) {
          // setLoading(true) is implicitly handled by the flow leading to loadUserData
          await loadUserData(currentSession.user.id, currentSession.user);
          // loadUserData will set loading to false
        } else {
          setUser(null);
          setSubscription(null); // Clear subscription if no user
          setLoading(false); // Ensure loading is false if no user
        }
        
        isInitialized = true;
      } catch (_error) {
        console.error('Error initializing auth:', error);
        await clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setSubscription(null);
        setLoading(false); // Ensure loading is false on catch
      } finally {
        // ✅ Timeout de segurança global para garantir que loading seja sempre resolvido
        setTimeout(() => {
          if (loadingRef.current === false) {
            setLoading(false);
          }
        }, 1000);
      }
    };

    initializeAuth();
    
    // Correct cleanup: Use the subscription from the data object
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // ✅ Sem dependências para evitar re-execução

  // Login with email and password
  const login = async (email: string, password: string) => {
    // 1. Log da tentativa
    secureLogger.info("Login attempt", { email: `exists: ${!!email}` });
    
    try {
      setLoading(true);
      
      // ✅ Timeout de segurança para o login
      const loginTimeout = setTimeout(() => {
        setLoading(false);
      }, 10000);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      clearTimeout(loginTimeout);
      
      if (error) {
        secureLogger.error("Login failed", error, { email: `exists: ${!!email}` });
        toast.error(error.message);
        setLoading(false);
        return { error };
      }

      // 2. Log de sucesso
      if (data.user) {
        secureLogger.info("Login successful", { userId: data.user.id });
      }
      
      // ✅ Não definir loading = false aqui pois o onAuthStateChange vai gerenciar
      return {};
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      secureLogger.error("Login exception", error, { email: `exists: ${!!email}` });
      toast.error(error.message);
      setLoading(false);
      return { error };
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    // 1. Log da tentativa de login com Google
    secureLogger.info("Google login attempt started");

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false); // ✅ Só define loading como false em caso de erro
        return { error };
      }
      
      // ✅ Não definir loading como false aqui - deixar o onAuthStateChange gerenciar
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login with Google";
      secureLogger.error("Google login failed", error);
      toast.error(errorMessage);
      setLoading(false); // ✅ Só define loading como false em caso de erro
      return { error };
    }
  };

  // Register new user
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // 1. Log da tentativa de registro
    secureLogger.info("Registration attempt", { email: `exists: ${!!email}` });

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          // ✅ Redirecionar para login após confirmação de email
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        secureLogger.error("Registration failed", error, { email: `exists: ${!!email}` });
        toast.error(error.message);
        return { error };
      }

      // 2. Log de sucesso
      if (data.user) {
        secureLogger.info("Registration successful", { userId: data.user.id });
      }
      
      // ✅ Fazer logout automático para garantir que o usuário vá para login
      // Isso funciona tanto em desenvolvimento (auto-confirm) quanto em produção
      await supabase.auth.signOut();
      
      // ✅ Limpar estado local
      setUser(null);
      setSession(null);
      setSubscription(null);
      
      toast.success("Registration successful! Please check your email to verify your account.");
      return {};
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      secureLogger.error("Registration exception", error, { 
        email: `exists: ${!!email}`, 
        hasFirstName: !!firstName, 
        hasLastName: !!lastName 
      });
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Função de logout forçado e direto
  const forceLogout = () => {
    secureLogger.info("Logout forçado iniciado");
    
    try {
      // 1. Limpar localStorage imediatamente
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 2. Limpar estados locais
      clearProfileCache();
      setUser(null);
      setSession(null);
      setSubscription(null);
      setLoading(false);
      
      // 3. Redirecionar imediatamente
      secureLogger.info("Logout forçado - redirecionando");
      window.location.href = '/login';
      
    } catch (_error) {
      secureLogger.error("Erro no logout forçado", _error);
      window.location.href = '/login'; // Fallback
    }
  };

  // Logout otimizado - usa forceLogout que já funciona
  const logout = async () => {
    try {
      secureLogger.info("Logout iniciado");
      
      // ✅ Fazer signOut do Supabase em background
      supabase.auth.signOut().catch(error => {
        secureLogger.error("Supabase signOut falhou", error);
      });
      
      // ✅ Usar forceLogout imediatamente (já testado e funcionando)
      setTimeout(() => {
        forceLogout();
      }, 100);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to logout";
      secureLogger.error("Logout failed", error);
      
      // ✅ Fallback sempre usar forceLogout
      forceLogout();
    }
  };

  // Check subscription status
  const checkSubscription = async () => {
    try {
      if (!user) return;
      
      const userSubscription = await fetchUserSubscription(user.id);
      if (userSubscription) {
        setSubscription(userSubscription);
      }
    } catch (_error) {
      secureLogger.error("Failed to check subscription", _error, { userId: user?.id });
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    secureLogger.info("Password reset requested", { email: `exists: ${!!email}` });
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        secureLogger.error("Password reset failed", error, { email: `exists: ${!!email}` });
        toast.error(error.message);
        return { error };
      }

      secureLogger.info("Password reset email sent successfully", { email: `exists: ${!!email}` });
      toast.success("Link de redefinição de senha enviado para seu email!");
      return {};
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      secureLogger.error("Password reset exception", error, { email: `exists: ${!!email}` });
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password (with token)
  const resetPassword = async (password: string) => {
    secureLogger.info("Password reset attempt");
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        secureLogger.error("Password reset update failed", error);
        toast.error(error.message);
        return { error };
      }

      secureLogger.info("Password reset successful");
      toast.success("Senha redefinida com sucesso!");
      navigate('/login');
      return {};
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      secureLogger.error("Password reset update exception", error);
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    login,
    loginWithGoogle,
    register,
    logout,
    checkSubscription,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
