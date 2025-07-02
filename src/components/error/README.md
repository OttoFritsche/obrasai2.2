# Sistema de Tratamento de Erros - ObrasAI

Sistema robusto e centralizado para tratamento de erros em toda a aplicação ObrasAI.

## 📋 Visão Geral

Este sistema fornece uma abordagem consistente e escalável para:
- Captura e logging de erros
- Exibição de mensagens amigáveis ao usuário
- Recuperação graceful de falhas
- Monitoramento e debugging

## 🏗️ Arquitetura

```
src/components/error/
├── ErrorBoundary.tsx      # Componente para captura de erros React
├── ErrorFallback.tsx      # UI de fallback para erros
├── index.ts              # Exports centralizados
└── __tests__/
    └── ErrorHandling.test.tsx

src/hooks/
└── useErrorHandler.ts    # Hook principal para tratamento de erros

docs/
├── ERROR_HANDLING_GUIDE.md          # Guia completo de uso
└── ERROR_HANDLING_MIGRATION_GUIDE.md # Guia de migração
```

## 🚀 Início Rápido

### 1. Importação Básica

```typescript
import { ErrorBoundary, useErrorHandler } from '@/components/error';
```

### 2. Uso em Componentes

```typescript
const MeuComponente = () => {
  const { handleError, handleApiError, wrapAsync } = useErrorHandler();

  // Tratar erro simples
  const handleClick = () => {
    try {
      // operação que pode falhar
    } catch (error) {
      handleError(error, {
        context: 'Operação do usuário',
        type: 'validation'
      });
    }
  };

  // Tratar operação assíncrona
  const handleAsyncOperation = wrapAsync(async () => {
    const result = await apiCall();
    return result;
  }, {
    context: 'Chamada de API',
    fallbackMessage: 'Falha na operação'
  });

  return (
    <div>
      <button onClick={handleClick}>Ação</button>
      <button onClick={handleAsyncOperation}>Operação Async</button>
    </div>
  );
};
```

### 3. Envolver com ErrorBoundary

```typescript
const App = () => {
  return (
    <ErrorBoundary>
      <MeuComponente />
    </ErrorBoundary>
  );
};
```

## 📚 Componentes Principais

### ErrorBoundary

Captura erros não tratados na árvore de componentes React.

```typescript
<ErrorBoundary
  fallback={(error, retry) => (
    <div>
      <h2>Erro: {error.message}</h2>
      <button onClick={retry}>Tentar Novamente</button>
    </div>
  )}
>
  <ComponenteQuePodefFalhar />
</ErrorBoundary>
```

**Props:**
- `fallback?`: Função que retorna JSX para exibir quando há erro
- `children`: Componentes filhos a serem protegidos

### useErrorHandler

Hook principal para tratamento de erros.

```typescript
const {
  handleError,      // Tratar erro genérico
  handleApiError,   // Tratar erro de API
  wrapAsync,        // Envolver função assíncrona
  reportCriticalError // Reportar erro crítico
} = useErrorHandler();
```

#### handleError

Trata erros genéricos com contexto.

```typescript
handleError(error, {
  context: 'Descrição da operação',
  type: 'validation' | 'auth' | 'api' | 'generic',
  showToast: true, // padrão: true
  logLevel: 'error' // padrão: 'error'
});
```

#### handleApiError

Trata especificamente erros de API.

```typescript
handleApiError(error, {
  context: 'Chamada de API',
  fallbackMessage: 'Mensagem alternativa',
  retryable: true // padrão: false
});
```

#### wrapAsync

Envolve funções assíncronas com tratamento automático de erro.

```typescript
const operacaoSegura = wrapAsync(async () => {
  return await operacaoRiscosa();
}, {
  context: 'Operação arriscada',
  fallbackMessage: 'Falha na operação',
  showToast: true
});
```

### ErrorFallback

Componente de UI para exibir quando há erros.

```typescript
<ErrorFallback
  error={error}
  retry={() => window.location.reload()}
  showDetails={process.env.NODE_ENV === 'development'}
/>
```

## 🎯 Tipos de Erro

### 1. Erros de Validação
```typescript
handleError(new Error('Campo obrigatório'), {
  context: 'Validação de formulário',
  type: 'validation'
});
```

### 2. Erros de API
```typescript
handleApiError(apiError, {
  context: 'Busca de dados',
  fallbackMessage: 'Falha ao carregar dados'
});
```

### 3. Erros de Autenticação
```typescript
handleError(authError, {
  context: 'Login do usuário',
  type: 'auth'
});
```

### 4. Erros Críticos
```typescript
reportCriticalError(criticalError, {
  context: 'Falha crítica do sistema',
  additionalData: { userId, sessionId }
});
```

## 🔧 Integração com React Query

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['dados'],
  queryFn: wrapAsync(async () => {
    return await api.getDados();
  }, {
    context: 'Carregamento de dados',
    showToast: false // Tratar erro manualmente
  }),
  retry: (failureCount, error) => {
    // Não retry para erros de auth
    if (error?.message?.includes('unauthorized')) {
      return false;
    }
    return failureCount < 2;
  }
});

