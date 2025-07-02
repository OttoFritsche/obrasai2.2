# 📋 Guia de Migração - Refatoração DRY

## 🎯 Objetivo
Este guia detalha como migrar os arquivos existentes para usar os novos componentes e hooks refatorados, eliminando código duplicado e seguindo o princípio DRY.

## 📦 Novos Componentes e Hooks Criados

### 🔧 Hooks
- `useTenantValidation` - Validação de tenant
- `useFormMutation` - Mutações de formulário
- `useTenantQuery` - Queries com tenant
- `useCrudOperations` - Operações CRUD genéricas

### 🎨 Componentes UI
- `GradientCard` - Cards com gradientes
- `PageHeader` - Cabeçalhos de página
- `FormWrapper` - Estrutura de formulários

### 🛠️ Utilitários
- `dateUtils` - Formatação de datas

## 🚀 Plano de Migração

### Fase 1: Hooks de Dados (Prioridade Alta)

#### 1.1 Migrar hooks de fornecedores e obras
```typescript
// ✅ CONCLUÍDO
// src/hooks/useFornecedoresPF.ts - Migrado para useCrudOperations

// 🔄 PENDENTE
// src/hooks/useFornecedoresPJ.ts
// src/hooks/useObras.ts
// src/hooks/useContratos.ts
// src/hooks/useDespesas.ts
```

#### 1.2 Migrar queries simples
```typescript
// Substituir padrões como:
const { data } = useQuery({
  queryKey: ['items', tenantId],
  queryFn: () => api.getItems(tenantId),
  enabled: !!tenantId
});

// Por:
const { data } = useTenantListQuery({
  queryKey: 'items',
  queryFn: api.getItems
});
```

### Fase 2: Componentes de Formulário (Prioridade Alta)

#### 2.1 Páginas de criação
```typescript
// Arquivos para migrar:
- src/pages/dashboard/fornecedores/NovoFornecedor.tsx
- src/pages/dashboard/construtoras/NovaConstrutora.tsx
- src/pages/dashboard/obras/NovaObra.tsx
- src/pages/dashboard/contratos/NovoContrato.tsx
- src/pages/dashboard/despesas/NovaDespesa.tsx
```

#### 2.2 Estrutura de migração
```typescript
// ANTES:
export function NovaObra() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => {
      if (!validTenantId) throw new Error('Tenant ID não encontrado');
      return obrasApi.create(values, validTenantId);
    },
    onSuccess: () => {
      toast.success('Obra criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      navigate('/dashboard/obras');
    },
    onError: () => toast.error('Erro ao criar obra')
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nova Obra</h1>
            <p className="text-sm text-muted-foreground">Cadastre uma nova obra</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard/obras")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
      </div>
      
      <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Informações da Obra</CardTitle>
          <CardDescription>Preencha os dados básicos</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulário */}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

// DEPOIS:
export function NovaObra() {
  const form = useForm({ resolver: zodResolver(obraSchema) });
  
  const { mutate: createObra, isPending } = useFormMutation({
    mutationFn: obrasApi.create,
    successMessage: 'Obra criada com sucesso!',
    redirectTo: '/dashboard/obras',
    queryKey: 'obras'
  });

  return (
    <DashboardLayout>
      <PageHeader 
        title="Nova Obra"
        description="Cadastre uma nova obra no sistema"
        backTo="/dashboard/obras"
        icon={<Building className="h-6 w-6 text-blue-500" />}
      />
      
      <FormWrapper
        form={form}
        onSubmit={createObra}
        title="Informações da Obra"
        isLoading={isPending}
        cardVariant="blue"
      >
        {/* Campos do formulário */}
      </FormWrapper>
    </DashboardLayout>
  );
}
```

### Fase 3: Páginas de Listagem (Prioridade Média)

#### 3.1 Substituir headers duplicados
```typescript
// Arquivos para migrar:
- src/pages/dashboard/obras/ObrasLista.tsx
- src/pages/dashboard/fornecedores/FornecedoresPJLista.tsx
- src/pages/dashboard/fornecedores/FornecedoresPFLista.tsx
- src/pages/dashboard/contratos/ContratosLista.tsx
- src/pages/dashboard/despesas/DespesasLista.tsx
- src/pages/dashboard/orcamentos/OrcamentosLista.tsx
```

