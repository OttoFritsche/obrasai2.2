/**
 * Exemplo Completo de Integração do Sistema de Tratamento de Erros
 * 
 * Este arquivo demonstra como integrar e usar todos os componentes
 * do sistema de tratamento de erros em um cenário real.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Importações do sistema de tratamento de erros
import {
  ErrorBoundary,
  ErrorFallback,
  useErrorHandler,
  createError,
  formatErrorMessage,
  isRecoverableError,
} from '@/lib/errorSystem';

// Tipos para o exemplo
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

// ============================================================================
// SIMULAÇÃO DE API
// ============================================================================

class ApiService {
  private static users: User[] = [
    { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'admin' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'user' },
  ];

  static async getUsers(): Promise<User[]> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular erro aleatório
    if (Math.random() < 0.3) {
      throw createError.api('Erro interno do servidor', 500);
    }
    
    return this.users;
  }

  static async createUser(data: CreateUserData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validação
    if (!data.email.includes('@')) {
      throw createError.validation('Email inválido', 'email', data.email, 'format');
    }
    
    if (data.password.length < 6) {
      throw createError.validation('Senha deve ter pelo menos 6 caracteres', 'password');
    }
    
    // Verificar duplicata
    if (this.users.some(u => u.email === data.email)) {
      throw createError.api('Email já está em uso', 409, 'DUPLICATE_EMAIL');
    }
    
    // Simular erro de autorização
    if (Math.random() < 0.2) {
      throw createError.auth('Sem permissão para criar usuários', 'FORBIDDEN');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: 'user',
    };
    
    this.users.push(newUser);
    return newUser;
  }

  static async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw createError.api('Usuário não encontrado', 404);
    }
    
    // Simular erro de rede
    if (Math.random() < 0.25) {
      throw createError.network('Falha na conexão', false, true);
    }
    
    this.users.splice(userIndex, 1);
  }
}

// ============================================================================
// COMPONENTE DE LISTA DE USUÁRIOS
// ============================================================================

function UserList() {
  const { handleError, handleApiError, wrapAsync } = useErrorHandler();
  const queryClient = useQueryClient();
  
  // Query para buscar usuários com tratamento de erro integrado
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: wrapAsync(ApiService.getUsers, {
      context: 'fetch-users',
      fallbackMessage: 'Erro ao carregar lista de usuários',
      autoRetry: true,
      maxRetries: 3,
    }),
    retry: (failureCount, error) => {
      // Usar lógica de retry baseada no tipo de erro
      if (!isRecoverableError(error)) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => ApiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error) => {
      handleApiError(error, {
        context: 'delete-user',
        fallbackMessage: 'Erro ao excluir usuário',
        retryable: isRecoverableError(error),
      });
    },
  });
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${userName}?`)) {
      return;
    }
    
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      // Erro já tratado no onError da mutation
      console.log('Erro capturado e tratado:', formatErrorMessage(error));
    }
  };
  
  // Função para forçar erro (para demonstração)
  const triggerError = () => {
    try {
      throw createError.api('Erro simulado para demonstração', 500);
    } catch (error) {
      handleError(error, {
        context: 'demo-error',
        type: 'critical',
        showToast: true,
        recoverable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorFallback
        error={error as Error}
        retry={() => refetch()}
        title="Erro ao carregar usuários"
        message="Não foi possível carregar a lista de usuários."
        actions={[
          {
            label: 'Tentar Novamente',
            onClick: () => refetch(),
            variant: 'default',
          },
          {
            label: 'Recarregar Página',
            onClick: () => window.location.reload(),
            variant: 'outline',
          },
        ]}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Usuários</h2>
        <div className="space-x-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Atualizar
          </button>
          <button
            onClick={triggerError}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Simular Erro
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => handleDeleteUser(user.id, user.name)}
              disabled={deleteUserMutation.isPending}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deleteUserMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE FORMULÁRIO DE USUÁRIO
// ============================================================================

function UserForm() {
  const { handleError, handleApiError, handleValidationError, wrapAsync } = useErrorHandler();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
  });
  
  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: wrapAsync(ApiService.createUser, {
      context: 'create-user',
      fallbackMessage: 'Erro ao criar usuário',
      showToast: false, // Vamos tratar manualmente
    }),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuário ${newUser.name} criado com sucesso!`);
      setFormData({ name: '', email: '', password: '' });
    },
    onError: (error) => {
      // Tratamento específico por tipo de erro
      if (error.name === 'ValidationError') {
        handleValidationError(error, 'create-user-form');
      } else if (error.name === 'AuthError') {
        handleError(error, {
          context: 'create-user-auth',
          type: 'auth',
          showToast: true,
          recoverable: false,
        });
      } else {
        handleApiError(error, {
          context: 'create-user-api',
          fallbackMessage: 'Erro ao criar usuário. Tente novamente.',
          retryable: isRecoverableError(error),
        });
      }
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação local
    if (!formData.name.trim()) {
      handleValidationError(
        createError.validation('Nome é obrigatório', 'name'),
        'user-form'
      );
      return;
    }
    
    if (!formData.email.trim()) {
      handleValidationError(
        createError.validation('Email é obrigatório', 'email'),
        'user-form'
      );
      return;
    }
    
    try {
      await createUserMutation.mutateAsync(formData);
    } catch (error) {
      // Erro já tratado no onError da mutation
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Criar Novo Usuário</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o nome"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o email"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Digite a senha"
        />
      </div>
      
      <button
        type="submit"
        disabled={createUserMutation.isPending}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
      </button>
    </form>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL COM ERROR BOUNDARY
// ============================================================================

function ErrorHandlingExampleContent() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Exemplo de Sistema de Tratamento de Erros
        </h1>
        <p className="text-gray-600">
          Este exemplo demonstra todos os recursos do sistema de tratamento de erros.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ErrorBoundary
            fallback={(error, retry) => (
              <ErrorFallback
                error={error}
                retry={retry}
                title="Erro no Formulário"
                message="Ocorreu um erro no formulário de usuário."
              />
            )}
          >
            <UserForm />
          </ErrorBoundary>
        </div>
        
        <div>
          <ErrorBoundary
            fallback={(error, retry) => (
              <ErrorFallback
                error={error}
                retry={retry}
                title="Erro na Lista"
                message="Ocorreu um erro na lista de usuários."
              />
            )}
          >
            <UserList />
          </ErrorBoundary>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Recursos Demonstrados:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ ErrorBoundary para capturar erros de componentes</li>
          <li>✅ useErrorHandler para tratamento de erros assíncronos</li>
          <li>✅ Integração com React Query</li>
          <li>✅ Diferentes tipos de erro (API, Validação, Auth, Network)</li>
          <li>✅ Retry automático e manual</li>
          <li>✅ Fallback UI amigável</li>
          <li>✅ Toast notifications</li>
          <li>✅ Logging estruturado</li>
          <li>✅ Tratamento de dados sensíveis</li>
          <li>✅ Configuração flexível</li>
        </ul>
      </div>
    </div>
  );
}

// Componente principal com Error Boundary global
export default function ErrorHandlingExample() {
  return (
    <ErrorBoundary
      autoReset={true}
      resetTimeout={10000}
      fallback={(error, retry) => (
        <div className="min-h-screen flex items-center justify-center">
          <ErrorFallback
            error={error}
            retry={retry}
            title="Erro na Aplicação"
            message="Ocorreu um erro inesperado na aplicação."
            actions={[
              {
                label: 'Tentar Novamente',
                onClick: retry,
                variant: 'default',
              },
              {
                label: 'Recarregar Página',
                onClick: () => window.location.reload(),
                variant: 'outline',
              },
              {
                label: 'Ir para Dashboard',
                onClick: () => window.location.href = '/dashboard',
                variant: 'secondary',
              },
            ]}
          />
        </div>
      )}
    >
      <ErrorHandlingExampleContent />
    </ErrorBoundary>
  );
}

// ============================================================================
// EXEMPLO DE USO EM ROTA
// ============================================================================

/*
// Em seu arquivo de rotas (ex: App.tsx ou router)
import ErrorHandlingExample from '@/examples/ErrorHandlingExample';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/error-example" element={<ErrorHandlingExample />} />
        // ... outras rotas
      </Routes>
    </BrowserRouter>
  );
}
*/

// ============================================================================
// EXEMPLO DE CONFIGURAÇÃO PERSONALIZADA
// ============================================================================

/*
// Para usar configuração personalizada, crie um provider
import { ErrorSystemProvider } from '@/lib/errorSystem';

const customConfig = {
  logging: {
    level: 'debug',
    includeStackTrace: true,
  },
  toast: {
    duration: 8000,
    position: 'bottom-right',
  },
};

function AppWithCustomErrorConfig() {
  return (
    <ErrorSystemProvider config={customConfig}>
      <ErrorHandlingExample />
    </ErrorSystemProvider>
  );
}
*/