# 📚 Guia de Padrões de Desenvolvimento - ObrasAI

## Visão Geral

Este documento apresenta os padrões de desenvolvimento implementados no ObrasAI para otimização de performance, experiência do usuário e manutenibilidade do código. Os padrões foram desenvolvidos com base em análises de performance e melhores práticas da indústria.

## 🎯 Objetivos dos Padrões

- **Performance**: Reduzir tempos de carregamento e melhorar responsividade
- **UX**: Proporcionar feedback visual consistente e intuitivo
- **Manutenibilidade**: Código mais limpo, reutilizável e testável
- **Monitoramento**: Visibilidade completa sobre performance e comportamento
- **Escalabilidade**: Arquitetura preparada para crescimento

---

## 🏗️ Padrões Implementados

### 1. FormContext Pattern

#### Descrição
Padrão centralizado para gerenciamento de formulários usando React Hook Form com validação Zod e tratamento de estados unificado.

#### Quando Usar
- Formulários com validação complexa
- Formulários multi-etapa (wizards)
- Quando precisar de estado compartilhado entre componentes
- Formulários que requerem auto-save ou persistência

#### Estrutura Básica

```tsx
// 1. Definir o schema de validação
const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  // ... outros campos
});

type FormData = z.infer<typeof formSchema>;

// 2. Componente wrapper com FormProvider
const MeuFormulario: React.FC = () => {
  const defaultValues: FormData = {
    nome: '',
    email: '',
  };

  return (
    <FormProvider
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      <MeuFormularioContent />
    </FormProvider>
  );
};

// 3. Componente interno usando useFormContext
const MeuFormularioContent: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  
  return (
    <form>
      <input {...register('nome')} />
      {errors.nome && <span>{errors.nome.message}</span>}
      {/* ... outros campos */}
    </form>
  );
};
```

#### Benefícios
- ✅ Validação consistente e tipada
- ✅ Estado compartilhado entre componentes
- ✅ Tratamento de erros padronizado
- ✅ Fácil integração com APIs
- ✅ Suporte a formulários multi-etapa

#### Exemplos de Uso
- `NovoFornecedor.tsx` - Formulário simples
- `LeadCaptureForm.tsx` - Formulário wizard
- `EditarDespesa.tsx` - Formulário de edição

---

### 2. useAsyncOperation Hook

#### Descrição
Hook personalizado para gerenciar operações assíncronas com estados de loading, erro e sucesso centralizados.

#### Quando Usar
- Chamadas de API
- Operações que requerem feedback visual
- Quando precisar de tratamento de erro consistente
- Operações que podem ser canceladas

#### Estrutura Básica

```tsx
const {
  executeAsync,
  isLoading,
  error,
  reset
} = useAsyncOperation({
  loadingKey: 'minha-operacao', // Chave única para identificar a operação
  errorMessage: 'Erro ao executar operação', // Mensagem padrão de erro
  onSuccess: (result) => {
    // Callback executado em caso de sucesso
    toast.success('Operação realizada com sucesso!');
  },
  onError: (error) => {
    // Callback executado em caso de erro
    console.error('Erro:', error);
  }
});

// Uso
const handleSubmit = async (data: FormData) => {
  await executeAsync(async () => {
    const result = await api.post('/endpoint', data);
    return result.data;
  });
};
```

#### Benefícios
- ✅ Estados de loading centralizados
- ✅ Tratamento de erro consistente
- ✅ Callbacks de sucesso/erro configuráveis
- ✅ Integração com LoadingContext
- ✅ Cancelamento automático de operações

#### Exemplos de Uso
- Submissão de formulários
- Carregamento de dados
- Upload de arquivos
- Operações de CRUD

---

### 3. LoadingContext

#### Descrição
Contexto global para gerenciar estados de loading em toda a aplicação, com métricas e monitoramento.

#### Quando Usar
- Sempre que houver operações assíncronas
- Para mostrar indicadores de loading globais
- Quando precisar de métricas de performance
- Para debugging de operações lentas

#### Estrutura Básica

```tsx
// 1. Configurar o provider no root da aplicação
<LoadingProvider>
  <App />
</LoadingProvider>

// 2. Usar o hook em componentes
const { isLoading, setLoading, getLoadingMetrics } = useLoading();

// 3. Controlar loading manualmente (se necessário)
const handleOperation = async () => {
  setLoading('minha-operacao', true);
  try {
    await minhaOperacao();
  } finally {
    setLoading('minha-operacao', false);
  }
};

// 4. Acessar métricas
const metrics = getLoadingMetrics();
console.log('Operações ativas:', metrics.activeOperations);
console.log('Tempo médio:', metrics.averageLoadingTime);
```

