# Guia de Migração para o Sistema de Tratamento de Erros

Este guia demonstra como migrar componentes existentes para usar o novo sistema de tratamento de erros do ObrasAI.

## Exemplo Prático: Migração do EnviarNota.tsx

Usamos o componente `EnviarNota.tsx` como exemplo para demonstrar a aplicação completa do sistema de tratamento de erros.

### Antes vs Depois

#### ❌ Antes (Tratamento Básico)

```typescript
// Imports básicos
import { toast } from "sonner";

// Query sem tratamento de erro robusto
const { data: obras, isLoading: isLoadingObras } = useQuery({
  queryKey: ["obras"],
  queryFn: obrasApi.getAll,
});

// Submit com tratamento básico
const onSubmit = (values: NotaFiscalFormValues) => {
  if (!selectedFile) {
    toast.error("Por favor, selecione um arquivo para a nota fiscal.");
    return;
  }

  createNotaFiscal.mutate(
    { notaFiscal: values, file: selectedFile },
    {
      onSuccess: () => {
        toast.success("Nota fiscal enviada com sucesso!");
        navigate("/dashboard/notas");
      },
      onError: (error) => {
        toast.error("Erro ao enviar nota fiscal. Tente novamente.");
        console.error("Error creating nota fiscal:", error);
      },
    }
  );
};

// Validação de arquivo básica
if (!allowedTypes.includes(file.type)) {
  toast.error("Tipo de arquivo não suportado. Use PDF, XML, JPG ou PNG.");
  return;
}
```

#### ✅ Depois (Sistema Robusto)

```typescript
// Imports do sistema de tratamento de erros
import { ErrorBoundary, useErrorHandler } from "@/components/error";

// Hook de tratamento de erros
const { handleError, handleApiError, wrapAsync } = useErrorHandler();

// Query com tratamento robusto
const { data: obras, isLoading: isLoadingObras, error: obrasError } = useQuery({
  queryKey: ["obras"],
  queryFn: wrapAsync(obrasApi.getAll, {
    context: 'Carregamento de obras',
    showToast: false
  }),
  retry: (failureCount, error) => {
    if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
      return false;
    }
    return failureCount < 2;
  },
});

// Submit com tratamento robusto
const onSubmit = wrapAsync(async (values: NotaFiscalFormValues) => {
  if (!selectedFile) {
    handleError(new Error("Por favor, selecione um arquivo para a nota fiscal."), {
      context: 'Validação de arquivo',
      type: 'validation'
    });
    return;
  }

  try {
    await new Promise((resolve, reject) => {
      createNotaFiscal.mutate(
        { notaFiscal: values, file: selectedFile },
        {
          onSuccess: () => {
            toast.success("Nota fiscal enviada com sucesso!");
            navigate("/dashboard/notas");
            resolve(undefined);
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  } catch (error) {
    handleApiError(error, {
      context: 'Envio de nota fiscal',
      fallbackMessage: 'Erro ao enviar nota fiscal. Tente novamente.'
    });
  }
}, {
  context: 'Envio de nota fiscal'
});

// Validação com tratamento robusto
const handleFileChange = useCallback((file: File | null) => {
  try {
    if (file) {
      const allowedTypes = ["application/pdf", "text/xml", "image/jpeg", "image/png"];
      const maxSize = 10 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Tipo de arquivo não suportado. Use PDF, XML, JPG ou PNG.");
      }
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. O limite é ${(maxSize / 1024 / 1024).toFixed(0)} MB.`);
      }

      form.setValue("arquivo", file, { shouldValidate: true }); 
      setSelectedFile(file);
    }
  } catch (error) {
    handleError(error, {
      context: 'Seleção de arquivo',
      type: 'validation'
    });
  }
}, [form, handleError]);

// Componente envolvido com ErrorBoundary
const EnviarNotaWithErrorHandling = () => {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <DashboardLayout>
          {/* UI de fallback personalizada */}
        </DashboardLayout>
      )}
    >
      <EnviarNotaContent />
    </ErrorBoundary>
  );
};
```

## Passo a Passo da Migração

### 1. Importar o Sistema de Tratamento de Erros

```typescript
import { ErrorBoundary, useErrorHandler } from "@/components/error";
```

### 2. Configurar o Hook de Tratamento de Erros

```typescript
const { handleError, handleApiError, wrapAsync } = useErrorHandler();
```

### 3. Migrar Queries do React Query

#### Antes:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["key"],
  queryFn: apiFunction,
});
```