// Tratar erro manualmente se necessário
if (error) {
  return <ErrorFallback error={error} retry={() => refetch()} />;
}
```

## 📊 Logging e Monitoramento

### Estrutura de Log

Todos os erros são logados com a seguinte estrutura:

```typescript
{
  message: string,           // Mensagem do erro
  context: string,           // Contexto da operação
  type: ErrorType,           // Tipo do erro
  stack?: string,            // Stack trace (apenas em dev)
  timestamp: string,         // Timestamp ISO
  userId?: string,           // ID do usuário (se disponível)
  sessionId?: string,        // ID da sessão
  userAgent?: string,        // User agent do browser
  url?: string,              // URL atual
  additionalData?: object    // Dados adicionais
}
```

### Níveis de Log

- `error`: Erros que impedem funcionalidade
- `warn`: Problemas que não impedem funcionalidade
- `info`: Informações para debugging

## 🧪 Testes

### Executar Testes

```bash
npm run test src/components/error
```

### Exemplo de Teste

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { useErrorHandler } from '@/components/error';

const TestComponent = () => {
  const { handleError } = useErrorHandler();
  
  return (
    <button onClick={() => handleError(new Error('Test error'))}>
      Trigger Error
    </button>
  );
};

test('deve tratar erro corretamente', () => {
  render(<TestComponent />);
  fireEvent.click(screen.getByText('Trigger Error'));
  
  expect(toast.error).toHaveBeenCalledWith('Test error');
});
```

## 🔒 Segurança

### Dados Sensíveis

O sistema automaticamente:
- Remove dados sensíveis dos logs
- Sanitiza stack traces em produção
- Não expõe informações internas do sistema

### Configuração Segura

```typescript
// ❌ Não fazer - expõe dados sensíveis
handleError(error, {
  additionalData: { password: '123456' }
});

// ✅ Fazer - dados seguros
handleError(error, {
  additionalData: { userId: user.id, action: 'login' }
});
```

## 🎨 Customização

### Fallback Personalizado

```typescript
const CustomErrorFallback = ({ error, retry }) => (
  <div className="custom-error">
    <h2>Oops! Algo deu errado</h2>
    <p>{error.message}</p>
    <button onClick={retry}>Tentar Novamente</button>
  </div>
);

<ErrorBoundary fallback={CustomErrorFallback}>
  <App />
</ErrorBoundary>
```

### Configuração Global

```typescript
// Em um provider ou configuração global
const errorConfig = {
  defaultFallbackMessage: 'Algo deu errado',
  showStackTrace: process.env.NODE_ENV === 'development',
  logLevel: 'error',
  enableRetry: true
};
```

## 📈 Melhores Práticas

### 1. Sempre Fornecer Contexto
```typescript
// ❌ Não fazer
handleError(error);

// ✅ Fazer
handleError(error, {
  context: 'Salvamento de formulário de usuário'
});
```

### 2. Usar Tipos Apropriados
```typescript
// ✅ Validação
handleError(error, { type: 'validation' });

// ✅ API
handleApiError(error, { context: 'Busca de dados' });

// ✅ Autenticação
handleError(error, { type: 'auth' });
```

### 3. Envolver Operações Assíncronas
```typescript
// ❌ Não fazer
const handleSubmit = async () => {
  try {
    await api.submit(data);
  } catch (error) {
    handleError(error);
  }
};

// ✅ Fazer
const handleSubmit = wrapAsync(async () => {
  await api.submit(data);
}, {
  context: 'Envio de formulário'
});
```

### 4. Usar ErrorBoundary em Pontos Estratégicos
```typescript
// ✅ No nível da página
<ErrorBoundary>
  <PaginaDashboard />
</ErrorBoundary>

// ✅ Em componentes críticos
<ErrorBoundary>
  <FormularioPagamento />
</ErrorBoundary>
```

## 🔄 Migração

Para migrar componentes existentes, consulte o [Guia de Migração](../../docs/ERROR_HANDLING_MIGRATION_GUIDE.md).

## 📖 Documentação Adicional

- [Guia Completo de Uso](../../docs/ERROR_HANDLING_GUIDE.md)
- [Guia de Migração](../../docs/ERROR_HANDLING_MIGRATION_GUIDE.md)
- [Testes](./src/components/error/__tests__/ErrorHandling.test.tsx)

## 🤝 Contribuição

Ao contribuir com melhorias:

1. Mantenha a compatibilidade com a API existente
2. Adicione testes para novas funcionalidades
3. Atualize a documentação
4. Considere o impacto na performance
5. Garanta que a segurança seja mantida

## 📝 Changelog

### v1.0.0
- Sistema inicial de tratamento de erros
- ErrorBoundary com fallbacks customizáveis
- useErrorHandler com múltiplas funções
- Integração com logging seguro
- Testes abrangentes
- Documentação completa

---

**Desenvolvido para ObrasAI** - Sistema robusto de tratamento de erros para uma melhor experiência do usuário e facilidade de manutenção.