#### Benefícios
- ✅ Loading states centralizados
- ✅ Métricas de performance automáticas
- ✅ Debugging facilitado
- ✅ Indicadores visuais consistentes
- ✅ Prevenção de múltiplas submissões

---

### 4. WizardComposition Pattern

#### Descrição
Padrão para criar formulários multi-etapa com navegação, validação por etapa e persistência de dados.

#### Quando Usar
- Formulários longos que podem ser divididos
- Processos com múltiplas etapas
- Quando precisar de validação por etapa
- Fluxos com dependências entre etapas

#### Estrutura Básica

```tsx
const steps = [
  {
    id: 'dados-pessoais',
    title: 'Dados Pessoais',
    description: 'Informações básicas',
    component: DadosPessoaisStep,
    validationSchema: dadosPessoaisSchema
  },
  {
    id: 'endereco',
    title: 'Endereço',
    description: 'Informações de localização',
    component: EnderecoStep,
    validationSchema: enderecoSchema
  }
];

const MeuWizard: React.FC = () => {
  return (
    <FormProvider schema={formSchema} defaultValues={defaultValues}>
      <WizardComposition
        steps={steps}
        onComplete={handleComplete}
        enableAutoSave={true}
        showProgress={true}
      />
    </FormProvider>
  );
};
```

#### Benefícios
- ✅ UX melhorada para formulários longos
- ✅ Validação por etapa
- ✅ Auto-save automático
- ✅ Navegação intuitiva
- ✅ Indicador de progresso

---

## 🔧 Ferramentas de Monitoramento

### LoadingMetricsDashboard

Dashboard para visualizar métricas de performance em tempo real.

```tsx
import LoadingMetricsDashboard from '@/components/dashboard/LoadingMetricsDashboard';

// Usar em páginas de admin ou desenvolvimento
<LoadingMetricsDashboard />
```

**Métricas Disponíveis:**
- Operações ativas
- Tempo médio de loading
- Operações mais lentas
- Histórico de performance
- Taxa de erro

### ContinuousMonitoringDashboard

Sistema avançado de monitoramento com alertas e relatórios.

```tsx
import ContinuousMonitoringDashboard from '@/components/dashboard/ContinuousMonitoringDashboard';

// Dashboard completo de monitoramento
<ContinuousMonitoringDashboard />
```

**Funcionalidades:**
- Alertas em tempo real
- Métricas de sistema
- Exportação de relatórios
- Configuração de thresholds
- Histórico de alertas

### AdvancedAIWidget

Widget de IA com análise preditiva e recomendações inteligentes.

```tsx
import AdvancedAIWidget from '@/components/ai/AdvancedAIWidget';

// Widget flutuante de IA
<AdvancedAIWidget />
```

**Funcionalidades:**
- Análise preditiva de métricas
- Recomendações de otimização
- Chat contextual
- Alertas proativos
- Insights baseados em padrões

---

## 📋 Guia de Migração

### Migrando Formulários Existentes

#### Passo 1: Identificar Candidatos
Procure por formulários que usam:
- `useState` para dados do formulário
- `useForm` sem contexto
- Validação manual
- Estados de loading locais

#### Passo 2: Criar Schema de Validação
```tsx
// Antes
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

// Depois
const formSchema = z.object({
  campo1: z.string().min(1, 'Campo obrigatório'),
  campo2: z.number().positive('Deve ser positivo')
});
```

#### Passo 3: Refatorar Componente
```tsx
// Antes
const MeuFormulario = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/endpoint', data);
      toast.success('Sucesso!');
    } catch (error) {
      toast.error('Erro!');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* campos */}
    </form>
  );
};

// Depois
const MeuFormulario = () => {
  return (
    <FormProvider
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      <MeuFormularioContent />
    </FormProvider>
  );
};

const MeuFormularioContent = () => {
  const { register } = useFormContext();
  const { executeAsync, isLoading } = useAsyncOperation({
    loadingKey: 'meu-formulario',
    errorMessage: 'Erro ao salvar'
  });
  
  const handleSubmit = async (data) => {
    await executeAsync(async () => {
      await api.post('/endpoint', data);
    });
  };
  
  return (
    <form>
      {/* campos */}
    </form>
  );
};
```

### Checklist de Migração