#### Depois:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["key"],
  queryFn: wrapAsync(apiFunction, {
    context: 'Descrição da operação',
    showToast: false // ou true se quiser toast automático
  }),
  retry: (failureCount, error) => {
    // Lógica de retry personalizada
    if (error?.message?.includes('auth')) {
      return false; // Não retry para erros de auth
    }
    return failureCount < 2;
  },
});
```

### 4. Migrar Funções Assíncronas

#### Antes:
```typescript
const handleSubmit = async (data) => {
  try {
    await apiCall(data);
    toast.success("Sucesso!");
  } catch (error) {
    toast.error("Erro!");
    console.error(error);
  }
};
```

#### Depois:
```typescript
const handleSubmit = wrapAsync(async (data) => {
  await apiCall(data);
  toast.success("Sucesso!");
}, {
  context: 'Envio de dados',
  fallbackMessage: 'Erro ao enviar dados'
});
```

### 5. Migrar Validações

#### Antes:
```typescript
if (!isValid) {
  toast.error("Dados inválidos");
  return;
}
```

#### Depois:
```typescript
if (!isValid) {
  handleError(new Error("Dados inválidos"), {
    context: 'Validação de formulário',
    type: 'validation'
  });
  return;
}
```

### 6. Adicionar Tratamento de Estados de Erro

```typescript
// Verificar erros de carregamento
if (obrasError || fornecedoresError) {
  return (
    <DashboardLayout>
      <div className="text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar os dados necessários.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Voltar</Button>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### 7. Envolver com ErrorBoundary

```typescript
const ComponenteContent = () => {
  // Lógica do componente
};

const ComponenteWithErrorHandling = () => {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <DashboardLayout>
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Erro inesperado</h3>
              <p className="text-muted-foreground text-sm">
                Ocorreu um erro inesperado.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Voltar
              </Button>
              <Button onClick={retry}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </DashboardLayout>
      )}
    >
      <ComponenteContent />
    </ErrorBoundary>
  );
};

export default ComponenteWithErrorHandling;
```

## Benefícios da Migração

### 1. **Logging Centralizado**
- Todos os erros são automaticamente logados com contexto
- Informações estruturadas para debugging
- Logs seguros (sem exposição de dados sensíveis)

### 2. **UX Consistente**
- Mensagens de erro padronizadas
- Fallbacks visuais consistentes
- Recuperação graceful de erros

### 3. **Manutenibilidade**
- Código de tratamento de erro reutilizável
- Menos duplicação de código
- Padrões consistentes em toda a aplicação

### 4. **Monitoramento**
- Erros categorizados por tipo e contexto
- Métricas de erro estruturadas
- Facilita integração com ferramentas de monitoramento

### 5. **Desenvolvimento**
- Debugging mais eficiente
- Informações detalhadas em desenvolvimento
- Stack traces preservados

## Checklist de Migração

- [ ] Importar `ErrorBoundary` e `useErrorHandler`
- [ ] Configurar hook de tratamento de erros
- [ ] Migrar todas as queries do React Query
- [ ] Migrar funções assíncronas com `wrapAsync`
- [ ] Migrar validações com `handleError`
- [ ] Adicionar tratamento de estados de erro
- [ ] Envolver componente com `ErrorBoundary`
- [ ] Testar cenários de erro
- [ ] Verificar logs em desenvolvimento
- [ ] Documentar comportamentos específicos

## Padrões Específicos por Tipo de Componente

### Páginas de Dashboard
```typescript
// Sempre usar ErrorBoundary no nível da página
// Tratar erros de carregamento de dados
// Fornecer navegação de volta
```

### Formulários
```typescript
// Usar handleError para validações
// Usar wrapAsync para submissões
// Tratar erros de API específicos
```

### Componentes de Lista
```typescript
// Tratar estados vazios vs erros
// Fornecer opções de retry
// Manter estado de carregamento
```

### Modais e Dialogs
```typescript
// Usar SimpleErrorFallback para erros menores
// Manter contexto do modal
// Permitir fechamento em caso de erro
```

Este guia fornece uma base sólida para migrar qualquer componente existente para o novo sistema de tratamento de erros, garantindo consistência e robustez em toda a aplicação.