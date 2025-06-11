import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserWithProfile, Subscription, AuthContextType } from "./types";
import { fetchUserProfile, fetchUserSubscription, clearProfileCache } from "./utils";
import { secureLogger } from "@/lib/secure-logger";
import { clearCorruptedAuthData, checkAndCleanRefreshToken, initAuthIntegrityCheck } from "@/lib/auth-utils";

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

  // ✅ Função para carregar dados do usuário com tratamento de erro
  const loadUserData = useCallback(async (userId: string, authUser: User) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const userProfile = await fetchUserProfile(userId, authUser);
      setUser(userProfile);
      
      // ✅ Definir loading como false após carregar dados com sucesso
      setLoading(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // ✅ Em caso de erro ao carregar o perfil, defina o usuário como nulo e loading como false.
      // A sessão de autenticação do Supabase permanece válida.
      setUser(null);
      setLoading(false);
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
        // ✅ Log apenas eventos importantes em desenvolvimento (removido para reduzir ruído no console)
        // const isDev = import.meta.env.DEV;
        // if (isDev && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
        //   console.log('🔄 Auth:', event);
        // }
        
        // ✅ Lidar com refresh token inválido/expirado
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          if (import.meta.env.DEV && event === 'TOKEN_REFRESHED' && !session) {
            console.log('🔄 Token refresh failed');
          }
          await clearCorruptedAuthData();
          setUser(null);
          setSession(null);
          setSubscription(null);
          setLoading(false); // Ensure loading is false on sign out or refresh failure
          if (event === 'SIGNED_OUT') clearProfileCache();
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
      } catch (error) {
        console.error('Error initializing auth:', error);
        await clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setSubscription(null);
        setLoading(false); // Ensure loading is false on catch
      } finally {
        // setLoading(false) is called in most paths, but ensure it's false if not already.
        // However, if loadUserData is running, it will manage setLoading.
        // This final setLoading(false) might be redundant if loadUserData always completes.
        if (loadingRef.current === false) { // Only set if not already being handled by loadUserData
            setLoading(false);
        }
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
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        setLoading(false); // ✅ Só define loading como false em caso de erro
        return { error };
      }
      
      // ✅ Login bem-sucedido - o onAuthStateChange vai gerenciar o loading.
      // O estado de loading será definido como false por loadUserData.
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      secureLogger.error("Login failed", error, { hasEmail: !!email });
      toast.error(errorMessage);
      setLoading(false); // ✅ Só define loading como false em caso de erro
      return { error };
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = async () => {
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
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
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
        toast.error(error.message);
        return { error };
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register";
      secureLogger.error("Registration failed", error, { 
        hasEmail: !!email, 
        hasFirstName: !!firstName, 
        hasLastName: !!lastName 
      });
      toast.error(errorMessage);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // ✅ Limpar cache e estado local
      clearProfileCache();
      setUser(null);
      setSession(null);
      setSubscription(null);
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to logout";
      secureLogger.error("Logout failed", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
    } catch (error) {
      secureLogger.error("Failed to check subscription", error, { userId: user?.id });
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
    checkSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