- [ ] Schema de validação criado
- [ ] FormProvider implementado
- [ ] useAsyncOperation integrado
- [ ] Estados de loading removidos
- [ ] Tratamento de erro centralizado
- [ ] Testes atualizados
- [ ] Documentação atualizada

---

## 🧪 Testes

### Testando Formulários com FormContext

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider } from '@/contexts/FormContext';

const renderWithFormProvider = (component, options = {}) => {
  const { schema, defaultValues, onSubmit } = options;
  
  return render(
    <FormProvider
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      {component}
    </FormProvider>
  );
};

describe('MeuFormulario', () => {
  it('deve validar campos obrigatórios', async () => {
    const onSubmit = jest.fn();
    
    renderWithFormProvider(<MeuFormulario />, {
      schema: formSchema,
      defaultValues: {},
      onSubmit
    });
    
    fireEvent.click(screen.getByText('Salvar'));
    
    await waitFor(() => {
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

### Testando useAsyncOperation

```tsx
import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

describe('useAsyncOperation', () => {
  it('deve gerenciar estados de loading corretamente', async () => {
    const { result } = renderHook(() => 
      useAsyncOperation({ loadingKey: 'test' })
    );
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.executeAsync(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      });
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

---

## 🚀 Melhores Práticas

### Performance

1. **Lazy Loading**: Use React.lazy para componentes pesados
```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

2. **Memoização**: Use React.memo para componentes que re-renderizam frequentemente
```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  // componente pesado
});
```

3. **Debounce**: Use debounce em inputs de busca
```tsx
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

### Acessibilidade

1. **Labels**: Sempre use labels em formulários
```tsx
<label htmlFor="nome">Nome</label>
<input id="nome" {...register('nome')} />
```

2. **ARIA**: Use atributos ARIA para estados
```tsx
<button aria-loading={isLoading} disabled={isLoading}>
  {isLoading ? 'Carregando...' : 'Salvar'}
</button>
```

3. **Foco**: Gerencie o foco em modais e wizards
```tsx
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);
```

### Segurança

1. **Validação**: Sempre valide no frontend E backend
2. **Sanitização**: Sanitize dados antes de exibir
3. **HTTPS**: Use HTTPS em produção
4. **Tokens**: Gerencie tokens de forma segura

---

## 📊 Métricas e KPIs

### Métricas de Performance
- Tempo médio de carregamento < 2s
- Taxa de erro < 1%
- Tempo de resposta da API < 500ms
- Score de acessibilidade > 95

### Métricas de UX
- Taxa de conclusão de formulários > 85%
- Tempo médio de preenchimento
- Taxa de abandono por etapa
- Satisfação do usuário

### Métricas de Desenvolvimento
- Cobertura de testes > 80%
- Tempo de build < 2min
- Número de bugs em produção
- Tempo de resolução de issues

---

## 🔄 Roadmap

### Próximas Implementações

1. **Q1 2024**
   - [ ] Testes automatizados para todos os padrões
   - [ ] Documentação interativa
   - [ ] Métricas avançadas de UX

2. **Q2 2024**
   - [ ] Padrões para mobile
   - [ ] Integração com analytics
   - [ ] A/B testing framework

3. **Q3 2024**
   - [ ] Padrões de micro-frontends
   - [ ] Otimizações de bundle
   - [ ] PWA capabilities

### Melhorias Contínuas
- Monitoramento de performance em produção
- Feedback dos desenvolvedores
- Análise de métricas de uso
- Atualizações baseadas em novas tecnologias

---

## 📞 Suporte

### Canais de Comunicação
- **Slack**: #dev-patterns
- **Email**: dev-team@obrasai.com
- **Issues**: GitHub Issues
- **Documentação**: Wiki interno

### Contribuindo
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões
4. Adicione testes
5. Atualize a documentação
6. Abra um Pull Request

---

## 📚 Recursos Adicionais

### Links Úteis
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Testing Library Documentation](https://testing-library.com/)

### Exemplos Completos
- `src/components/examples/IntegratedPatternsDemo.tsx`
- `src/components/examples/RefactoredFormExample.tsx`
- `src/components/forms/LeadCaptureForm.tsx`

### Ferramentas de Desenvolvimento
- React DevTools
- Redux DevTools (se aplicável)
- Performance Profiler
- Accessibility Inspector

---

*Última atualização: Dezembro 2024*
*Versão: 1.0.0*
*Mantido por: Equipe de Desenvolvimento ObrasAI*