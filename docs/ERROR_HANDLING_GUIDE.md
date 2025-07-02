# Guia de Tratamento de Erros - ObrasAI

## Visão Geral

Este guia documenta o sistema de tratamento de erros implementado no ObrasAI, fornecendo uma abordagem centralizada e consistente para capturar, logar e exibir erros na aplicação.

## Componentes do Sistema

### 1. ErrorBoundary

Componente React que captura erros JavaScript não tratados na árvore de componentes.

```tsx
import { ErrorBoundary } from '@/components/error';

// Uso básico
<ErrorBoundary>
  <MeuComponente />
</ErrorBoundary>

// Com fallback customizado
<ErrorBoundary fallback={MeuComponenteDeErro}>
  <MeuComponente />
</ErrorBoundary>

// Com callback de erro
<ErrorBoundary onError={(error, errorInfo) => {
  // Lógica personalizada para tratar o erro
  console.log('Erro capturado:', error);
}}>
  <MeuComponente />
</ErrorBoundary>
```

### 2. useErrorHandler Hook

Hook personalizado para tratamento centralizado de erros.

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MeuComponente = () => {
  const { 
    handleError, 
    handleApiError, 
    handleValidationError, 
    handleAuthError,
    wrapAsync,
    reportCriticalError 
  } = useErrorHandler();

  // Tratamento de erro genérico
  const handleGenericError = () => {
    try {
      // código que pode falhar
    } catch (error) {
      handleError(error, 'MeuComponente.handleGenericError');
    }
  };

  // Tratamento de erro de API
  const fetchData = async () => {
    try {
      const response = await api.getData();
    } catch (error) {
      handleApiError(error, 'fetchData');
    }
  };

  // Wrapper automático para funções assíncronas
  const safeFetchData = wrapAsync(async () => {
    const response = await api.getData();
    return response;
  }, 'MeuComponente.safeFetchData');

  return (
    <div>
      <button onClick={safeFetchData}>Buscar Dados</button>
    </div>
  );
};
```

### 3. ErrorFallback Components

Componentes para exibir interfaces amigáveis quando ocorrem erros.

```tsx
import { ErrorFallback, SimpleErrorFallback } from '@/components/error';

// Fallback completo
<ErrorFallback 
  error={error}
  resetError={() => window.location.reload()}
  errorInfo={errorInfo}
/>

// Fallback simples
<SimpleErrorFallback 
  message="Erro ao carregar dados"
  onRetry={() => refetch()}
/>
```

### 4. withErrorBoundary HOC

Higher-Order Component para envolver componentes com ErrorBoundary.

```tsx
import { withErrorBoundary } from '@/components/error';

const MeuComponente = () => {
  return <div>Meu conteúdo</div>;
};

// Envolver com ErrorBoundary
export default withErrorBoundary(MeuComponente);

// Com fallback customizado
export default withErrorBoundary(MeuComponente, MeuFallbackCustomizado);
```

## Padrões de Implementação

### 1. Tratamento em Componentes de UI

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { SimpleErrorFallback } from '@/components/error';

const ListaObras = () => {
  const { handleApiError, wrapAsync } = useErrorHandler();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchObras = wrapAsync(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('obras')
        .select('*');
      
      if (fetchError) throw fetchError;
      
      setObras(data || []);
    } catch (err) {
      setError(err.message);
      handleApiError(err, 'ListaObras.fetchObras');
    } finally {
      setLoading(false);
    }
  }, 'ListaObras.fetchObras');

  useEffect(() => {
    fetchObras();
  }, []);

  if (error) {
    return (
      <SimpleErrorFallback 
        message="Erro ao carregar obras"
        onRetry={fetchObras}
      />
    );
  }

  return (
    <div>
      {/* Renderizar lista de obras */}
    </div>
  );
};
```

### 2. Tratamento em Hooks Personalizados

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useObras = () => {
  const { handleApiError, wrapAsync } = useErrorHandler();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchObras = wrapAsync(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('obras')
      .select('*');
    
    if (error) {
      handleApiError(error, 'useObras.fetchObras');
      throw error;
    }
    
    setObras(data || []);
    setLoading(false);
    return data;
  }, 'useObras.fetchObras');

  return {
    obras,
    loading,
    fetchObras
  };
};
```

### 3. Tratamento em Contextos

```tsx
import { ErrorBoundary } from '@/components/error';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MeuContextProvider = ({ children }) => {
  const { handleApiError, wrapAsync } = useErrorHandler();
  
  const fetchData = wrapAsync(async () => {
    // lógica de busca de dados
  }, 'MeuContextProvider.fetchData');

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Erro no MeuContextProvider:', error);
      }}
    >
      <MeuContext.Provider value={value}>
        {children}
      </MeuContext.Provider>
    </ErrorBoundary>
  );
};
```

## Tipos de Erro e Tratamento

### 1. Erros de API

```tsx
const { handleApiError } = useErrorHandler();