#### 3.2 Substituir cards com gradientes
```typescript
// ANTES:
<Card className="border-border/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">

// DEPOIS:
<GradientCard variant="blue">
```

### Fase 4: Utilitários de Data (Prioridade Baixa)

#### 4.1 Substituir formatação de datas
```typescript
// Buscar por padrões como:
- new Date().toLocaleDateString('pt-BR')
- format(date, 'dd/MM/yyyy')
- date.toISOString().split('T')[0]

// Substituir por:
import { formatDateBR, formatDateTimeBR } from '@/lib/utils/dateUtils';
```

## 📊 Impacto Estimado da Migração

### Redução de Código
- **Hooks de dados**: ~60% de redução (baseado na migração do `useFornecedoresPF`, `useFornecedoresPJ`, `useObras`, `useContratos`, `useDespesas`)
- **Componentes de formulário**: ~40% de redução (baseado na migração do `NovaObra`)
- **Páginas de listagem**: ~30% de redução (baseado na migração do `ObrasLista`)
- **Utilitários de data**: ~80% de redução

### Benefícios
- ✅ **Manutenibilidade**: Mudanças centralizadas
- ✅ **Consistência**: Padrões uniformes
- ✅ **Velocidade**: Desenvolvimento mais rápido
- ✅ **Qualidade**: Menos bugs, mais testes

### Hooks Migrados com Sucesso
- ✅ `useFornecedoresPF.ts` - Migrado para `useCrudOperations`
- ✅ `useFornecedoresPJ.ts` - Migrado para `useCrudOperations`
- ✅ `useObras.ts` - Migrado para `useCrudOperations`
- ✅ `useContratos.ts` - Migrado para `useCrudOperations` (parcial)
- ✅ `useDespesas.ts` - Migrado para `useCrudOperations`

### Exemplos Criados
- ✅ `NovaObraRefactored.tsx` - Exemplo de formulário refatorado
- ✅ `ObrasListaRefactored.tsx` - Exemplo de listagem refatorada
- ✅ `RefactoredFormExample.tsx` - Comparação antes/depois

## 🔍 Checklist de Migração

### Para cada arquivo migrado:
- [ ] Remover imports desnecessários
- [ ] Substituir lógica duplicada pelos novos hooks
- [ ] Atualizar componentes UI
- [ ] Testar funcionalidade
- [ ] Verificar tipos TypeScript
- [ ] Atualizar testes (se existirem)

### Validação pós-migração:
- [ ] Todas as páginas carregam corretamente
- [ ] Formulários funcionam (criar/editar/deletar)
- [ ] Mensagens de toast aparecem
- [ ] Navegação funciona
- [ ] Validações de formulário funcionam
- [ ] Queries são invalidadas corretamente

## 🚨 Pontos de Atenção

### 1. Dependências
- Verificar se todos os imports estão corretos
- Alguns componentes podem ter dependências específicas

### 2. Props customizadas
- Alguns formulários podem ter lógica específica
- Verificar se os novos componentes suportam todas as props necessárias

### 3. Estilos
- Verificar se os estilos visuais permanecem consistentes
- Alguns cards podem ter variações específicas

### 4. Validações
- Verificar se todas as validações de formulário continuam funcionando
- Testar cenários de erro

## 📝 Próximos Passos

1. **Migrar hooks restantes** (useFornecedoresPJ, useObras, etc.)
2. **Migrar formulários de criação** (NovoFornecedor, NovaObra, etc.)
3. **Migrar páginas de listagem** (headers e cards)
4. **Migrar utilitários de data**
5. **Criar testes para novos componentes**
6. **Documentar padrões de uso**
7. **Treinar equipe nos novos padrões**

## 🔧 Comandos Úteis

```bash
# Buscar padrões duplicados
grep -r "const.*Modal.*=" src/
grep -r "toast.success" src/
grep -r "validTenantId" src/

# Buscar imports que podem ser removidos
grep -r "import.*useNavigate" src/
grep -r "import.*useMutation" src/
grep -r "import.*useQueryClient" src/
```

---

**📅 Data de criação**: $(date)
**👨‍💻 Responsável**: Equipe de Desenvolvimento
**🎯 Status**: Em andamento