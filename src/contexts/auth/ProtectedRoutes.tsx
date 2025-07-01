import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks";

// Protected route wrapper with error boundary
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [redirectTimeout, setRedirectTimeout] = React.useState<NodeJS.Timeout | null>(null);

  // ✅ Sempre chamar hooks no topo do componente
  let user = null;
  let loading = true;
  let session = null;
  let hasAuthError = false;

  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
    session = authContext.session;
  } catch (error) {
    console.error('⚠️ Auth context not available:', error);
    hasAuthError = true;
  }

  // ✅ useEffect sempre chamado, independente da condição
  useEffect(() => {
    if (hasAuthError) {
      navigate('/login');
    }
  }, [hasAuthError, navigate]);

  // ✅ Redirecionamento robusto com timeout de segurança
  useEffect(() => {
    // Limpar timeout anterior
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // Se não há sessão ativa, redirecionar imediatamente
    if (!session && !loading) {
      console.log('🔒 ProtectedRoute: Sem sessão, redirecionando para login');
      navigate('/login', { replace: true });
      return;
    }

    // Se não há usuário mas loading está false, redirecionar
    if (!loading && !user) {
      console.log('🔒 ProtectedRoute: Sem usuário, redirecionando para login');
      navigate('/login', { replace: true });
      return;
    }

    // Timeout de segurança: se loading ficar stuck por mais de 10 segundos
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log('⚠️ ProtectedRoute: Loading timeout - forçando redirecionamento');
        if (!user || !session) {
          navigate('/login', { replace: true });
        }
      }, 10000);
      
      setRedirectTimeout(timeoutId);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, session, navigate, redirectTimeout]);

  // ✅ Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [redirectTimeout]);

  if (hasAuthError) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

// Admin route wrapper with error boundary
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Sempre chamar hooks no topo do componente
  let user = null;
  let loading = true;
  let hasAuthError = false;

  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.error('⚠️ Auth context not available in AdminRoute:', error);
    hasAuthError = true;
  }

  // ✅ useEffect sempre chamado, independente da condição
  useEffect(() => {
    if (hasAuthError) {
      navigate('/login');
    }
  }, [hasAuthError, navigate]);

  useEffect(() => {
    if (!loading && (!user || user.profile?.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (hasAuthError) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return user && user.profile?.role === 'admin' ? <>{children}</> : null;
};