try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  handleApiError(error, 'fetchApiData');
}
```

### 2. Erros de Validação

```tsx
const { handleValidationError } = useErrorHandler();

const validateForm = (data) => {
  if (!data.email) {
    handleValidationError(
      new Error('Email é obrigatório'), 
      'email'
    );
    return false;
  }
  return true;
};
```

### 3. Erros de Autenticação

```tsx
const { handleAuthError } = useErrorHandler();

try {
  const { error } = await supabase.auth.signIn({ email, password });
  if (error) throw error;
} catch (error) {
  handleAuthError(error);
}
```

### 4. Erros Críticos

```tsx
const { reportCriticalError } = useErrorHandler();

try {
  // operação crítica
} catch (error) {
  reportCriticalError(error, {
    operation: 'critical-operation',
    userId: user.id,
    timestamp: new Date().toISOString()
  });
}
```

## Configuração de Logging

O sistema utiliza o `secureLogger` para registrar erros de forma segura:

```tsx
import { secureLogger } from '@/lib/secure-logger';

// Log automático através do useErrorHandler
const { handleError } = useErrorHandler();
handleError(error); // Automaticamente loga o erro

// Log manual
secureLogger.error('Descrição do erro', {
  error: error.message,
  context: 'contexto-adicional',
  timestamp: new Date().toISOString()
});
```

## Boas Práticas

### 1. Sempre Use ErrorBoundary em Rotas Principais

```tsx
// App.tsx ou layout principal
<ErrorBoundary>
  <Router>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* outras rotas */}
    </Routes>
  </Router>
</ErrorBoundary>
```

### 2. Trate Erros Específicos Adequadamente

```tsx
// ❌ Não faça
try {
  await api.call();
} catch (error) {
  console.log(error); // Log inadequado
}

// ✅ Faça
try {
  await api.call();
} catch (error) {
  handleApiError(error, 'specificOperation');
}
```

### 3. Forneça Feedback Adequado ao Usuário

```tsx
// ❌ Não faça
if (error) {
  return <div>Erro</div>;
}

// ✅ Faça
if (error) {
  return (
    <SimpleErrorFallback 
      message="Erro ao carregar dados. Tente novamente."
      onRetry={refetch}
    />
  );
}
```

### 4. Use wrapAsync para Funções Assíncronas

```tsx
// ❌ Não faça
const handleSubmit = async () => {
  try {
    await submitForm();
  } catch (error) {
    handleError(error);
  }
};

// ✅ Faça
const handleSubmit = wrapAsync(async () => {
  await submitForm();
}, 'FormComponent.handleSubmit');
```

## Monitoramento e Debugging

### Ambiente de Desenvolvimento

- Erros são exibidos com detalhes técnicos completos
- Stack traces são visíveis nos componentes de fallback
- Logs detalhados no console

### Ambiente de Produção

- Mensagens de erro amigáveis para usuários
- Detalhes técnicos ocultos
- Logs seguros enviados para monitoramento

## Integração com Ferramentas Externas

O sistema está preparado para integração com:

- **Sentry**: Para monitoramento de erros em produção
- **LogRocket**: Para replay de sessões com erros
- **DataDog**: Para métricas e alertas

```tsx
// Exemplo de integração com Sentry
import * as Sentry from '@sentry/react';

const { reportCriticalError } = useErrorHandler();

const handleCriticalError = (error) => {
  // Log local
  reportCriticalError(error);
  
  // Enviar para Sentry
  Sentry.captureException(error);
};
```

## Conclusão

O sistema de tratamento de erros do ObrasAI fornece:

- ✅ Tratamento centralizado e consistente
- ✅ Interfaces amigáveis para usuários
- ✅ Logging seguro e detalhado
- ✅ Recuperação graceful de erros
- ✅ Facilidade de manutenção e debugging
- ✅ Preparação para monitoramento em produção

Siga este guia para implementar tratamento de erros robusto em todos os componentes da aplicação.