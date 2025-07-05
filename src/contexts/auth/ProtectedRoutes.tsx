import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "./hooks";

// Protected route wrapper with error boundary
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

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
  } catch (_error) {
    console.error('⚠️ Auth context not available:', error);
    hasAuthError = true;
  }

  // ✅ useEffect sempre chamado, independente da condição
  useEffect(() => {
    if (hasAuthError) {
      navigate('/login');
    }
  }, [hasAuthError, navigate]);

  // ✅ Redirecionamento simples e direto (sem loops)
  useEffect(() => {
    // Se não há sessão ativa, redirecionar imediatamente
    if (!session && !loading) {
      navigate('/login', { replace: true });
      return;
    }

    // Se não há usuário mas loading está false, redirecionar
    if (!loading && !user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, loading, session, navigate]);

  // ✅ Timeout de segurança separado para loading stuck
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (!user || !session) {
          window.location.href = '/login';
        }
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, user, session]);

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
  } catch (_error) {
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
