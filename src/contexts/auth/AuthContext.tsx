import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
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
  const loadUserData = useCallback(async (userId: string, authUser: any) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const userProfile = await fetchUserProfile(userId, authUser);
      if (userProfile) {
        setUser(userProfile);
        // ✅ Carregar subscription em paralelo
        const userSubscription = await fetchUserSubscription(userId);
        if (userSubscription) {
          setSubscription(userSubscription);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // ✅ Se houver erro ao carregar dados, pode ser token corrompido
      if (error instanceof Error && error.message.includes('JWT')) {
        console.log('🔄 Token JWT corrompido detectado, limpando dados...');
        await clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setSubscription(null);
      }
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
        // ✅ Log apenas eventos importantes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🔄 Auth:', event);
        }
        
        // ✅ Lidar com refresh token inválido/expirado
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Se for TOKEN_REFRESHED mas sem session, significa que o refresh falhou
          if (event === 'TOKEN_REFRESHED' && !session) {
            console.log('🔄 Token refresh failed, clearing session');
            await clearCorruptedAuthData();
            setUser(null);
            setSession(null);
            setSubscription(null);
            return;
          }
        }
        
        setSession(session);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setSubscription(null);
          clearProfileCache();
        } else if (session?.user) {
          // ✅ Só carrega dados do perfil se for um evento específico e já inicializou
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && isInitialized) {
            // Use setTimeout to prevent potential deadlocks with Supabase client
            setTimeout(() => {
              loadUserData(session.user.id, session.user);
            }, 0);
          } else if (!isInitialized) {
            // ✅ Durante a inicialização, carregar dados será feito no initializeAuth
            // Log removido para console limpo
          }
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
        
        // ✅ Se houver erro na obtenção da sessão (ex: refresh token inválido)
        if (error) {
          console.warn('Auth session error:', error.message);
          await clearCorruptedAuthData();
          setUser(null);
          setSession(null);
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // ✅ Carregar perfil sem log verboso
          await loadUserData(currentSession.user.id, currentSession.user);
        } else {
          setUser(null);
        }
        
        isInitialized = true; // ✅ Marca como inicializado para evitar double loading
      } catch (error) {
        console.error('Error initializing auth:', error);
        // ✅ Em caso de erro na inicialização, limpar tudo
        await clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setSubscription(null);
      } finally {
        setLoading(false);
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
        return { error };
      }
      
      navigate('/dashboard');
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      secureLogger.error("Login failed", error, { hasEmail: !!email });
      toast.error(errorMessage);
      return { error };
    } finally {
      setLoading(false);
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
        return { error };
      }
      
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login with Google";
      secureLogger.error("Google login failed", error);
      toast.error(errorMessage);
      return { error };
    } finally {
      setLoading(false);
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
